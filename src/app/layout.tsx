import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PwaRegister } from '@/components/shared/pwa-register';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OURS — A place that\'s only ours',
  description: 'Talk, remember, grow, and build your story together.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OURS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1614' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} dark h-full antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <TooltipProvider>
          <PwaRegister />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
