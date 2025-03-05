import Chat from "@/lib/db/models/chat";
import Message from "@/lib/db/models/message";
import User from "@/lib/db/models/user";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";



export const GET = async () => {

  await connectToDatabase()

  const session = await auth()

  const userId = session?.user?.id

  try {
    const allChats = await Chat.find({ members: userId })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: 'members',
        model: User
      })
      .populate({
        path: 'messages',
        model: Message,
        populate: {
          path: 'sender seenBy',
          model: User
        }
      }).exec()

    return NextResponse.json(allChats, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 })
  }

}