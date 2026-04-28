import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function ErrorInfoPage() {
  return (
    <main className="min-h-svh bg-linear-to-b from-background to-muted/30 px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2 border-b border-border/60 pb-4">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            Cardio Monitor
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Something went wrong
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Some required data may be missing or the prediction service is
            temporarily unavailable.
          </p>
        </header>

        <div className="space-y-2 text-sm leading-7 text-muted-foreground">
          <p>- Verify all fields are filled before submitting the form.</p>
          <p>- Check backend API availability (`/api/predict`).</p>
          <p>- Retry after refreshing the page.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Back to form
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "outline" })}>
            Read about heart disease
          </Link>
        </div>
      </div>
    </main>
  )
}
