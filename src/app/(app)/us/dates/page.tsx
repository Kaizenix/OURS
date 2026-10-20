import { getDatePlansAction } from '@/features/dates/actions';
import { DatePlansView } from '@/features/dates/components/date-plans-view';

export const dynamic = 'force-dynamic';

export default async function DatesPage() {
  const plans = await getDatePlansAction();

  return <DatePlansView initialPlans={plans} />;
}
