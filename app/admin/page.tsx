"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, RefreshCw, Search, Trash2, Check, X } from "lucide-react"

type Member = {
  id: string
  username: string
  status: "belum" | "payout"
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      if (data.members) {
        setMembers(data.members)
      }
    } catch (error) {
      console.error("Error fetching members:", error)
      showMessage("error", "Gagal memuat data member")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers()
    }
  }, [isAuthenticated])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleLogin = () => {
    if (adminKey.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem("adminKey", adminKey)
    }
  }

  const updateMemberStatus = async (username: string, newStatus: "belum" | "payout") => {
    try {
      const response = await fetch("/api/member", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          status: newStatus,
          adminKey: adminKey || localStorage.getItem("adminKey"),
        }),
      })
      const data = await response.json()

      if (data.error) {
        showMessage("error", data.error)
        if (data.error === "Unauthorized") {
          setIsAuthenticated(false)
          localStorage.removeItem("adminKey")
        }
      } else {
        showMessage("success", `Status ${username} diubah ke ${newStatus}`)
        fetchMembers()
      }
    } catch (error) {
      showMessage("error", "Gagal mengubah status")
    }
  }

  const addMember = async () => {
    if (!newUsername.trim()) return
    
    setIsAdding(true)
    try {
      const response = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          status: "belum",
          adminKey: adminKey || localStorage.getItem("adminKey"),
        }),
      })
      const data = await response.json()

      if (data.error) {
        showMessage("error", data.error)
        if (data.error === "Unauthorized") {
          setIsAuthenticated(false)
          localStorage.removeItem("adminKey")
        }
      } else {
        showMessage("success", `${newUsername} berhasil ditambahkan`)
        setNewUsername("")
        fetchMembers()
      }
    } catch (error) {
      showMessage("error", "Gagal menambah member")
    }
    setIsAdding(false)
  }

  const deleteMember = async (username: string) => {
    if (!confirm(`Yakin hapus ${username}?`)) return

    try {
      const response = await fetch("/api/member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          adminKey: adminKey || localStorage.getItem("adminKey"),
        }),
      })
      const data = await response.json()

      if (data.error) {
        showMessage("error", data.error)
      } else {
        showMessage("success", `${username} dihapus`)
        fetchMembers()
      }
    } catch (error) {
      showMessage("error", "Gagal menghapus member")
    }
  }

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const payoutCount = members.filter((m) => m.status === "payout").length
  const belumCount = members.filter((m) => m.status === "belum").length

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-foreground">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Masukkan Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-input text-foreground"
            />
            <Button onClick={handleLogin} className="w-full">
              <Unlock className="mr-2 h-4 w-4" />
              Masuk
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Kelola member G.O.D Community
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false)
              localStorage.removeItem("adminKey")
            }}
          >
            Logout
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
              <p className="text-xs text-muted-foreground">Total Member</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{payoutCount}</p>
              <p className="text-xs text-muted-foreground">Bisa Payout</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{belumCount}</p>
              <p className="text-xs text-muted-foreground">Belum Bisa</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Member */}
        <Card className="mb-4 border-border bg-card">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Tambah Member Baru</p>
            <div className="flex gap-2">
              <Input
                placeholder="Username Roblox"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                className="bg-input text-foreground"
              />
              <Button onClick={addMember} disabled={isAdding || !newUsername.trim()}>
                {isAdding ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Tambah"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search & Refresh */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input pl-10 text-foreground"
            />
          </div>
          <Button variant="outline" onClick={fetchMembers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Members List */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? "Tidak ada hasil" : "Belum ada member"}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {member.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={member.status === "payout" ? "default" : "destructive"}
                        className={
                          member.status === "payout"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        }
                      >
                        {member.status === "payout" ? "Payout" : "Belum"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateMemberStatus(
                            member.username,
                            member.status === "payout" ? "belum" : "payout"
                          )
                        }
                        title={
                          member.status === "payout"
                            ? "Ubah ke Belum"
                            : "Ubah ke Payout"
                        }
                      >
                        {member.status === "payout" ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMember(member.username)}
                        title="Hapus member"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
