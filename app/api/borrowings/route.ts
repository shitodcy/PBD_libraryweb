import { type NextRequest, NextResponse } from "next/server"
import { borrowBook, getUserBorrowings } from "@/lib/borrowing"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId } = body

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    const result = await borrowBook(user.id, bookId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Error borrowing book:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const borrowings = await getUserBorrowings(user.id)
    return NextResponse.json({ borrowings })
  } catch (error) {
    console.error("Error fetching borrowings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
