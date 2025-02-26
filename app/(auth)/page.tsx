import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CredentialsSignInForm from './credentials-sigin-form'
import { GoogleSignInForm } from './google-signin-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignIn(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams

  const { callbackUrl = '/chats' } = searchParams

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }


  return (
    <div className='w-full sm:w-1/2 md:w-1/3 mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl tracking-wide'>Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>} >
            <CredentialsSignInForm />
          </Suspense>
          <div className="text-center my-3 italic">or</div>
          <GoogleSignInForm />
          <div className='flex gap-1 mt-4 items-center py-3 px-3'>
            <span className='text-sm'>belum punya akun?</span>
            <Link className='text-sm underline' href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
              Daftar disini
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}