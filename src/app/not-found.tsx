import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-serif mb-2">Lost?</h1>
      <p className="text-muted-foreground mb-6">This page doesn&apos;t exist.</p>
      <Link
        href="/home"
        className="text-sm text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}
