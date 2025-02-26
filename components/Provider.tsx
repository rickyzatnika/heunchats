import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from './ui/toaster'

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster />
      {children}
    </SessionProvider>
  )
}
