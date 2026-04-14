import './globals.css';
import { Inter, Source_Serif_4 } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Beth Rewards | Premium Operational Analytics',
  description: 'High-fidelity tracking for QR scans, agent rewards, and business profit with enterprise-grade precision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className={`${inter.className} antialiased bg-[#FBF9F7] text-[#1B1B1B]`}>
        {children}
      </body>
    </html>
  );
}
