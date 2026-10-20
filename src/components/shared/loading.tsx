import { cn } from 'cn';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-muted/50', className)} />
  );
}

export function PageLoading() {
  return (
    <div className="p-4 space-y-4">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-4 w-32" />
      <div className="space-y-3 mt-6">
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
