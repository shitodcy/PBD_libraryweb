import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/database-connection"

export async function GET() {
  try {
    const { data: books, error } = await supabaseAdmin
      .from("books")
      .select(`
        *,
        categories(name),
        publishers(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching books:", error)
      return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
    }

    // Transform data to include category and publisher names
    const transformedBooks =
      books?.map((book) => ({
        ...book,
        category_name: book.categories?.name,
        publisher_name: book.publishers?.name,
      })) || []

    return NextResponse.json({ books: transformedBooks })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: book, error } = await supabaseAdmin
      .from("books")
      .insert([
        {
          title: body.title,
          isbn: body.isbn,
          description: body.description,
          category_id: body.category_id,
          publisher_id: body.publisher_id,
          publication_year: body.publication_year,
          pages: body.pages,
          language: body.language,
          price: body.price,
          total_copies: body.total_copies,
          available_copies: body.available_copies || body.total_copies,
          featured: body.featured || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating book:", error)
      return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: book, error } = await supabaseAdmin
      .from("books")
      .update({
        title: body.title,
        isbn: body.isbn,
        description: body.description,
        category_id: body.category_id,
        publisher_id: body.publisher_id,
        publication_year: body.publication_year,
        pages: body.pages,
        language: body.language,
        price: body.price,
        total_copies: body.total_copies,
        available_copies: body.available_copies,
        featured: body.featured,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating book:", error)
      return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabaseAdmin.from("books").delete().eq("id", body.id)

    if (error) {
      console.error("Error deleting book:", error)
      return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
