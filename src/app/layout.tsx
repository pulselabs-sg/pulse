import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ipulselabs.net/'),
  title: {
    default: 'iPulse | Best AI Voice Generator & Text to Speech Online',
    template: '%s | iPulse AI',
  },
  description: 'iPulse is the leading AI voice platform for creators. Generate realistic text to speech, clone voices, transcribe audio with 99% accuracy, and clean audio instantly.',
  keywords: [
    'AI voice generator',
    'text to speech online',
    'voice cloning AI',
    'speech to text converter',
    'AI voice changer',
    'clean audio AI',
    'ElevenLabs alternative',
    'realistic AI voices',
    'AI audio tools'
  ],
  authors: [{ name: 'iPulse Team' }],
  creator: 'iPulse AI',
  publisher: 'iPulse AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ipulselabs.net/',
    siteName: 'iPulse AI',
    title: 'iPulse | Premium AI Voice Generator & Audio Tools',
    description: 'Transform your audio with neural-powered AI. The ultimate platform for realistic voice synthesis and transcription.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'iPulse AI Voice Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iPulse | Next-Gen AI Voice Generator',
    description: 'Create lifelike speech with our AI voice generator and audio tools. Built for the future of content creation.',
    images: ['/og-image.jpg'],
    creator: '@iPulseAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'iPulse AI',
    operatingSystem: 'Windows, macOS, Linux, Android, iOS',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
    },
    description: 'The ultimate AI voice generator and audio toolkit. Features include Text to Speech, Voice Cloning, and Speech to Text.',
    screenshot: 'https://ipulselabs.net//og-image.jpg',
    featureList: [
      'Neural Text to Speech',
      'Instant Voice Cloning',
      '99% Accuracy Speech to Text',
      'AI Audio Cleaning',
      'Real-time Voice Changing'
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen antialiased custom-scrollbar`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}