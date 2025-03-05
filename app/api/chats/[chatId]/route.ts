import { connectToDatabase } from "@/lib/db";
import Chat from "@/lib/db/models/chat";
import Message from "@/lib/db/models/message";
import User from "@/lib/db/models/user";

import { NextRequest, NextResponse } from "next/server";



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  await connectToDatabase();

  const chatId = (await params).chatId;

  if (!chatId) {
    return NextResponse.json({ message: "chatId tidak ditemukan" }, { status: 400 });
  }

  try {
    const chat = await Chat.findById(chatId)
      .populate({
        path: 'members',
        model: User,
      })
      .populate({
        path: 'messages',
        model: Message,
        populate: {
          path: 'sender seenBy',
          model: User,
        },
      })
      .exec()

    if (!chat) {
      return new NextResponse(JSON.stringify({ message: "Data tidak ditemukan" }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(chat), { status: 200 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Terjadi kesalahan server", error }), { status: 500 })
  }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  await connectToDatabase();

  const chatId = (await params).chatId;


  try {
    const { messageText, senderId } = await req.json();
    if (!messageText || !senderId) {
      return new NextResponse(JSON.stringify({ message: "Data tidak lengkap" }), { status: 400 })

    }

    // Buat pesan baru
    const newMessage = new Message({ text: messageText, sender: senderId, chat: chatId });
    await newMessage.save();

    // Tambahkan pesan ke chat yang sesuai
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: newMessage._id } });

    return new NextResponse(JSON.stringify(newMessage), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Terjadi kesalahan server", error }), { status: 500 })
  }
}