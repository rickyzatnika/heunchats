import { connectToDatabase } from "@/lib/db";
import Chat from "@/lib/db/models/chat";
import Message from "@/lib/db/models/message";
import User from "@/lib/db/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    await connectToDatabase();

    const userId = (await params).userId;
    const searchQuery = request.nextUrl.searchParams.get("query") || ""; // Ambil query dari URL

    const searchedChats = await Chat.find({
      members: userId,
      name: { $regex: searchQuery, $options: "i" } // Pastikan searchQuery digunakan dengan benar
    })
      .populate({
        path: "members",
        model: User
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User
        }
      })
      .exec();

    return NextResponse.json(searchedChats, { status: 200 }); // Gunakan NextResponse.json untuk response JSON
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 });
  }
};