/* eslint-disable @typescript-eslint/no-explicit-any */
import { pusherServer } from "@/lib/pusher/pusher";
import Chat from "@/lib/db/models/chat";
import User from "@/lib/db/models/user";
import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectToDatabase()

    const body = await req.json();

    const { currentUserId, members, isGroup, name, groupPhoto } = body;

    const query = isGroup
      ? { isGroup, name, groupPhoto, members: [currentUserId, ...members] }
      : { members: { $all: [currentUserId, ...members], $size: 2 } }

    let chat = await Chat.findOne(query);

    if (!chat) {
      chat = await new Chat(
        isGroup ? query : { members: [currentUserId, ...members] }
      )

      await chat.save();

      const updateAllMembers = chat.members.map(async (memberId: any) => {
        await User.findByIdAndUpdate(memberId, {
          $addToSet: { chats: chat._id },
        },
          { new: true }
        )
      })

      await Promise.all(updateAllMembers);

      chat.members.map(async (member: any) => {
        await pusherServer.trigger(member._id.toString(), 'new-chat', chat)
      })
    }
    return NextResponse.json(chat, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 })
  }
}