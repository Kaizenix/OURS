import { getNotesAction } from '@/features/notes/actions';
import { NotesView } from '@/features/notes/components/notes-view';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const data = await getNotesAction();

  return <NotesView data={data} />;
}
