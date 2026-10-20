import { Suspense } from 'react';
import { getChatInitialData } from '@/features/chat/actions';
import { ChatContainer } from '@/features/chat/components/chat-container';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const data = await getChatInitialData();

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading chat space...
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden md:p-4">
      <Suspense fallback={<div className="p-6 text-center text-xs text-muted-foreground">Loading chat...</div>}>
        <ChatContainer
          coupleId={data.coupleId}
          userProfile={data.userProfile}
          partnerProfile={data.partnerProfile}
          initialMessages={data.initialMessages}
        />
      </Suspense>
    </div>
  );
}
