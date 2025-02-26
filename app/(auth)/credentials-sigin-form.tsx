'use client'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { toast } from '@/hooks/use-toast'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { signInWithCredentials } from '@/lib/actions/user.action'

const signInDefaultValues = {
  email: '',
  password: '',
}

export default function CredentialsSignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chats'

  const form = useForm({
    defaultValues: signInDefaultValues,
    mode: 'onBlur',
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      window.location.href = callbackUrl;
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive',
      })
    }
  }

  return (


    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-4'>
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
                    placeholder='masukkan password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button className='w-full' type='submit'>Masuk</Button>
          </div>
        </div>
      </form>
    </Form>

  )
}