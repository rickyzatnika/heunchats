import { connectToDatabase } from "@/lib/db";
import Chat from "@/lib/db/models/chat";
import Message from "@/lib/db/models/message";
import User from "@/lib/db/models/user";
import { pusherServer } from "@/lib/pusher/pusher";
import { NextRequest, NextResponse } from "next/server";






export const POST = async (req: NextRequest) => {
  try {
    await connectToDatabase()

    const body = await req.json()

    const { chatId, currentUserId, text, photo } = body;

    const currentUser = await User.findById(currentUserId)

    const newMessage = await Message.create({
      chat: chatId,
      sender: currentUser,
      text,
      photo,
      seenBy: currentUserId
    })

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage._id },
        $set: { lastMessageAt: newMessage.createdAt }
      },
      { new: true }
    )
      .populate({
        path: 'messages',
        model: Message,
        populate: { path: 'sender seenBy', model: User },
      })
      .populate({
        path: 'members',
        model: User
      })
      .exec()

    await pusherServer.trigger(chatId, 'new-message', newMessage)

    /* Triggers a Pusher event for each member of the chat about the chat update with the latest message */
    const lastMessage = updatedChat?.messages[updatedChat?.messages?.length - 1]
    updatedChat?.members.forEach(async (member: { _id: { toString: () => string | string[]; }; }) => {
      try {
        await pusherServer.trigger(member?._id.toString(), 'update-chat', {
          id: chatId,
          messages: [lastMessage],
        })
      } catch (err) {
        console.error(`Failed to trigger update-chat event`, err)
      }
    })

    return new NextResponse(JSON.stringify(updatedChat), { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 })
  }
}