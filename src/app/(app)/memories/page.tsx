import { getMemoriesAction } from '@/features/memories/actions';
import { PhotoboothArchiveView } from '@/features/memories/components/photobooth-archive-view';

export const dynamic = 'force-dynamic';

export default async function MemoriesPage() {
  const memories = await getMemoriesAction();

  return <PhotoboothArchiveView initialMemories={memories} />;
}
