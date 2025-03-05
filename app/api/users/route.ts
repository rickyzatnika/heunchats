import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/lib/db/models/user"
import { NextResponse } from "next/server"




export const GET = async () => {
  try {
    await connectToDatabase()

    const session = await auth()

    const userId = session?.user?.id;

    // Pastikan userId tersedia
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Ambil semua user kecuali yang sedang login
    const allUsers = await User.find({ _id: { $ne: userId } });

    return NextResponse.json(allUsers, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 })
  }
}