import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StoreManager Pro API',
  description: 'Backend API para StoreManager Pro con Firebase y Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}