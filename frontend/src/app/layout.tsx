import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { SmoothScrollProvider } from '@/components/landing/SmoothScrollProvider';
import { APP_NAME } from '@/lib/constants';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: `${APP_NAME} — Enterprise AI Hiring Platform`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'NEXHIRE AI is the enterprise AI-powered hiring platform built on Oracle Database 26ai — resume intelligence, semantic search, and ranking at scale.',
  applicationName: APP_NAME,
  keywords: [
    'ATS',
    'AI hiring',
    'recruitment',
    'resume parsing',
    'semantic search',
    'Oracle 26ai',
  ],
  authors: [{ name: 'NEXHIRE AI' }],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: `${APP_NAME} — Enterprise AI Hiring Platform`,
    description:
      'Resume intelligence, semantic candidate search, and AI ranking at enterprise scale.',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME}`,
    description: 'Enterprise AI-powered hiring platform.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-foreground">
        <SmoothScrollProvider>
          <Providers>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
