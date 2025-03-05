import React, { Suspense } from 'react'
import FormRegister from './form-register'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RegisterPage = () => {
  return (

    <div className='w-full sm:w-1/2 md:w-1/3 mx-auto px-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Daftar</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <FormRegister />
          </Suspense>
        </CardContent>
      </Card>
    </div>


  )
}

export default RegisterPage