import type { Metadata } from 'next';

// /login redirects authenticated users to /dashboard.
// Mark it noindex so Google stops flagging it as "Page with redirects".
export const metadata: Metadata = {
  title: 'Sign In | iPulse AI',
  description: 'Sign in to access the iPulse AI voice platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
