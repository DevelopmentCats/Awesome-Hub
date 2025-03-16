import { Metadata } from 'next';
import { ThemeProviders } from '@/components/ThemeProviders';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Awesome Hub',
  description: 'A visual repository of GitHub Awesome Lists',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProviders>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProviders>
      </body>
    </html>
  );
} 