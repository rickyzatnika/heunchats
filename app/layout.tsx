import type { Metadata } from "next";
import './globals.css'
import { Inter } from 'next/font/google'
import ClientProvider from '@/components/Provider'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/shared/Header'


const inter = Inter({ subsets: ['latin'] })



export const metadata: Metadata = {
  title: "Hulenx Chat App",
  description: "Aplikasi Chat App dengan Next.js 15",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning translate='no'>
      <body className={`${inter.className} bg-white`}>
        <ClientProvider>
          <Toaster />
          <div>
            <Header />
            {children}
          </div>
        </ClientProvider>

      </body>
    </html>
  )
}
