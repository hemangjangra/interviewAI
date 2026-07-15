import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'InterviewAI — AI-Powered Mock Interview Platform',
    template: '%s | InterviewAI',
  },
  description:
    'Practice realistic AI-powered technical and HR mock interviews. Get intelligent feedback, track your progress, and ace your next job interview.',
  keywords: [
    'mock interview',
    'AI interview',
    'technical interview practice',
    'HR interview',
    'placement preparation',
    'coding interview',
    'DSA practice',
    'interview feedback',
  ],
  authors: [{ name: 'InterviewAI' }],
  creator: 'InterviewAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'InterviewAI — AI-Powered Mock Interview Platform',
    description: 'Practice realistic AI-powered interviews and get intelligent feedback.',
    siteName: 'InterviewAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — AI-Powered Mock Interview Platform',
    description: 'Practice realistic AI-powered interviews and get intelligent feedback.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
