import { ScreenShell } from '@/components/layout/screen-shell';
import { TodayWorkout } from '@/features/today/components/today-workout';

export default function TodayScreen() {
  return (
    <ScreenShell
      title="Today"
      eyebrow="Daily Command"
      subtitle="See the current day, load the assigned work automatically, and move through it with a bold checklist.">
      <TodayWorkout />
    </ScreenShell>
  );
}
