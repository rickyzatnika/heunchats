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
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password !== confPassword) {
      return NextResponse.json({ message: 'Password and confirm password do not match' }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 })
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

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan', error }, { status: 500 })
  }
}