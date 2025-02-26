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
      <header className='w-full bg-background flex items-center justify-between px-4 sm:px-14 md:px-20 py-4'>
        <nav>
          <Link href="/" className='font-bold text-lg '>Hulenx Chats</Link>
        </nav>

        {session && status === 'authenticated' ? (
          <div className='flex gap-2 items-center'>
            <Image src={session.user.image ? session.user.image : '/person.jpg'} alt='profile' width={40} height={40} className='rounded-full' />
            <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })} >Logout</Button>
          </div>
        ) : (
          <Button onClick={() => router.push('/register')} >Lets Chat</Button>
        )}
      </header>
    </>
  )
}

export default Header