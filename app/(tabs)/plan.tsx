import { ScreenShell } from '@/components/layout/screen-shell';
import { WorkoutPlanBuilder } from '@/features/planner/components/workout-plan-builder';
import { WeeklyPlanner } from '@/features/planner/components/weekly-planner';

export default function PlanScreen() {
  return (
    <ScreenShell
      title="Plan"
      eyebrow="Weekly Split"
      subtitle="Build a repeating weekly schedule with single exercises or full plans dropped into each day.">
      <WorkoutPlanBuilder />
      <WeeklyPlanner />
    </ScreenShell>
  );
}
