"use client"

import ChatList from '@/components/shared/ChatList'
import Contact from '@/components/shared/Contact'
import React from 'react'
import { useParams } from "next/navigation"

const ChatPage = () => {

  const { chatId } = useParams() as { chatId: string }

  return (
    <div className='h-screen flex justify-between gap-4 px-2 md:px-24 py-4 md:py-14 max-lg:gap-8'>
      <div className='w-1/3 max-lg:w-1/2 max-md:w-full'>
        <ChatList currentChatId={chatId} />
      </div>
      <div className='w-2/3 max-lg:w-1/2 max-md:hidden'>
        <Contact />
      </div>
    </div>
  )
}

export default ChatPage