import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getDisposableRoomByCodeAction,
  getEphemeralMessagesAction,
  getSharedMemoriesForRoomAction,
} from '@/features/rooms/actions';
import { GuestRoomContainer } from '@/features/rooms/components/guest-room-container';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function DisposableRoomPage({ params }: PageProps) {
  const { code } = await params;
  const room = await getDisposableRoomByCodeAction(code);

  if (!room || room.is_revoked || new Date(room.expires_at) <= new Date()) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-background text-foreground select-none">
        <div className="max-w-md w-full text-center p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold">Room Tidak Ditemukan / Kedaluwarsa</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link obrolan ini sudah ditarik oleh host, telah kedaluwarsa setelah 24 jam, atau kodenya salah.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Halaman Utama</span>
          </Link>
        </div>
      </div>
    );
  }

  // Check if current visitor is authenticated (host)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentUser = null;
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .maybeSingle();

    if (p) {
      currentUser = {
        id: p.id,
        display_name: p.display_name || 'Host',
      };
    }
  }

  const [initialMessages, sharedMemories] = await Promise.all([
    getEphemeralMessagesAction(room.id),
    getSharedMemoriesForRoomAction(room.couple_id),
  ]);

  return (
    <GuestRoomContainer
      room={room}
      initialMessages={initialMessages}
      sharedMemories={sharedMemories}
      currentUser={currentUser}
    />
  );
}
