import { type NextRequest, NextResponse } from "next/server"
import { extendBorrowing } from "@/lib/borrowing"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await extendBorrowing(params.id)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Error extending borrowing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
