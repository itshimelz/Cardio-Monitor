"use client"

import { useEffect } from "react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

type ReportPrintControlsProps = {
  autoPrint: boolean
}

export function ReportPrintControls({ autoPrint }: ReportPrintControlsProps) {
  useEffect(() => {
    if (!autoPrint) {
      return
    }

    const timer = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [autoPrint])

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <button
        type="button"
        className={buttonVariants()}
        onClick={() => window.print()}
      >
        Download as PDF
      </button>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to form
      </Link>
    </div>
  )
}
