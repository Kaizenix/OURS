import { getTalkTopicsAction } from '@/features/talk/actions';
import { TalkSpaceView } from '@/features/talk/components/talk-space-view';

export const dynamic = 'force-dynamic';

export default async function TalkPage() {
  const topics = await getTalkTopicsAction();

  return <TalkSpaceView initialTopics={topics} />;
}
