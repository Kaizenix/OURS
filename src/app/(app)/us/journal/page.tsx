import { getJournalsAction } from '@/features/journal/actions';
import { JournalView } from '@/features/journal/components/journal-view';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const journals = await getJournalsAction();

  return <JournalView initialJournals={journals} />;
}
