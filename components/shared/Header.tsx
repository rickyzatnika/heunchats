"use client"

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link'
import React from 'react'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DarkMode } from './Darkmode';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';


const Header = () => {

  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <header className='w-full overflow-hidden bg-[#030712]  fixed top-0 z-50 shadow-md shadow-gray-900/70 flex items-center justify-between px-4 sm:px-14 md:px-20 py-4'>
        <nav>
          <Link href="/" className='font-bold text-white text-md md:text-lg '>HuLenx Chat</Link>
        </nav>

        <div className='flex items-center gap-4'>
          <DarkMode />

          <>
            {status === 'loading' ? (
              // Menampilkan animasi loading
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : session && status === "authenticated" ? (
              <div className="flex gap-2 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer relative" asChild>
                    <Image
                      src={session.user.image ? session.user.image : "/person.jpg"}
                      alt="profile"
                      width={50}
                      height={25}
                      className="w-10 h-10 rounded-full"
                    />
                  </DropdownMenuTrigger>
                  <div className="absolute right-2 top-0">
                    <DropdownMenuContent>
                      <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/contacts" >Contacts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/chats" >Chats</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </div>
                </DropdownMenu>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => router.push("/login")}>Lets Chat</Button>
            )}
          </>
        </div>


      </header>
    </>
  )
}

export default Header