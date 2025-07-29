import { type NextRequest, NextResponse } from "next/server"
import { getAllBooks } from "@/lib/books"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const sortBy = searchParams.get("sortBy") as "title" | "author" | "year" | "rating" | undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    const result = await getAllBooks({ search, category, sortBy, page, limit })

    // Ensure we always return a valid structure
    return NextResponse.json({
      data: result.data || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 12,
      totalPages: result.totalPages || 0,
    })
  } catch (error) {
    console.error("Error in books API route:", error)

    // Return empty but valid structure on error
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        error: "Failed to fetch books",
      },
      { status: 500 },
    )
  }
}
