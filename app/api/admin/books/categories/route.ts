// app/api/admin/categories/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // DIUBAH: Impor createClient

export async function GET() {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const { data: categories, error } = await supabase // DIUBAH: Gunakan 'supabase'
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const body = await request.json();

    const { data: category, error } = await supabase // DIUBAH: Gunakan 'supabase'
      .from("categories")
      .update({
        name: body.name,
        description: body.description,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient(); // DITAMBAHKAN: Buat instance Supabase client
    const body = await request.json();

    const { error } = await supabase.from("categories").delete().eq("id", body.id); // DIUBAH: Gunakan 'supabase'

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}