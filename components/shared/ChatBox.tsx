import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';



// Definisi tipe data untuk Chat, Member, dan Message

// Props untuk ChatBox
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
  currentUser: { _id: string; role: string };
  currentChatId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chat,
  currentUser,
  currentChatId }) => {
  const router = useRouter();

  const otherMembers = chat?.members?.filter(
    (member) => member?._id !== currentUser?._id
  );

  const lastMessage = chat?.messages?.length > 0 ? chat?.messages[chat?.messages.length - 1] : null;

  const seen = lastMessage?.seenBy.find(
    (member) => member?._id === currentUser?._id
  );

  return (
    <div
      className={`relative flex items-start border-accent border-b pb-3 justify-between p-2 cursor-pointer rounded hover:bg-purple-300/20 ${chat?._id === currentChatId ? 'bg-blue-2' : ''}`}
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
          <p className="text-md font-semibold">
            {chat?.isGroup ? chat?.name : otherMembers[0]?.name}
          </p>

          {!lastMessage ? (
            <p className="text-sm font-bold">Started a chat</p>
          ) : lastMessage?.photo ? (
            lastMessage?.sender?._id === currentUser?._id ? (
              <p className="text-sm text-foreground">You sent a photo</p>
            ) : (
              <p className={`${seen ? 'text-sm text-foreground' : 'font-semibold text-sm text-gray-900'}`}>
                Received a photo
              </p>
            )
          ) : (
            <p className={`w-[120px] sm:w-[250px] ${seen ? 'text-sm text-foreground' : 'font-semibold text-sm text-gray-900'}`}>
              {lastMessage?.text}
            </p>
          )}
        </div>
      </div>

      <div className='absolute right-2 top-4' >
        <p className="text-xs text-accent-foreground font-semibold uppercase">
          {!lastMessage
            ? moment(chat?.createdAt).format('hh:mm a')
            : moment(chat?.lastMessageAt).format('hh:mm a')}
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
