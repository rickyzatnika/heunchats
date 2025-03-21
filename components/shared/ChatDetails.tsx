/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pusherClient } from '@/lib/pusher/pusher';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal, SmileIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MessageBox from './MessageBox';
import { UploadDropzone } from '@/lib/uploadthing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import EmojiPicker from "emoji-picker-react";
import moment from 'moment';


interface Message {
  createdAt?: string;
  _id: string;
  sender: {
    image?: string;
    name: string;
    _id: string; // Gantilah 'id' menjadi '_id' agar sesuai dengan ChatDetails.tsx
  };
  text?: string; // Jadikan opsional
  photo?: string; // Jadikan opsional
}

interface Chat {
  _id: string;
  members: { _id: string; name: string; image: string }[];
  messages: Message[];
  isGroup: boolean;
  name: string;
  groupPhoto: string;
  createdAt: string;
  lastMessageAt: string;
}

interface ContactProps {
  _id: string;
  isOnline: boolean;
  lastSeen?: Date | null;

}


export default function ChatDetails({
  chatId,
}: {
  chatId: string
}) {

  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat | null>(null);
  const [otherMembers, setOtherMembers] = useState<{ _id: string; name: string; image: string }[]>([]);
  const [text, setText] = useState('');
  const currentUser = session?.user as { _id: string; name: string; image: string };
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [currentProfileImage, setCurrentProfileImage] = useState('');
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);



  const getChatDetails = async () => {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: Chat = await res.json();

      if (!res.ok) throw new Error("Gagal mengambil data chat");

      setChats(data);
      setOtherMembers(data?.members.filter(member => member?._id !== currentUser?._id));

    } catch (error) {
      console.log(error)

    }
  }

  useEffect(() => {
    if (currentUser && chatId && !chats) {
      getChatDetails()
    }

  }, [currentUser, chatId, chats]);



  const sendText = async () => {
    setLoading(true)
    if (!text) {
      setLoading(false)
      return alert("Pesan tidak boleh kosong")
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser?._id,
          text,
        }),
      });
      if (res.ok) {
        setText("");
        setLoading(false)
      }
    } catch (err) {
      console.log(err);
      setLoading(false)
      throw new Error("Gagal mengirim pesan");
    }
  };


  const sendPhoto = async (photoUrl: string) => {
    setLoading(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser?._id,
          photo: photoUrl, // Gunakan URL foto yang baru diunggah
        }),
      });

      setCurrentProfileImage(""); // Reset setelah berhasil
    } catch (err) {
      console.log("Error sending photo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    pusherClient.subscribe(chatId);

    const handleMessage = (newMessage: Message) => {
      setChats(prevChat => {
        if (!prevChat) return null;

        // Pastikan pesan belum ada sebelumnya
        const isMessageExist = prevChat.messages.some(msg => msg._id === newMessage._id);
        if (isMessageExist) return prevChat;

        return { ...prevChat, messages: [...prevChat.messages, newMessage] };
      });
    }

    pusherClient.bind("new-message", handleMessage);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind("new-message", handleMessage);

    };
  }, [chatId]);



  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats?.messages]);


  // Fungsi untuk handle klik di luar emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    // Tambahkan event listener saat picker terbuka
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);


  return (
    <div className="relative">
      <div className="h-screen pt-4 md:pt-0 md:h-[535px] mb-2 pb-8 flex flex-col  shadow-md rounded-2xl overflow-y-auto">
        <div className="flex items-center gap-2 px-3 rounded-sm w-full bg-primary dark:bg-primary/60 md:px-8 py-3 font-bold">
          {chats?.isGroup ? (
            <>
              <Link href={`/chats/${chatId}/group-info`}>
                <Image
                  src={chats?.groupPhoto || "/person.jpg"}
                  alt="group-photo"
                  className="w-11 h-11 rounded-full object-cover object-center"
                  width={50}
                  height={25}
                  priority={true}
                />
              </Link>

              <div className=" text-muted text-sm">
                <p className='capitalize'>
                  {chats?.name} &#160; &#183; &#160; {chats?.members?.length}{" "}
                  members
                </p>
              </div>
            </>
          ) : (
            <>
              <Image
                src={otherMembers[0]?.image || "/person.jpg"}
                alt="profile photo"
                className="w-9 h-9 rounded-full object-cover object-center"
                width={50}
                height={25}
                priority={true}
              />
              <div className=" text-white/90 text-sm capitalize">
                <p>{otherMembers[0]?.name}</p>

              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-5 bg-grey-2 p-5 overflow-y-scroll ">
          {chats?.messages?.map((message, index) => (
            <MessageBox
              key={index}
              message={message}
              currentUser={currentUser}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="absolute bottom-0 w-full gap-2  flex items-center justify-between px-3 md:px-7 py-2   ">
          <div className="relative">
            <SmileIcon
              className="size-6 cursor-pointer rounded-full p-0.5"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-12 left-0 z-50 bg-white shadow-md rounded-lg p-2">
                <EmojiPicker
                  width={280}
                  height={330}
                  searchDisabled={true}
                  skinTonesDisabled={true}
                  lazyLoadEmojis={true}
                  onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 relative ">
            <Dialog >
              <DialogTrigger asChild>
                <ImageIcon className="size-5 cursor-pointer " />
              </DialogTrigger>
              <DialogContent className="w-full rounded-xl sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Kirim Foto</DialogTitle>
                </DialogHeader>
                <UploadDropzone
                  appearance={{

                    container: "w-fit cursor-pointer mx-auto border-none ",

                  }}
                  className="ut-upload-icon:w-25 ut-upload-icon:text-green-500 ut-label:hidden  !ut-button:cursor-pointer ut-button:text-sm  "
                  onClientUploadComplete={(res) => {
                    if (res?.length > 0) {
                      const uploadedPhotoUrl = res[0].ufsUrl;
                      setCurrentProfileImage(uploadedPhotoUrl); // Simpan URL foto yang baru
                      sendPhoto(uploadedPhotoUrl); // Langsung kirim foto ke server
                    }
                  }}
                  onUploadError={(error) => {
                    console.log("Error uploading photo:", error);
                  }}
                  endpoint="imageUploader"
                />
              </DialogContent>
            </Dialog>
          </div>
          <input
            type="text"
            placeholder="Tulis pesan"
            className="w-full flex  border-none text-muted-foreground outline-none focus:outline-none items-center justify-between px-4 py-2 rounded-2xl shadow-purple-500/30  shadow-md"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                sendText();
              }
            }}

          />

          <button disabled={loading} onClick={sendText}>
            <SendHorizonal className='size-5 md:size-6 ' />
          </button>
        </div>
      </div>
    </div>
  )
}

