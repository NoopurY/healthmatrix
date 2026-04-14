import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'HealthMatrix AI — Healthcare Analytics Platform',
  description:
    'Advanced AI-powered healthcare analytics: ECG analysis, heart risk prediction, statistical insights, and personalized health guidance.',
  keywords: 'healthcare analytics, ECG analysis, heart risk, AI health, medical dashboard',
  openGraph: {
    title: 'HealthMatrix AI',
    description: 'Intelligent Healthcare Analytics & Guidance Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-mesh bg-noise antialiased">
        <Navbar />
        <div className="relative z-0">
          {children}
        </div>
      </body>
    </html>
  );
}
