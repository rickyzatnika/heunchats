"use client"

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Header = () => {

  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <header className='w-full fixed top-0 z-50 shadow-md bg-background flex items-center justify-between px-4 sm:px-14 md:px-20 py-4'>
        <nav>
          <Link href="/" className='font-bold text-md md:text-lg '>Hulenx Chats</Link>
        </nav>

        {session && status === 'authenticated' ? (
          <div className='flex gap-2 items-center'>
            <Image src={session.user.image ? session.user.image : '/person.jpg'} alt='profile' width={50} height={25} className='w-10 h-10 rounded-full' />
            <Button size="sm" variant='outline' onClick={() => signOut({ callbackUrl: '/' })} >Logout</Button>
          </div>
        ) : (
          <Button size="sm" variant='outline' onClick={() => router.push('/register')} >Lets Chat</Button>
        )}
      </header>
    </>
  )
}

export default Header