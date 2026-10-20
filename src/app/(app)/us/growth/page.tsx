import { getRelationshipGrowthAction } from '@/features/growth/actions';
import { GrowthView } from '@/features/growth/components/growth-view';

export const dynamic = 'force-dynamic';

export default async function GrowthPage() {
  const metrics = await getRelationshipGrowthAction();

  if (!metrics) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading growth reflections...
      </div>
    );
  }

  return <GrowthView metrics={metrics} />;
}
