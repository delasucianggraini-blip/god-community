import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Check member status
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const supabase = await createClient()
  
  // Check if member exists
  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .ilike("username", username)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned (not found)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!member) {
    // Member not found - NOT registered in the community
    return NextResponse.json({ 
      member: null,
      status: "tidak_terdaftar"
    })
  }

  return NextResponse.json({ 
    member,
    isNew: false 
  })
}

// POST - Add new member (for admin)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, status = "belum", adminKey } = body

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if already exists
  const { data: existing } = await supabase
    .from("members")
    .select("*")
    .ilike("username", username)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Member sudah terdaftar" }, { status: 400 })
  }

  const { data: newMember, error } = await supabase
    .from("members")
    .insert({ username, status })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ member: newMember })
}

// PATCH - Update member status (for admin)
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { username, status, adminKey } = body

  // Simple admin key check (you can enhance this with proper auth later)
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!username || !status) {
    return NextResponse.json({ error: "Username and status required" }, { status: 400 })
  }

  if (!["belum", "payout"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("members")
    .update({ status, updated_at: new Date().toISOString() })
    .ilike("username", username)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ member: data })
}

// DELETE - Remove member (for admin)
export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { username, adminKey } = body

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("members")
    .delete()
    .ilike("username", username)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
