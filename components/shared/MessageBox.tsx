import Image from 'next/image';
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function MessageBox({ message, currentUser }: {
  message: Message
  currentUser: {
    _id: string
    name: string
    image: string
  }

}) {



  return message?.sender?._id !== currentUser?._id ? (
    <div className="flex gap-3 items-start">
      {message?.sender?.image && (
        <Image src={message?.sender?.image || "/person.jpg"} width={50} height={25} priority={true} alt="profile photo" className=" w-8 h-8 rounded-full" />
      )}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold md:text-md ">
          {message?.sender?.name} &#160;&#183;&#160; <span className='text-xs text-muted-foreground'>{moment(message?.createdAt).format('h:mm A')}</span>
        </p>
        {message?.text ? (
          <p className="w-fit bg-muted text-sm md:text-md px-3 py-1.5 rounded-lg ">{message?.text}</p>
        ) : (
          message?.photo && (
            <Image width={50} height={25} src={message.photo || "/person.jpg"} priority={true} alt="message" className="w-40 h-40 rounded-lg" />
          )
        )}
      </div>
    </div>
  ) : (
    <div className="flex gap-3 items-start justify-end">
      <div className="flex flex-col gap-2 items-end">
        <p className="text-xs text-muted-foreground">

          {moment(message?.createdAt).format('h:mm A')}
        </p>
        {message?.text ? (
          <p className="w-fit text-sm md:text-md bg-primary text-primary-foreground px-3 py-1.5  rounded-lg ">{message?.text}</p>
        ) : (
          message?.photo && (
            <Dialog >
              <DialogTrigger asChild>
                <Image placeholder="blur" blurDataURL={message.photo} width={50} height={25} src={message.photo || "/person.jpg"} priority={true} alt="message" className="w-24 h-24 object-cover rounded-lg" />
              </DialogTrigger>
              <DialogContent className="w-full  border-none  rounded-xl sm:max-w-xl p-24">
                <DialogHeader>
                  <DialogTitle />
                </DialogHeader>
                <Image placeholder="blur" blurDataURL={message.photo} width={100} height={75} src={message.photo || "/person.jpg"} priority={true} alt="message" className="w-full h-full object-cover rounded-lg" />
              </DialogContent>
            </Dialog>


          )
        )}
      </div>
    </div>
  )
}

