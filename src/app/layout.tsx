import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { SidebarNav } from '@/components/sidebar-nav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Rota Certa',
  description: 'Gerencie suas corridas de motoboy com eficiência.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', inter.variable)}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                  <Logo className="w-8 h-8 text-primary" />
                  <span className="text-lg font-semibold">Rota Certa</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarNav />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
               <header className="md:hidden flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Logo className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Rota Certa</span>
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
