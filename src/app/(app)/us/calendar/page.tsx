import { getCalendarEventsAction } from '@/features/calendar/actions';
import { CalendarView } from '@/features/calendar/components/calendar-view';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const events = await getCalendarEventsAction();

  return <CalendarView initialEvents={events} />;
}
