import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await signIn(email, password)

    return NextResponse.json({
      message: "Signed in successfully",
      user: result.user,
      session: result.session,
    })
  } catch (error: any) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: error.message || "Invalid credentials" }, { status: 401 })
  }
}
