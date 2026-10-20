import { getMilestonesAction } from '@/features/timeline/actions';
import { TimelineView } from '@/features/timeline/components/timeline-view';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const milestones = await getMilestonesAction();

  return <TimelineView initialMilestones={milestones} />;
}
