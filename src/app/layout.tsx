import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoiceLab AI | Premium AI Voice Generator & Speech to Text Free',
  description: 'The ultimate voice changer online. Clean audio, generate realistic AI voices, and convert speech to text instantly. Built for creators.',
  keywords: ['AI voice generator', 'voice changer online', 'speech to text free', 'clean audio', 'content creator tools'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}