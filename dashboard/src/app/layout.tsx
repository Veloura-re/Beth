import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Beth Reward System | Premium QR Analytics',
  description: 'Track QR scans, agent rewards, and business profit with precision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="cyber-grid" />
        <div className="grain-overlay" />
        <main>{children}</main>
      </body>
    </html>
  );
}
