/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { signInWithCredentials } from '@/lib/actions/user.action'


const signUpDefaultValues =
{
  name: '',
  email: '',
  password: '',
  confPassword: '',
}

export default function FormRegister() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chats'
  const form = useForm({
    defaultValues: signUpDefaultValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit } = form;

  const onSubmit = async (data: { name: string; email: string; password: string; confPassword: string; }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await res.json()
      if (!res.ok) {
        toast({
          title: "error",
          description: response?.message,
          variant: 'destructive',
        })
        throw new Error(response?.message || 'Gagal mendaftar');
      }

      await signInWithCredentials({ email: data.email, password: data.password })
      window.location.href = callbackUrl;

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Terjadi kesalahan, silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }

  return (

    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-3'>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder='masukan nama lengkap' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='masukkan alamat email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='confPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='korfirmasi password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div >
            <Button className='w-full' type='submit' >Daftar</Button>
          </div>
          <Separator className='mb-4' />
          <div className='text-sm'>
            Sudah punya akun?{' '}
            <Link className='link' href={`/login?callbackUrl=${callbackUrl}`}>
              Masuk
            </Link>
          </div>
        </div>
      </form>
    </Form>

  )
}
