import './globals.css';
import React from 'react';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body className="min-h-screen bg-gray-50 text-gray-900">
    <Providers>
      <div className="max-w-5xl mx-auto p-6">{children}</div>
    </Providers>
    </body>
    </html>
  );
}
