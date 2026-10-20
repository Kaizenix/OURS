import { getOurStoryData } from '@/features/profile/actions';
import { OurStoryView } from '@/features/profile/components/our-story-view';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const data = await getOurStoryData();

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading our story...
      </div>
    );
  }

  return <OurStoryView data={data} />;
}
