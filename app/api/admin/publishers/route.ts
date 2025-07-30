// app/api/admin/publishers/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // DIUBAH: Impor createClient

export async function GET() {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const { data: publishers, error } = await supabase // DIUBAH: Gunakan 'supabase' bukan 'supabaseAdmin'
      .from("publishers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching publishers:", error);
      return NextResponse.json({ error: "Failed to fetch publishers" }, { status: 500 });
    }

    return NextResponse.json({ publishers: publishers || [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const body = await request.json();

    const { data: publisher, error } = await supabase // DIUBAH: Gunakan 'supabase'
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
      .single();

    if (error) {
      console.error("Error creating publisher:", error);
      return NextResponse.json({ error: "Failed to create publisher" }, { status: 500 });
    }

    return NextResponse.json({ publisher });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const body = await request.json();

    const { data: publisher, error } = await supabase // DIUBAH: Gunakan 'supabase'
      .from("publishers")
      .update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating publisher:", error);
      return NextResponse.json({ error: "Failed to update publisher" }, { status: 500 });
    }

    return NextResponse.json({ publisher });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const body = await request.json();

    const { error } = await supabase.from("publishers").delete().eq("id", body.id); // DIUBAH: Gunakan 'supabase'

    if (error) {
      console.error("Error deleting publisher:", error);
      return NextResponse.json({ error: "Failed to delete publisher" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}