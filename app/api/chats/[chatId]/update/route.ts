import { connectToDatabase } from "@/lib/db";
import Chat from "@/lib/db/models/chat";
import { NextRequest, NextResponse } from "next/server";





export const POST = async (req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) => {

  await connectToDatabase()
  const chatId = (await params).chatId;


  try {
    const body = await req.json()
    const { name, groupPhoto } = body

    const updateGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { name, groupPhoto },
      { new: true }
    )

    return new NextResponse(JSON.stringify(updateGroupChat), { status: 200 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Terjadi kesalahan server", error }), { status: 500 })
  }
}