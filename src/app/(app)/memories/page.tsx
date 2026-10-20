import { getMemoriesAction } from '@/features/memories/actions';
import { MemoriesView } from '@/features/memories/components/memories-view';

export const dynamic = 'force-dynamic';

export default async function MemoriesPage() {
  const memories = await getMemoriesAction();

  return <MemoriesView initialMemories={memories} />;
}
