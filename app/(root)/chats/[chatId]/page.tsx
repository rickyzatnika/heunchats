/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"


import ChatDetails from "@/components/shared/ChatDetails"
import ChatList from "@/components/shared/ChatList"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useEffect } from "react"




const ChatPage = () => {
  const { chatId } = useParams() as { chatId: string }

  const { data: session }: any = useSession()
  const currentUser = session?.user

  const seenMessages = async () => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentUserId: currentUser?.id
        })
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (currentUser && chatId) seenMessages()
  }, [currentUser, chatId])

  return (
    <div className=" h-full flex justify-between gap-5 py-0 p-2 md:p-14 max-lg:gap-8">
      <div className="w-1/3 max-lg:hidden"><ChatList currentChatId={chatId} /></div>
      <div className="w-2/3 max-lg:w-full"><ChatDetails chatId={chatId} /></div>
    </div>
  )
}

export default ChatPage