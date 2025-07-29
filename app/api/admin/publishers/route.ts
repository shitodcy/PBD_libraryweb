import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/database-connection"

export async function GET() {
  try {
    const { data: publishers, error } = await supabaseAdmin
      .from("publishers")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching publishers:", error)
      return NextResponse.json({ error: "Failed to fetch publishers" }, { status: 500 })
    }

    return NextResponse.json({ publishers: publishers || [] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: publisher, error } = await supabaseAdmin
      .from("publishers")
      .insert([
        {
          name: body.name,
          address: body.address,
          phone: body.phone,
          email: body.email,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating publisher:", error)
      return NextResponse.json({ error: "Failed to create publisher" }, { status: 500 })
    }

    return NextResponse.json({ publisher })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: publisher, error } = await supabaseAdmin
      .from("publishers")
      .update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating publisher:", error)
      return NextResponse.json({ error: "Failed to update publisher" }, { status: 500 })
    }

    return NextResponse.json({ publisher })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const { error } = await supabaseAdmin.from("publishers").delete().eq("id", body.id)

    if (error) {
      console.error("Error deleting publisher:", error)
      return NextResponse.json({ error: "Failed to delete publisher" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
