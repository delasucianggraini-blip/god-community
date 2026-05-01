"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Search, ExternalLink } from "lucide-react"

const PAYOUT_USERS = [
  "sygtalon24", "ytttt_509", "wagelas3h", "StaceyOMGFAT", "DapDapKu",
  "Rara139269", "maybekiseee", "miidefendi17", "mattttzy7", "agstayen",
  "Doffar_91", "Sannji53", "GodStoreOFC", "Adhelapow", "Pelloss123",
  "BotiBiji22", "Abayyy0404", "probocilepep", "Aerick2019", "ZerSkyy_123",
  "ketahuanngocok", "Snow_EmperorR"
]

const BELUM_USERS = [
  "xtrott", "WhoEllish", "JevonBanks7", "TIKnTOD", "syasyayayaynud",
  "Tayy0n9", "varzhy6", "bertanya5anya", "aditzla21", "FTPGEOO",
  "Hayumiryuka", "Jeffsmith_algibran", "RgilBoboyy", "BlackyyBoyss",
  "s32alex", "ciemati6", "REZZ_KW2", "panglima5502", "JustV1nzz",
  "chelyuki2", "Delgodelllll", "SiAtung87", "mantok86gg", "ucyiku",
  "VILENzzzs"
]

type Status = "idle" | "payout" | "belum" | "tidak_terdaftar"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [checkedUsername, setCheckedUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const handleCheck = async () => {
    const trimmed = username.trim()
    if (!trimmed) return

    const uname = trimmed.toLowerCase()
    setCheckedUsername(trimmed)

    // reset avatar biar gak nyisa
    setAvatarUrl("")

    // 🔥 ambil avatar dari API
    try {
      const res = await fetch(`/api/roblox-avatar?username=${trimmed}`)
      const data = await res.json()

      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
      }
    } catch (err) {
      console.log("Avatar error:", err)
    }

    // logic status
    if (PAYOUT_USERS.map(x => x.toLowerCase()).includes(uname)) {
      setStatus("payout")
    } else if (BELUM_USERS.map(x => x.toLowerCase()).includes(uname)) {
      setStatus("belum")
    } else {
      setStatus("tidak_terdaftar")
    }
  }

  const getStatusDisplay = () => {
    switch (status) {
      case "payout":
        return {
          text: "SUDAH BISA PAYOUT",
          className: "text-primary bg-primary/10 border-primary/30"
        }
      case "belum":
        return {
          text: "BELUM BISA PAYOUT",
          className: "text-destructive bg-destructive/10 border-destructive/30"
        }
      case "tidak_terdaftar":
        return {
          text: "Tidak Terdaftar",
          className: "text-muted-foreground bg-muted border-border"
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusDisplay()

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">

  {/* LOGO */}
  <div className="mb-4 flex justify-center">
    <img
      src="/logo.jpeg"
      alt="Logo G.O.D"
      className="h-20 w-20 rounded-full object-cover shadow-lg"
    />
  </div>

  {/* BADGE */}
  <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2">
    <Users className="h-5 w-5 text-primary" />
    <span className="text-sm font-medium text-primary">Community</span>
  </div>

  {/* TITLE */}
  <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
    G.O.D COMMUNITY
  </h1>

  <p className="text-muted-foreground">
    Cek status payout akun Roblox kamu
  </p>
</div>

        {/* Join Link */}
        <a
          href="https://www.roblox.com/share/g/156121759"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-accent hover:bg-accent/20"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="font-medium">Join Komunitas di Roblox</span>
        </a>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-center text-lg font-semibold">
              Cek Status Akun
            </h2>

            <div className="flex gap-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="Masukkan username Roblox"
              />

              <Button onClick={handleCheck}>
                <Search className="mr-2 h-4 w-4" />
                Cek
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {status !== "idle" && statusInfo && (
          <Card>
            <CardContent className="flex flex-col items-center p-6">

              {/* Avatar */}
              <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border">
                <img
                  src={avatarUrl || "https://via.placeholder.com/150?text=?"}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                {checkedUsername}
              </h3>

              <div className={`rounded-full border px-4 py-2 ${statusInfo.className}`}>
                {status === "payout" && "✅ "}
                {status === "belum" && "❌ "}
                {status === "tidak_terdaftar" && "❓ "}
                {statusInfo.text}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Website ini untuk cek status payout member G.O.D Community
        </p>
      </div>
    </main>
  )
}