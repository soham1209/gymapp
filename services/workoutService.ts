import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { getDb, isFirebaseConfigured } from '@/services/firebase';
import type { UserWorkoutData, WeeklySchedule, WorkoutLog, WorkoutPlan } from '@/types/workout';

type SyncEntity = 'workoutPlans' | 'weeklySchedule' | 'workoutLogs';

type PendingWrite =
  | { type: 'workoutPlans'; userId: string; payload: WorkoutPlan[] }
  | { type: 'weeklySchedule'; userId: string; payload: WeeklySchedule[] }
  | { type: 'workoutLogs'; userId: string; payload: WorkoutLog[] };

const STORAGE_PREFIX = '@gymapp/workouts';
const CACHE_VERSION = 1;
const cacheKeys = {
  workoutPlans: (userId: string) => `${STORAGE_PREFIX}/${userId}/workoutPlans`,
  weeklySchedule: (userId: string) => `${STORAGE_PREFIX}/${userId}/weeklySchedule`,
  workoutLogs: (userId: string) => `${STORAGE_PREFIX}/${userId}/workoutLogs`,
  pendingWrites: `${STORAGE_PREFIX}/pendingWrites`,
};

let isSyncing = false;
let syncStarted = false;

function getEntityCollectionPath(userId: string, entity: SyncEntity) {
  return `users/${userId}/${entity}`;
}

