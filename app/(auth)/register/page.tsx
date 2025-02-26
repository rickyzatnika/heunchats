import React from 'react'
import FormRegister from './form-register'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RegisterPage = () => {
  return (

    <div className='w-full sm:w-1/2 md:w-1/3 mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Daftar</CardTitle>
        </CardHeader>
        <CardContent>
          <FormRegister />
        </CardContent>
      </Card>
    </div>


  )
}

export default RegisterPage