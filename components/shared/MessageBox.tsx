import Image from 'next/image';
import React from 'react'
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
          <p
            className={`w-fit text-sm md:text-md px-3 py-1.5 rounded-full 
        ${/^[\p{Emoji}\s]+$/u.test(message.text) ? "bg-transparent text-xl md:text-xl" : "bg-primary/60 text-primary-foreground"}`}
          >
            {message.text}
          </p>
        ) : (
          message?.photo && (
            <Image width={200} height={100} src={message.photo || "/person.jpg"} priority={true} alt="message" className="w-80 h-80 object-contain rounded-lg" />
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
          <p
            className={`w-fit text-sm md:text-md px-3 py-1.5 rounded-full 
        ${/^[\p{Emoji}\s]+$/u.test(message.text) ? "bg-transparent text-xl md:text-xl" : "bg-primary/60 text-primary-foreground"}`}
          >
            {message.text}
          </p>
        ) : (
          message?.photo && (
            <Image placeholder="blur" blurDataURL={message.photo} width={200} height={100} src={message.photo || "/person.jpg"} priority={true} alt="message" className="w-80 h-80 object-contain rounded-lg" />
          )
        )}
      </div>
    </div>
  )
}

