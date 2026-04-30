import { ScreenShell } from '@/components/layout/screen-shell';
import { ProgressDashboard } from '@/features/progress/components/progress-dashboard';

export default function ProgressScreen() {
  return (
    <ScreenShell
      title="Progress"
      eyebrow="Scoreboard"
      subtitle="See exercise-by-exercise strength trends and total training volume across your saved logs.">
      <ProgressDashboard />
    </ScreenShell>
  );
}
