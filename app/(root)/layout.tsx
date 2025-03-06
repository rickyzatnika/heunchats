import ClientProvider from "@/components/Provider";
import Header from "@/components/shared/Header";






export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <Header />
      <div >
        {children}
      </div>
    </ClientProvider>

  )
}