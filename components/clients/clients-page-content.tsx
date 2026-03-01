"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types/client"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

export function ClientsPageContent({
  clients: initialClients,
  currentClientId,
}: {
  clients: Client[]
  currentClientId: string
}) {
  const [clients, setClients] = useState(initialClients)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const refreshClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true })
    if (data) {
      setClients(data as Client[])
    }
    router.refresh()
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingClient(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("このクライアントを削除しますか？関連する勤怠データも削除されます。")) return
    await supabase.from("clients").delete().eq("id", id)
    await refreshClients()
    // 削除したのが現在のクライアントなら、別のクライアントにリダイレクト
    if (id === currentClientId) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">クライアント管理</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          追加
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            クライアントが登録されていません。「追加」ボタンから登録してください。
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>クライアント一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>クライアント名</TableHead>
                  <TableHead>標準工数</TableHead>
                  <TableHead>定時</TableHead>
                  <TableHead>休憩</TableHead>
                  <TableHead>休み設定</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className={client.id === currentClientId ? "bg-primary/10" : ""}>
                    <TableCell>
                      <input
                        type="radio"
                        name="active-client"
                        checked={client.id === currentClientId}
                        onChange={() => {
                          router.push(`/dashboard/${client.id}/clients`)
                          toast.success(`「${client.name}」に切り替えました`)
                        }}
                        className="accent-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      {client.min_hours}〜{client.max_hours}h
                    </TableCell>
                    <TableCell>
                      {client.default_start_time.slice(0, 5)}〜{client.default_end_time.slice(0, 5)}
                    </TableCell>
                    <TableCell>{client.default_rest_minutes}分</TableCell>
                    <TableCell>
                      {[
                        ...client.holidays.map((d) => WEEKDAY_LABELS[d]),
                        ...(client.include_national_holidays ? ["祝日"] : []),
                      ].join("・")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingClient={editingClient}
        onSaved={refreshClients}
      />
    </div>
  )
}
