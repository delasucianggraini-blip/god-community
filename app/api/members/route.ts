import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - List all members
export async function GET() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ members })
}
