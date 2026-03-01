"use client"

import { Clock, CalendarDays, Building2, LogOut, Pencil, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types/client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AppSidebar({ clients, fullName }: { clients: Client[]; fullName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [isEditing, setIsEditing] = useState(false)
  const [nameValue, setNameValue] = useState(fullName)
  const [nameSaving, setNameSaving] = useState(false)

  // URL から現在の clientId を取得
  const match = pathname.match(/^\/dashboard\/([^/]+)/)
  const currentClientId = match?.[1] ?? clients[0]?.id ?? ""

  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`

  const menuItems = [
    { title: "打刻", href: `/dashboard/${currentClientId}`, icon: Clock, exact: true },
    { title: "勤怠一覧", href: `/dashboard/${currentClientId}/records/${currentYearMonth}`, icon: CalendarDays, exact: false },
    { title: "クライアント管理", href: `/dashboard/${currentClientId}/clients`, icon: Building2, exact: false },
  ]

  const handleClientChange = (newId: string) => {
    const newClient = clients.find((c) => c.id === newId)
    if (newClient) {
      toast.success(`「${newClient.name}」に切り替えました`)
    }
    // 現在のページ種別を維持しつつクライアントを切り替え
    if (pathname.includes("/records/")) {
      const yearMonthMatch = pathname.match(/\/records\/(\d{4}-\d{2})/)
      const ym = yearMonthMatch?.[1] ?? currentYearMonth
      router.push(`/dashboard/${newId}/records/${ym}`)
    } else if (pathname.includes("/clients")) {
      router.push(`/dashboard/${newId}/clients`)
    } else {
      router.push(`/dashboard/${newId}`)
    }
  }

  const handleSaveName = async () => {
    if (!nameValue.trim()) return
    setNameSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: nameValue.trim() })
        .eq("id", user.id)
    }
    setNameSaving(false)
    setIsEditing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 space-y-3">
        {/* ロゴ */}
        <Link href="/" className="text-lg font-bold text-primary block">
          Work-Log
        </Link>
        {/* クライアントプルダウン */}
        <Select
          value={currentClientId}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="クライアントを選択" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
            {clients.length === 0 && (
              <SelectItem value="__none" disabled>
                クライアント未登録
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {/* ユーザー名（アバター付き） */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleSaveName} disabled={nameSaving}>
              保存
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setNameValue(fullName) }}>
              ×
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <span className="flex-1 truncate">{nameValue || "（未設定）"}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* ログアウト（ナビリンクの直下に詰める） */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>ログアウト</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
