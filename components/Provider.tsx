"use client"


import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from './ui/toaster'
import { ThemeProvider } from './ThemeProvider'


export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange >
        {children}
      </ThemeProvider>
      <Toaster />
    </SessionProvider>
  )
}
