import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Surprizo – Mystery Box E-commerce',
  description: 'Discover exciting mystery boxes packed with surprises! Tech, Beauty, Snacks, Gaming & more. Every box guarantees value above what you pay.',
  keywords: 'mystery box, surprise box, unboxing, gifts, tech box, gaming box, beauty box',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
