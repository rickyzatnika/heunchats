import ClientProvider from "@/components/Provider";
import Header from "@/components/shared/Header";
import { Toaster } from "@/components/ui/toaster";





export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <Header />
      <div >
        {children}
      </div>
      <Toaster />
    </ClientProvider>

  )
}