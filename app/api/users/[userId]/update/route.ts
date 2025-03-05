import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const userId = (await params).userId;

    const { name, image } = body

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { name, image },
      { new: true }
    )

    return NextResponse.json(updateUser, { status: 200 })

  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 })
  }
}