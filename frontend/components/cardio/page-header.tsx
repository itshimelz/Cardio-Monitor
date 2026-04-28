import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export function PageHeader() {
  return (
    <header className="space-y-5 border-b border-border/60 pb-6 text-center">
      <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
        Cardio Monitor
      </p>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
        Heart Risk Estimation
      </h1>
      <p className="mx-auto max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
        Enter your cardiovascular indicators to estimate risk and compare your
        values against baseline references.
      </p>
      <div className="flex justify-center">
        <Link href="/about" className={buttonVariants({ variant: "outline" })}>
          Learn about heart disease
        </Link>
      </div>
    </header>
  )
}
