import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  try {
    // Get user ID from username
    const userResponse = await fetch(
      `https://users.roblox.com/v1/usernames/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      }
    )
    
    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    const userData = await userResponse.json()

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userData.data[0].id
    const displayName = userData.data[0].displayName

    // Get avatar thumbnail
    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    )

    if (!avatarResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch avatar" }, { status: 500 })
    }

    const avatarData = await avatarResponse.json()

    if (!avatarData.data || avatarData.data.length === 0) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
    }

    return NextResponse.json({
      userId,
      displayName,
      avatarUrl: avatarData.data[0].imageUrl,
    })
  } catch (error) {
    console.error("Error fetching Roblox data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
