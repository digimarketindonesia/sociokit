import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SocioKit - Social Media Management Platform',
  description: 'Manage your social media accounts efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}