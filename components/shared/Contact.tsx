/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"


import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/lib/pusher/pusher'
import { useRouter } from 'next/navigation'

import Image from 'next/image'
import { CheckCircle, UserRoundCheck } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'


interface ContactProps {
  _id: string,
  name: string,
  email: string,
  image: string
}

export default function Contact() {
  const { data: session }: any = useSession()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactProps[]>([]);
  const router = useRouter()
  const currentUser = session?.user;

  const getContacts = async () => {

    if (!currentUser?._id) return; // Jangan fetch jika user belum tersedia

    try {
      setLoading(true);
      const res = await fetch(
        search !== "" ? `/api/users/searchContact/${search}` : `/api/users`,
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

    getContacts()

  }, [currentUser, search]);


  useEffect(() => {
    const channel = pusherClient.subscribe("contacts");

    channel.bind("new-user", (newUser: ContactProps) => {
      // console.log(" New User event received", newUser);
      setContacts((prevContacts) => [...prevContacts, newUser]);
    })

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    }
  }, [])




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
    <div className="flex flex-col md:flex-row-reverse gap-5">
      <div className="w-full sm:w-1/3 flex flex-col gap-4">
        {isGroup && (
          <>
            <div className="flex flex-col gap-3 rounded-md p-5 bg-purple-50">
              <p className="text-md font-semibold text-gray-800">Nama Group</p>
              <Input
                placeholder="Masukkan nama group..."
                className="bg-white rounded-2xl px-5 py-3 text-sm outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 px-4">
              <p className="text-sm ">Anggota Group</p>
              <div className="flex flex-wrap gap-3">
                {selectedContacts?.map((contact, index) => (
                  <p className="text-xs md:text-sm capitalize  p-2 bg-purple-50 rounded-lg" key={index}>
                    {contact?.name}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
      <div className="w-full sm:w-2/3 flex gap-7 items-start max-lg:flex-col ">
        <div className="relative h-[425px] md:h-[535px]  overflow-y-scroll rounded-md  bg-purple-200/30 backdrop-blur-md  w-full flex flex-col gap-5 ">
          <div className='bg-purple-300 p-1 px-4 w-full'>
            <p className="text-md font-semibold">Pilih User untuk memulai chat</p>
            <span className='text-xs text-accent-foreground'>atau pilih beberapa user untuk membuat group chat</span>
          </div>

          <div className="flex flex-col p-5 gap-4 flex-1 overflow-y-scroll custom-scrollbar">
            {contacts?.map((user, index) => (
              <div
                key={index}
                className="flex gap-3 items-center cursor-pointer"
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
                  className="w-9 h-9 rounded-full object-cover object-center"
                  width={50}
                  height={25}
                  priority={true}
                />
                <p className="text-balance capitalize text-sm">{user?.name}</p>
              </div>
            ))}
          </div>
          <Button
            onClick={createChat}
            disabled={selectedContacts.length === 0}
            className='absolute bottom-5 left-1/2 -translate-x-1/2'
          >
            Mulai Obrolan
          </Button>
        </div>

      </div>
    </div>
  )
}