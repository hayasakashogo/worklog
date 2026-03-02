import { LpHeader } from "@/components/layout/lp-header"
import { LpFooter } from "@/components/layout/lp-footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LpHeader />
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
      <LpFooter />
    </div>
  )
}
