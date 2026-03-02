import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"

export function LpHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xs">
      <div className="container mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-12 py-3">
        <Link href="/" className="text-xl font-bold text-primary">
          Work-Log
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Button size="sm" asChild className="px-3 sm:w-28 shadow-sm shadow-primary/20 font-semibold text-xs sm:text-sm">
            <Link href="/signup">無料で始める</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="px-3 sm:w-28 border-primary! bg-white text-primary font-bold hover:bg-primary/5 hover:text-primary text-xs sm:text-sm">
            <Link href="/login">ログイン</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
