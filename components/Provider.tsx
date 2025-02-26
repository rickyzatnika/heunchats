/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from './ui/toaster'

export default function ClientProvider({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <SessionProvider session={session}>
      <Toaster />
      {children}
    </SessionProvider>
  )
}
