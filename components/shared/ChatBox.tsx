"use client"

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { pusherClient } from '@/lib/pusher/pusher';


moment.locale('id');



interface ChatBoxProps {
  chat: {
    _id: string;
    members: { _id: string; name: string; image: string }[];
    messages: { _id: string; sender: { _id: string }; text?: string; photo?: string; seenBy: { _id: string }[] }[];
    isGroup?: boolean; // Tambahkan `?`
    name: string;
    groupPhoto: string;
    createdAt: string;
    lastMessageAt: string;
  };
  currentUser: { _id: string };
  currentChatId: string;
}


interface ContactProps {
  _id: string;
  isOnline: boolean;
  lastSeen?: Date | null;

}


const ChatBox: React.FC<ChatBoxProps> = ({
  chat,

  currentUser,
  currentChatId }) => {
  const router = useRouter();

  const [contacts, setContacts] = useState<ContactProps[]>([]);

  const otherMembers = chat?.members?.filter(
    (member) => member?._id !== currentUser?._id
  );

  const lastMessage = chat?.messages?.length > 0 ? chat?.messages[chat?.messages.length - 1] : null;

  const seen = lastMessage?.seenBy.find(
    (member) => member?._id === currentUser?._id
  );

  const getContacts = useCallback(async () => {
    if (!currentUser?._id) return; // Jangan fetch jika user belum tersedia
    const res = await fetch(`/api/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    const filteredContacts = data
      .filter((contact: { _id: string }) => contact?._id !== currentUser?._id)
      .map((contact: { _id: string; isOnline: boolean; lastSeen: Date }) => ({
        _id: contact._id,
        isOnline: contact.isOnline,
        lastSeen: contact.lastSeen,
      }));
    setContacts(filteredContacts);
  }, [currentUser]); // Tambahkan dependency agar tidak terjadi looping

  useEffect(() => {
    getContacts(); // Ambil daftar kontak dari database

    const chatChannel = pusherClient.subscribe("chat-app");
    const contactsChannel = pusherClient.subscribe("contacts");

    // Event saat user online/offline
    chatChannel.bind("user-status", ({ userId, isOnline, lastSeen }: { userId: string, isOnline: boolean, lastSeen: Date }) => {
      console.log("🟢 Received user-status event:", { userId, isOnline, lastSeen });

      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
        )
      );
    });

    // Event saat ada user baru
    contactsChannel.bind("new-user", (newUser: ContactProps) => {
      setContacts((prevContacts) => [...prevContacts, newUser]);
    });

    return () => {
      chatChannel.unbind_all();
      chatChannel.unsubscribe();
      contactsChannel.unbind_all();
      contactsChannel.unsubscribe();
    };
  }, [getContacts, currentUser]);




  // const getContacts = async () => {
  //   if (!currentUser?._id) return; // Jangan fetch jika user belum tersedia
  //   const res = await fetch(`/api/users`,
  //     {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       cache: "no-store",
  //     }
  //   )
  //   const data = await res.json();
  //   const filteredContacts = data
  //     .filter((contact: { _id: string }) => contact?._id !== currentUser?._id)
  //     .map((contact: { _id: string; isOnline: boolean; lastSeen: Date }) => ({
  //       _id: contact._id,
  //       isOnline: contact.isOnline,
  //       lastSeen: contact.lastSeen,
  //     }));
  //   setContacts(filteredContacts);
  // }
  // useEffect(() => {
  //   getContacts(); // Ambil daftar kontak dari database

  //   const chatChannel = pusherClient.subscribe("chat-app");
  //   const contactsChannel = pusherClient.subscribe("contacts");

  //   // Event saat user online/offline
  //   chatChannel.bind("user-status", ({ userId, isOnline, lastSeen }: { userId: string, isOnline: boolean, lastSeen: Date }) => {
  //     console.log("🟢 Received user-status event:", { userId, isOnline, lastSeen });

  //     setContacts((prevContacts) =>
  //       prevContacts.map((contact) =>
  //         contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
  //       )
  //     );
  //   });

  //   // Event saat ada user baru
  //   contactsChannel.bind("new-user", (newUser: ContactProps) => {
  //     setContacts((prevContacts) => [...prevContacts, newUser]);
  //   });

  //   return () => {
  //     chatChannel.unbind_all();
  //     chatChannel.unsubscribe();
  //     contactsChannel.unbind_all();
  //     contactsChannel.unsubscribe();
  //   };
  // }, [currentUser]);





  return (
    <div
      className={`relative flex items-start border-b border-border pb-3 justify-between p-2 cursor-pointer rounded hover:bg-card ${chat?._id === currentChatId ? 'bg-card' : ''}`}
      onClick={() => router.push(`/chats/${chat?._id}`)}
    >
      <div className="flex gap-3  ">
        {chat?.isGroup ? (
          <Image
            src={chat?.groupPhoto || "/person.jpg"}
            alt="group-photo"
            className="w-11 h-11 rounded-full object-cover object-center"
            width={50}
            height={25}
            priority
          />
        ) : (
          <Image
            src={otherMembers[0]?.image || "/person.jpg"}
            alt="profile-photo"
            className="w-11 h-11 rounded-full object-cover object-center"
            width={50}
            height={25}
            priority
          />
        )}

        <div className="flex flex-col gap-1">
          <div>
            <p className="text-md font-semibold">
              {chat?.isGroup ? chat?.name : otherMembers[0]?.name}
            </p>


            {/* ---------------------------------------isOnLine--------------------------------------- */}
            {contacts[0]?.isOnline && <div className='flex gap-1 items-center'>
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <p className="text-xs text-muted-foreground" >Online</p>
            </div>}

            {contacts[0]?.isOnline === false && (
              contacts[0]?.lastSeen && (
                <div className="text-xs flex gap-1 text-muted-foreground italic">
                  <p>Offline</p>
                  {moment(contacts[0]?.lastSeen).fromNow()}
                </div>
              )
            )}
          </div>
          {/* ----------------------------------------------------------------------------------------- */}
          {!lastMessage ? (
            <p className="text-sm font-bold">Started a chat</p>
          ) : lastMessage?.photo ? (
            lastMessage?.sender?._id === currentUser?._id ? (
              <p className="text-sm text-muted-foreground">You sent a photo</p>
            ) : (
              <p className={`${seen ? 'text-sm text-muted-foreground' : 'font-semibold text-sm '}`}>
                Received a photo
              </p>
            )
          ) : (
            <p className={`w-[120px] sm:w-[250px] ${seen ? 'text-sm text-muted-foreground' : 'font-semibold text-sm '}`}>
              {lastMessage?.text}
            </p>
          )}
        </div>
      </div>

      <div className='absolute right-2 top-4' >
        <p className="text-xs  text-muted-foreground font-semibold ">
          {!lastMessage
            ? moment(chat?.createdAt).format('hh:mm')
            : moment(chat?.lastMessageAt).format('hh:mm')}
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