async function readCache<T>(key: string, fallback: T): Promise<T> {
  const cached = await AsyncStorage.getItem(key);

  if (!cached) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(cached) as { version: number; data: T };
    return parsed.data ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeCache<T>(key: string, data: T) {
  await AsyncStorage.setItem(
    key,
    JSON.stringify({
      version: CACHE_VERSION,
      updatedAt: new Date().toISOString(),
      data,
    }),
  );
}

async function getPendingWrites() {
  return readCache<PendingWrite[]>(cacheKeys.pendingWrites, []);
}

async function setPendingWrites(pendingWrites: PendingWrite[]) {
  await writeCache(cacheKeys.pendingWrites, pendingWrites);
}

async function enqueuePendingWrite(write: PendingWrite) {
  const pendingWrites = await getPendingWrites();
  const filtered = pendingWrites.filter(
    (item) => !(item.userId === write.userId && item.type === write.type),
  );

  filtered.push(write);
  await setPendingWrites(filtered);
}

async function isOnline() {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function replaceCollection<T extends { id: string }>(
  userId: string,
  entity: SyncEntity,
  items: T[],
) {
  const db = getDb();
  const existingDocs = await getDocs(collection(db, getEntityCollectionPath(userId, entity)));
  const batch = writeBatch(db);

  existingDocs.forEach((snapshot) => batch.delete(snapshot.ref));

  items.forEach((item) => {
    const ref = doc(db, getEntityCollectionPath(userId, entity), item.id);
    batch.set(ref, {
      ...item,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

async function replaceWeeklySchedule(userId: string, schedules: WeeklySchedule[]) {
  const db = getDb();
  const existingDocs = await getDocs(collection(db, getEntityCollectionPath(userId, 'weeklySchedule')));
  const batch = writeBatch(db);

  existingDocs.forEach((snapshot) => batch.delete(snapshot.ref));

  schedules.forEach((schedule) => {
    const ref = doc(db, getEntityCollectionPath(userId, 'weeklySchedule'), schedule.day);
    batch.set(ref, {
      ...schedule,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

async function pushToRemote(write: PendingWrite) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* variables first.');
  }

  switch (write.type) {
    case 'workoutPlans':
      await replaceCollection(write.userId, 'workoutPlans', write.payload);
      return;
    case 'weeklySchedule':
      await replaceWeeklySchedule(write.userId, write.payload);
      return;
    case 'workoutLogs':
      await replaceCollection(write.userId, 'workoutLogs', write.payload);
      return;
  }
}

async function syncPendingWrites() {
  if (isSyncing || !(await isOnline())) {
    return;
  }

  isSyncing = true;

  try {
    const pendingWrites = await getPendingWrites();
    const remaining: PendingWrite[] = [];

    for (const write of pendingWrites) {
      try {
        await pushToRemote(write);
      } catch {
        remaining.push(write);
      }
    }

    await setPendingWrites(remaining);
  } finally {
    isSyncing = false;
  }
}

function startSyncListener() {
  if (syncStarted) {
    return;
  }

  syncStarted = true;
  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void syncPendingWrites();
    }
  });
}

async function saveEntity<T>(
  key: string,
  write: PendingWrite,
  payload: T,
) {
  await writeCache(key, payload);
  await enqueuePendingWrite(write);
  await syncPendingWrites();
}

async function fetchRemoteCollection<T>(userId: string, entity: SyncEntity): Promise<T[]> {
  const db = getDb();
  const snapshot = await getDocs(collection(db, getEntityCollectionPath(userId, entity)));

  return snapshot.docs.map((item) => item.data() as T);
}

async function fetchRemoteUserData(userId: string): Promise<UserWorkoutData> {
  const [workoutPlans, weeklySchedule, workoutLogs] = await Promise.all([
    fetchRemoteCollection<WorkoutPlan>(userId, 'workoutPlans'),
    fetchRemoteCollection<WeeklySchedule>(userId, 'weeklySchedule'),
    fetchRemoteCollection<WorkoutLog>(userId, 'workoutLogs'),
  ]);

  return {
    workoutPlans,
    weeklySchedule,
    workoutLogs,
  };
}

export const workoutService = {
  async saveWorkoutPlans(userId: string, workoutPlans: WorkoutPlan[]) {
    await saveEntity(cacheKeys.workoutPlans(userId), { type: 'workoutPlans', userId, payload: workoutPlans }, workoutPlans);
    return workoutPlans;
  },

  async saveWeeklySchedule(userId: string, weeklySchedule: WeeklySchedule[]) {
    await saveEntity(
      cacheKeys.weeklySchedule(userId),
      { type: 'weeklySchedule', userId, payload: weeklySchedule },
      weeklySchedule,
    );
    return weeklySchedule;
  },

  async saveWorkoutLogs(userId: string, workoutLogs: WorkoutLog[]) {
    await saveEntity(cacheKeys.workoutLogs(userId), { type: 'workoutLogs', userId, payload: workoutLogs }, workoutLogs);
    return workoutLogs;
  },

  async fetchUserData(userId: string): Promise<UserWorkoutData> {
    const cachedData: UserWorkoutData = {
      workoutPlans: await readCache(cacheKeys.workoutPlans(userId), []),
      weeklySchedule: await readCache(cacheKeys.weeklySchedule(userId), []),
      workoutLogs: await readCache(cacheKeys.workoutLogs(userId), []),
    };

    if (!isFirebaseConfigured || !(await isOnline())) {
      return cachedData;
    }

    try {
      const remoteData = await fetchRemoteUserData(userId);

      await Promise.all([
        writeCache(cacheKeys.workoutPlans(userId), remoteData.workoutPlans),
        writeCache(cacheKeys.weeklySchedule(userId), remoteData.weeklySchedule),
        writeCache(cacheKeys.workoutLogs(userId), remoteData.workoutLogs),
      ]);

      return remoteData;
    } catch {
      return cachedData;
    }
  },

  async syncNow() {
    await syncPendingWrites();
  },

  async clearLocalCache(userId: string) {
    await Promise.all([
      AsyncStorage.removeItem(cacheKeys.workoutPlans(userId)),
      AsyncStorage.removeItem(cacheKeys.weeklySchedule(userId)),
      AsyncStorage.removeItem(cacheKeys.workoutLogs(userId)),
    ]);
  },
};

startSyncListener();

export type WorkoutService = typeof workoutService;
