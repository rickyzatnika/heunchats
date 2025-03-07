/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"


import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/lib/pusher/pusher'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Loader2, UserRoundCheck } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import moment from 'moment'
import ChatBox from './ChatBox'
import ChatList from './ChatList'
import { ScrollArea } from '../ui/scroll-area'


moment.locale('id');

interface ContactProps {
  _id: string;
  name: string;
  email: string;
  image: string;
  isOnline: boolean;
  lastSeen?: Date | null;

}

export default function Contact() {
  const { data: session }: any = useSession()
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<ContactProps[]>([]);
  const router = useRouter()
  const currentUser = session?.user;

  const getContacts = async () => {
    if (!currentUser?._id) return; // Jangan fetch jika user belum tersedia
    try {
      setLoading(true);
      const res = await fetch(`/api/users`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      )
      const data = await res.json();
      setContacts(
        currentUser ? data.filter((contact: { _id: string }) => contact?._id !== currentUser?._id) : data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getContacts(); // Ambil daftar kontak dari database

    const chatChannel = pusherClient.subscribe("chat-app");
    const contactsChannel = pusherClient.subscribe("contacts");

    // Event saat user online/offline
    chatChannel.bind("user-status", ({ userId, isOnline, lastSeen }: { userId: string, isOnline: boolean, lastSeen: Date }) => {


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
  }, [currentUser]);


  // useEffect(() => {

  //   getContacts()

  //   const channel = pusherClient.subscribe("chat-app");

  //   // Event saat user online/offline
  //   channel.bind("user-status", ({ userId, isOnline, lastSeen }: { userId: string, isOnline: boolean, lastSeen: Date }) => {
  //     setContacts((prevContacts) =>
  //       prevContacts.map((contact) =>
  //         contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
  //       )
  //     );
  //   });

  //   return () => {
  //     channel.unbind_all();
  //     channel.unsubscribe();
  //   };

  // }, [currentUser]);



  // useEffect(() => {
  //   const channel = pusherClient.subscribe("contacts");

  //   channel.bind("new-user", (newUser: ContactProps) => {
  //     // console.log(" New User event received", newUser);
  //     setContacts((prevContacts) => [...prevContacts, newUser]);
  //   })

  //   return () => {
  //     channel.unbind_all();
  //     channel.unsubscribe();
  //   }
  // }, [])



  /* SELECT CONTACT */
  const [selectedContacts, setSelectedContacts] = useState<ContactProps[]>([]);
  const isGroup = selectedContacts.length > 1;


  const handleSelect = (contact: ContactProps) => {

    if (selectedContacts.includes(contact)) {
      setSelectedContacts((prevSelectedContacts) =>
        prevSelectedContacts.filter((item) => item !== contact)
      );
    } else {
      setSelectedContacts((prevSelectedContacts) => [
        ...prevSelectedContacts,
        contact
      ])
    }
  }

  /* ADD GROUP CHAT NAME */
  const [name, setName] = useState("");

  const createChat = async () => {
    const res = await fetch(`/api/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUserId: currentUser?._id,
        members: selectedContacts.map((contact) => contact?._id),
        isGroup,
        name,
      }),
    })

    const chat = await res.json();

    if (res.ok) {
      router.push(`/chats/${chat?._id}`)
    }
  }




  return (
    <div className="flex flex-col md:flex-row gap-5">
      <div className="w-full sm:w-2/3 flex gap-7 items-start max-lg:flex-col ">
        <div className="h-full md:h-[535px]  overflow-y-scroll rounded-lg   w-full flex flex-col gap-5 ">
          <div className=' py-4 md:py-4 px-2 md:px-4 w-full border-b border-border'>
            <p className="text-md md:text-lg font-semibold">Pilih User untuk memulai chat</p>
            <span className='text-sm  italic text-muted-foreground'>atau pilih beberapa user untuk membuat group chat</span>
          </div>
          {loading && <p className='flex items-center gap-1 text-sm'> <Loader2 className='size-4 animate-spin' /> Loading...</p>}
          <div className="flex flex-col p-5  gap-4 flex-1 items-start overflow-y-scroll custom-scrollbar">
            <ScrollArea className='w-full h-[550px] md:h-[340px]'>
              {contacts?.map((user, index) => (
                <div
                  key={index}
                  className="flex relative gap-3 mb-4 pb-2 border-b border-border items-center cursor-pointer"
                  onClick={() => handleSelect(user)}
                >
                  {selectedContacts.find((item) => item === user) ? (
                    <CheckCircle className='size-5 text-green-600' />
                  ) : (
                    <UserRoundCheck className='size-5 ' />
                  )}
                  <Image
                    src={user.image || "/person.jpg"}
                    alt="profile"
                    className="w-12 h-12  md:w-14 md:h-14 rounded-full object-cover object-center"
                    width={50}
                    height={25}
                    priority={true}
                  />
                  <div className=' space-y-1'>
                    <p className="text-balance capitalize text-sm">{user?.name}</p>
                    {user.isOnline === true ? (
                      <div className='flex gap-1 items-center'>
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <p className="text-xs text-muted-foreground" >Online</p>
                      </div>
                    ) : (
                      <div className='flex flex-col text-muted-foreground gap-1 '>
                        <div className='flex gap-1 items-center'>
                          <p className='text-xs'>Offline</p>
                          {user.lastSeen && <span className="text-xs italic text-muted-foreground">{moment(user.lastSeen).fromNow()}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </ScrollArea>
            <Button
              onClick={createChat}
              disabled={selectedContacts.length === 0}
              className=''
              variant={selectedContacts.length === 0 ? "outline" : "default"}
            >
              Mulai Obrolan
            </Button>
          </div>

        </div>

      </div>
      <div className="w-full sm:w-1/3 flex flex-col gap-4">
        {isGroup && (
          <>
            <div className="flex flex-col gap-3 rounded-md p-5 ">
              <p className="text-md font-semibold ">Nama Group</p>
              <Input
                placeholder="Masukkan nama group..."
                className=" rounded-2xl px-5 py-3 text-sm outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 px-4">
              {/* <p className="text-sm ">Anggota Group</p> */}
              <div className="flex flex-wrap gap-3">
                {selectedContacts?.map((contact, index) => (
                  <p className="text-xs md:text-sm capitalize bg-muted p-2  rounded-lg" key={index}>
                    {contact?.name}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}