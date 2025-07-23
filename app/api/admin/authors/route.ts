import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/database-connection"

export async function GET() {
  try {
    const { data: authors, error } = await supabaseAdmin
      .from("authors")
      .select("*")
      .order("last_name", { ascending: true })

    if (error) {
      console.error("Error fetching authors:", error)
      return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 })
    }

    return NextResponse.json({ authors: authors || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: author, error } = await supabaseAdmin
      .from("authors")
      .insert([
        {
          first_name: body.first_name,
          last_name: body.last_name,
          nationality: body.nationality,
          biography: body.biography,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating author:", error)
      return NextResponse.json({ error: "Failed to create author" }, { status: 500 })
    }

    return NextResponse.json({ author })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: author, error } = await supabaseAdmin
      .from("authors")
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        nationality: body.nationality,
        biography: body.biography,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating author:", error)
      return NextResponse.json({ error: "Failed to update author" }, { status: 500 })
    }

    return NextResponse.json({ author })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabaseAdmin.from("authors").delete().eq("id", body.id)

    if (error) {
      console.error("Error deleting author:", error)
      return NextResponse.json({ error: "Failed to delete author" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
