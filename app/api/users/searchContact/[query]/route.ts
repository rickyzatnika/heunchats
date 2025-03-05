import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    await connectToDatabase();

    // Ambil nilai query dari URL (bukan dari params!)
    const query = request.nextUrl.searchParams.get("query");

    // Jika tidak ada query, kembalikan semua user
    if (!query) {
      const allUsers = await User.find({});
      return NextResponse.json(allUsers, { status: 200 });
    }

    // Lakukan pencarian berdasarkan nama atau email
    const searchedContacts = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
      ],
    });

    return NextResponse.json(searchedContacts, { status: 200 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ message: "Terjadi kesalahan", error }, { status: 500 });
  }
};
