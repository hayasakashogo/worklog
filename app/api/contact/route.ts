export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 })
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    return Response.json({ error: "設定エラー" }, { status: 500 })
  }

  const payload = {
    text: `*新しいお問い合わせ*\n名前: ${name}\nメール: ${email}\n内容:\n${message}`,
  }

  const slackRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!slackRes.ok) {
    return Response.json({ error: "送信に失敗しました" }, { status: 500 })
  }

  return Response.json({ ok: true })
}
