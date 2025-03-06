/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { pusherClient } from '@/lib/pusher/pusher';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react'
import { Input } from '../ui/input';
import ChatBox from './ChatBox';


interface Chat {
  _id: string;
  members: { _id: string; name: string; image: string }[];
  messages: { _id: string; sender: { _id: string }; text?: string; photo?: string; seenBy: { _id: string }[] }[];
  isGroup: boolean; // Hapus `| undefined`
  name: string;
  groupPhoto: string;
  createdAt: string;
  lastMessageAt: string;
}


export default function ChatList({ currentChatId }: { currentChatId: string; }
) {

  const { data: session }: any = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const currentUser = session?.user



  // Fetch chats
  const getChats = async () => {
    try {
      const res = await fetch(
        search !== ""
          ? `/api/users/${currentUser?.id}/searchChat?query=${search}`
          : `/api/users/${currentUser?.id}`
      );
      const data = await res.json();
      setChats(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getChats();
    }
  }, [currentUser, search]);

  // useEffect(() => {
  //   if (!currentUser || !currentUser?._id) return; // Pastikan currentUser._id ada sebelum subscribe

  //   pusherClient.subscribe(currentUser?._id);

  //   const handleChatUpdate = (updatedChat: { id: string; messages: any }) => {
  //     setChats((allChats) =>
  //       allChats.map((chat) =>
  //         chat._id === updatedChat.id ? { ...chat, messages: updatedChat.messages } : chat
  //       )
  //     );
  //   };

  //   const handleNewChat = (newChat: Chat) => {
  //     setChats((allChats) => [...allChats, newChat]);
  //   };

  //   pusherClient.bind("update-chat", handleChatUpdate);
  //   pusherClient.bind("new-chat", handleNewChat);

  //   return () => {
  //     pusherClient.unsubscribe(currentUser._id);
  //     pusherClient.unbind("update-chat", handleChatUpdate);
  //     pusherClient.unbind("new-chat", handleNewChat);
  //   };
  // }, [currentUser]);


  useEffect(() => {

    if (!currentUser || !currentUser?.id) return;

    if (currentUser) {
      pusherClient.subscribe(currentUser?.id);

      const handleChatUpdate = (updatedChat: { id: string; messages: any }) => {
        setChats((allChats) =>
          allChats.map((chat) => {
            if (chat._id === updatedChat.id) {
              return { ...chat, messages: updatedChat.messages };
            } else {
              return chat;
            }
          })
        );
      };

      const handleNewChat = (newChat: Chat) => {
        setChats((allChats) => [...allChats, newChat]);
      }

      pusherClient.bind("update-chat", handleChatUpdate);
      pusherClient.bind("new-chat", handleNewChat);

      return () => {
        pusherClient.unsubscribe(currentUser?._id);
        pusherClient.unbind("update-chat", handleChatUpdate);
        pusherClient.unbind("new-chat", handleNewChat);
      };
    }
  }, [currentUser]);



  return (
    <div className="h-full md:h-[535px] overflow-y-auto flex flex-col gap-3">
      <Input className='hidden' type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="flex-1 flex bg-muted/40 flex-col shadow-lg rounded-xl overflow-y-hidden ">
        <h1 className='py-4 text-md md:text-md px-4 font-semibold w-full bg-secondary text-foreground'>Daftar Pesan</h1>
        <div className=' py-4 px-3'>

          {chats?.map((chat) => (
            <ChatBox
              key={chat?._id}
              chat={chat}
              currentUser={currentUser}
              currentChatId={currentChatId} />
          ))}
        </div>
      </div>
    </div>
  )
}

