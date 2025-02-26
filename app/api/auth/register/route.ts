import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user";
import { pusherServer } from "@/lib/pusher/pusher";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = await req.json()
    const { name, email, password, confPassword } = body

    if (!name || !email || !password) {
      return new NextResponse(JSON.stringify({ message: 'Please fill all fields' }), { status: 400 })
    }

    if (password !== confPassword) {
      return new NextResponse(JSON.stringify({ message: 'Passwords do not match' }), { status: 400 })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return new NextResponse(JSON.stringify({ message: 'Email already exists' }), { status: 400 })
    }

    const newUser = await User.create({
      ...body,
      password: await bcrypt.hash(password, 10),
    })

    // 🔹 Pastikan hanya data publik yang dikirim ke Pusher
    pusherServer.trigger('contacts', 'new-user', {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    })

    return new NextResponse(JSON.stringify(newUser), { status: 200 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Database connection failed', error }), { status: 500 })
  }
}