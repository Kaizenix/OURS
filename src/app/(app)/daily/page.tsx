import { getDailyPageData } from '@/features/daily/actions';
import { DailyView } from '@/features/daily/components/daily-view';

export const dynamic = 'force-dynamic';

export default async function DailyPage() {
  const data = await getDailyPageData();

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading daily connection...
      </div>
    );
  }

  return <DailyView data={data} />;
}
