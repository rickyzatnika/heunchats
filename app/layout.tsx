import type { Metadata } from "next";
import './globals.css'
import { Poppins } from 'next/font/google'



const poppins = Poppins({
  subsets: ['latin'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})



export const metadata: Metadata = {
  title: "Hulenx Chat App",
  description: "Aplikasi Chat App dengan Next.js 15",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning translate='no'>
      <body className={`${poppins.className} `}>

        <div className="pt-20 md:pt-16 h-full w-full">
          {children}
        </div>

      </body>
    </html>
  )
}
