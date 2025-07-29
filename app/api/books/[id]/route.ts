import { type NextRequest, NextResponse } from "next/server"
import { getBookById } from "@/lib/books"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await getBookById(params.id)

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("Error in book detail API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
