"use client"

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';


const Header = () => {

  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <header className='w-full bg-accent-foreground fixed top-0 z-50 shadow-md flex items-center justify-between px-4 sm:px-14 md:px-20 py-4'>
        <nav>
          <Link href="/" className='font-bold text-accent text-md md:text-lg '>HeunChats</Link>
        </nav>

        {session && status === 'authenticated' ? (
          <div className='flex gap-2 items-center '>
            <DropdownMenu >
              <DropdownMenuTrigger className='cursor-pointer relative' asChild>
                <Image src={session.user.image ? session.user.image : '/person.jpg'} alt='profile' width={50} height={25} className='w-10 h-10 rounded-full' />
              </DropdownMenuTrigger>
              <div className='absolute right-2 top-0'>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                  <Link href={`/profile/${session.user.id}`}>Profile</Link>
                </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`/contacts`}>Contacts</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`/chats`}>Chats</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button onClick={() => signOut({ callbackUrl: '/' })} >Logout</button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          </div>
        ) : (
          <Button size="sm" variant='outline' onClick={() => router.push('/')} >Lets Chat</Button>
        )}
      </header>
    </>
  )
}

export default Header