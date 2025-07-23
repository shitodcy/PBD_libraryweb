import { type NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Email, password, first name, and last name are required" }, { status: 400 })
    }

    const result = await signUp({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
    })

    return NextResponse.json({
      message: "User created successfully",
      user: result.user,
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
