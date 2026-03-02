import { LpHeader } from "@/components/layout/lp-header"
import { LpFooter } from "@/components/layout/lp-footer"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LpHeader />
      <main className="flex-1 py-12">
        {children}
      </main>
      <LpFooter />
    </div>
  )
}
