import { NextResponse } from "next/server"
import { getCategories } from "@/lib/books"

export async function GET() {
  try {
    const categories = await getCategories()

    // Memastikan selalu mengembalikan array
    return NextResponse.json({
      categories: Array.isArray(categories) ? categories : [],
    })
  } catch (error) {
    console.error("Error in categories API route:", error)

    // Mengembalikan array kosong jika terjadi error
    return NextResponse.json(
      {
        categories: [],
        error: "Failed to fetch categories",
      },
      { status: 500 }
    )
  }
}