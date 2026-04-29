import { HomeOverview } from '@/features/home/components/home-overview';
import { ScreenShell } from '@/components/layout/screen-shell';

export default function TodayScreen() {
  return (
    <ScreenShell
      title="Today"
      eyebrow="Daily Command"
      subtitle="Your home screen for training focus, recovery rhythm, and the next move.">
      <HomeOverview />
    </ScreenShell>
  );
}
