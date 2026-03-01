import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-primary">Work-Log</Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}
