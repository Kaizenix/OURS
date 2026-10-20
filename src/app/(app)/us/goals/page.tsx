import { getGoalsAction } from '@/features/goals/actions';
import { GoalsView } from '@/features/goals/components/goals-view';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const goals = await getGoalsAction();

  return <GoalsView initialGoals={goals} />;
}
