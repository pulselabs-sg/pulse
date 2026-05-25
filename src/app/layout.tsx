import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-playfair' });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ipulselabs.net/'),
  title: {
    default: 'iPulse AI | Premium AI Video & Image Generator',
    template: '%s | iPulse AI',
  },
  description: 'Transform text into stunning cinematic video and hyper-realistic images with iPulse Neural Creative Engine. Generate Text-to-Video, Image Synthesis, and Video Flow Extensions instantly.',
  keywords: [
    'AI Video Generator',
    'AI Image Generator',
    'Text-to-Video',
    'Text-to-Image',
    'AI Video Editor',
    'Flow Extension Video',
    'Cinematic AI',
    'Neural Creative Engine',
    'iPulse AI',
    'Text-to-Speech',
    'Voice Cloning'
  ],
  authors: [{ name: 'iPulse Team' }],
  creator: 'iPulse AI',
  publisher: 'iPulse AI',

  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
    title: 'iPulse AI | Premium AI Video & Image Generator',
    description: 'Transform text into stunning cinematic video and hyper-realistic images with iPulse Neural Creative Engine.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'iPulse AI Neural Creative Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iPulse AI | Premium AI Video & Image Generator',
    description: 'Transform text into stunning cinematic video and hyper-realistic images with iPulse Neural Creative Engine.',
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
  alternates: {
    canonical: 'https://ipulselabs.net/',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'iPulse AI',
    operatingSystem: 'Web, Windows, macOS, Linux, Android, iOS',
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
    screenshot: 'https://ipulselabs.net/og-image.jpg',
    featureList: [
      'Neural Text to Speech',
      'Instant Voice Cloning',
      '99% Accuracy Speech to Text',
      'AI Audio Cleaning',
      'Real-time Voice Changing'
    ]
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'iPulse AI',
    url: 'https://ipulselabs.net/',
    logo: 'https://ipulselabs.net/logo.png',
    sameAs: [
      // Add social links here if available
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'iPulse AI',
    url: 'https://ipulselabs.net/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ipulselabs.net/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Text-to-Speech',
        description: 'Generate hyper-realistic AI voices from text instantly.',
        url: 'https://ipulselabs.net/#text-to-speech'
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Voice Cloning',
        description: 'Clone any voice from just a 5-second audio sample.',
        url: 'https://ipulselabs.net/#voice-cloning'
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Speech-to-Text',
        description: 'Transcribe audio with 99% accuracy and speaker diarisation.',
        url: 'https://ipulselabs.net/#speech-to-text'
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Developer API',
        description: 'Integrate neural audio models directly into your applications.',
        url: 'https://ipulselabs.net/#api'
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-background text-zinc-50 min-h-screen antialiased custom-scrollbar`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}