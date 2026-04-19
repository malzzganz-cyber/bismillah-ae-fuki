import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Malzz Nokos — Platform Nomor Virtual & OTP',
  description: 'Platform cepat & simpel untuk membeli nomor virtual dan menerima OTP otomatis.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e1a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <div className="mobile-container">
            {children}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a2235',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#0a0e1a' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0a0e1a' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
