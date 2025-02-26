'use client'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'

import Image from 'next/image'
import { SignInWithGoogle } from '@/lib/actions/user.action'

export function GoogleSignInForm() {
  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button disabled={pending} className='w-full flex gap-1 items-center' variant='outline'>
        {pending ? 'Redirecting to Google...' : <>
          <div className='flex items-center gap-1'>
            <p>Masuk dengan </p>
            <Image src="/google.png" alt='google' width={20} height={20} priority />
          </div>
          <span className='-ml-0.5'>oogle</span>
        </>}
      </Button>
    )
  }
  return (
    <form action={SignInWithGoogle}>
      <SignInButton />
    </form>
  )
}