"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { ComparisonChart } from "@/components/cardio/comparison-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChartValue, ContributorInsight } from "@/lib/types"
import { cn } from "@/lib/utils"

type ResultViewProps = {
  hasResult: boolean
  isLowRisk: boolean
  riskProbability?: number
  confidenceLow?: number
  confidenceHigh?: number
  nameOfPatient: string
  modelCounter: string
  totalCounter: string
  topContributors: ContributorInsight[]
  redFlags: string[]
  chartValuesPrimary: ChartValue[]
  chartValuesSecondary: ChartValue[]
}

function RiskHeartSvg({ isLowRisk }: { isLowRisk: boolean }) {
  const strokeColor = isLowRisk ? "#10b981" : "#ef4444"
  const fillColor = isLowRisk ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)"

  return (
    <motion.svg
      viewBox="0 0 240 180"
      className="h-56 w-full max-w-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      role="img"
      aria-label={isLowRisk ? "Low risk heart indicator" : "High risk heart indicator"}
    >
      <motion.path
        d="M120 150c-3.5-3.2-8.2-7.2-13.7-11.7C74.4 111.1 40 83.1 40 52.5 40 34.6 54.3 20 72 20c12.1 0 23.6 5.6 31 15.1C110.4 25.6 121.9 20 134 20c17.7 0 32 14.6 32 32.5 0 30.6-34.4 58.6-66.3 85.8-5.5 4.5-10.2 8.5-13.7 11.7Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3"
      />
      <motion.path
        d="M32 96h42l14-26 19 53 20-39 10 20h72"
        fill="none"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
      />
      <motion.circle
        cx="103"
        cy="85"
        r="54"
        fill="none"
        stroke={strokeColor}
        strokeOpacity="0.35"
        strokeWidth="2"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.12, 0.3] }}
        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ transformOrigin: "103px 85px" }}
      />
    </motion.svg>
  )
}

export function ResultView({
  hasResult,
  isLowRisk,
  riskProbability,
  confidenceLow,
  confidenceHigh,
  nameOfPatient,
  modelCounter,
  totalCounter,
  topContributors,
  redFlags,
  chartValuesPrimary,
  chartValuesSecondary,
}: ResultViewProps) {
  const reportSearch = new URLSearchParams({
    prediction: String(isLowRisk ? 1 : 0),
    riskProbability: String(riskProbability ?? ""),
    confidenceLow: String(confidenceLow ?? ""),
    confidenceHigh: String(confidenceHigh ?? ""),
    nameOfPatient,
    modelCounter,
    totalCounter,
    topContributors: JSON.stringify(topContributors),
    redFlags: JSON.stringify(redFlags),
    chartValuesPrimary: JSON.stringify(chartValuesPrimary),
    chartValuesSecondary: JSON.stringify(chartValuesSecondary),
    autoPrint: "1",
  }).toString()

  const totalMetrics = chartValuesPrimary.length + chartValuesSecondary.length
  const allMetrics = [
    ...chartValuesPrimary.map((item) => ({ ...item, group: "Primary" as const })),
    ...chartValuesSecondary.map((item) => ({ ...item, group: "Secondary" as const })),
  ]
  const elevatedMetrics = [...chartValuesPrimary, ...chartValuesSecondary].filter(
    (item) => item.user > item.normal
  ).length
  const withinRangeMetrics = totalMetrics - elevatedMetrics
  const elevatedRatio = totalMetrics > 0 ? elevatedMetrics / totalMetrics : 0
  const gaugePercent = isLowRisk ? 30 : 78
  const riskLabel = isLowRisk ? "Low Risk" : "High Risk"
  const probabilityPercent = Math.round((riskProbability ?? (isLowRisk ? 0.32 : 0.78)) * 100)
  const confidenceLowPercent = Math.round((confidenceLow ?? 0.2) * 100)
  const confidenceHighPercent = Math.round((confidenceHigh ?? 0.85) * 100)
  const riskToneClass = isLowRisk
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"

  if (!hasResult) {
    return (
      <main className="min-h-svh bg-linear-to-b from-background to-muted/30 px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Alert variant="destructive">
            <AlertTitle>No prediction data found</AlertTitle>
            <AlertDescription>
              Submit the form first to view the result page.
            </AlertDescription>
          </Alert>
          <Link href="/" className={buttonVariants({ className: "w-fit" })}>
            Back to form
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-linear-to-b from-background to-muted/30 px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Prediction Result
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                riskToneClass
              )}
            >
              {riskLabel}
            </span>
            <Badge variant="secondary">Model counter: {modelCounter}</Badge>
            <Badge variant="outline">Total counter: {totalCounter}</Badge>
          </div>
        </motion.div>

        <section
          role="status"
          aria-live="polite"
          className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3"
        >
          <div className="space-y-2">
            <p className="text-sm leading-7 text-primary">
              Medical Notice: This result is an AI-based risk estimate and not a
              medical diagnosis. Please consult a doctor if symptoms persist or
              worsen.
            </p>
            <p className="text-xs leading-6 text-primary/90">
              Intended use: Early screening support for adults using self-reported
              inputs. Not intended for emergency triage or treatment decisions.
            </p>
          </div>
        </section>

        <section className="grid gap-8 border-b border-border/60 pb-8 md:grid-cols-[auto_1fr] md:items-center">
          <RiskHeartSvg isLowRisk={isLowRisk} />
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Risk Overview
            </p>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Hello {nameOfPatient}
            </h2>
            {isLowRisk ? (
              <p className="text-sm leading-7 text-muted-foreground">
                Good news. You currently show{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  low heart-disease risk
                </span>
                . Keep monitoring your lifestyle and continue regular checkups.
              </p>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                Your result indicates{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  high heart-disease risk
                </span>
                . Please consult a doctor quickly and review additional guidance.
              </p>
            )}
            <div className="grid gap-3 pt-2 lg:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Risk gauge
                </p>
                <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <svg viewBox="0 0 120 70" className="h-24 w-36 shrink-0 sm:h-28 sm:w-40">
                    <path
                      d="M10 60 A50 50 0 0 1 110 60"
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 60 A50 50 0 0 1 110 60"
                      fill="none"
                      stroke="currentColor"
                      className={cn(isLowRisk ? "text-primary" : "text-destructive")}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(1, gaugePercent * 1.57)} 200`}
                    />
                    <circle cx="60" cy="60" r="4" className="fill-foreground" />
                  </svg>
                  <div className="w-full space-y-1 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground">Estimated risk zone</p>
                    <p className="text-2xl font-semibold">{riskLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      Gauge reflects overall model classification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Summary donut
                </p>
                <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                    <circle
                      cx="60"
                      cy="60"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="14"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      className="text-destructive"
                      strokeWidth="14"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      strokeDasharray={`${Math.max(1, elevatedRatio * 276)} 276`}
                    />
                  </svg>
                  <div className="w-full space-y-1 text-center text-sm sm:text-left">
                    <p className="font-semibold">{elevatedMetrics} elevated metrics</p>
                    <p className="text-muted-foreground">{withinRangeMetrics} within range</p>
                    <p className="text-muted-foreground">
                      Based on comparison with baseline references.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="space-y-4 border-b border-border/60 pb-8">
          <h2 className="text-xl font-semibold tracking-tight">Your Data Statistics</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Compare your values against baseline reference values. Focus first on
            metrics where your bar is higher than normal.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Symptom & ECG metrics chart
              </h3>
              <p className="text-xs leading-6 text-muted-foreground">
                Includes chest pain, fasting sugar, ECG pattern, exercise angina,
                oldpeak, slope, vessel count, and thal condition.
              </p>
              <ComparisonChart data={chartValuesPrimary} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Vitals & lab metrics chart
              </h3>
              <p className="text-xs leading-6 text-muted-foreground">
                Includes resting blood pressure, cholesterol, and maximum heart rate.
              </p>
              <ComparisonChart data={chartValuesSecondary} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Detailed Metrics Table
              </h3>
              <p className="text-xs leading-6 text-muted-foreground">
                Exact values used in prediction. Difference = Your value - Normal
                reference.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Health metric</TableHead>
                  <TableHead>Metric category</TableHead>
                  <TableHead className="text-right">Normal reference</TableHead>
                  <TableHead className="text-right">Patient value</TableHead>
                  <TableHead className="text-right">Difference (Patient - Normal)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMetrics.map((item) => {
                  const diff = item.user - item.normal
                  const isHigher = diff > 0
                  return (
                    <TableRow key={`${item.group}-${item.metric}`}>
                      <TableCell className="font-medium">{item.metric}</TableCell>
                      <TableCell>
                        <Badge variant={item.group === "Primary" ? "secondary" : "outline"}>
                          {item.group}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.normal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.user.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-medium",
                            isHigher
                              ? "text-destructive"
                              : diff < 0
                                ? "text-primary"
                                : "text-muted-foreground"
                          )}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-b border-border/60 pb-8 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              Risk probability
            </p>
            <p className="mt-2 text-3xl font-semibold">{probabilityPercent}%</p>
            <p className="text-sm text-muted-foreground">
              Model-estimated chance of low-risk class for this profile.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/10 p-4 md:col-span-2">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              Confidence band
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {confidenceLowPercent}% - {confidenceHighPercent}%
            </p>
            <div className="mt-3 h-2 rounded-full bg-border">
              <div
                className={cn("h-2 rounded-full", isLowRisk ? "bg-primary" : "bg-destructive")}
                style={{
                  width: `${Math.max(1, confidenceHighPercent - confidenceLowPercent)}%`,
                  marginLeft: `${Math.max(0, confidenceLowPercent)}%`,
                }}
              />
            </div>
          </div>
        </section>

        {(redFlags.length > 0 || topContributors.length > 0) && (
          <section className="grid gap-8 border-b border-border/60 pb-8 md:grid-cols-2">
            {redFlags.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Red-Flag Signals</h2>
                <ol className="space-y-2">
                  {redFlags.map((flag, index) => (
                    <li key={`${flag}-${index}`} className="text-sm leading-7 text-destructive">
                      {index + 1}. {flag}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {topContributors.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Top Contributing Factors</h2>
                <ol className="space-y-3">
                  {topContributors.map((item, index) => (
                    <li key={`${item.metric}-${index}`} className="border-b border-border/50 pb-3 last:border-b-0">
                      <p className="text-sm font-semibold">
                        {index + 1}. {item.label}
                      </p>
                      <p className="text-sm leading-7 text-muted-foreground">{item.note}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        <section className="space-y-3 border-b border-border/60 pb-8">
          <h2 className="text-xl font-semibold tracking-tight">Suggested Next Steps</h2>
          <ol className="space-y-3">
            <li className="flex gap-3 border-b border-border/50 pb-3">
              <span className="text-sm font-semibold text-primary">01</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Review with a professional</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Discuss elevated metrics with a healthcare professional and
                  share this report.
                </p>
              </div>
            </li>
            <li className="flex gap-3 border-b border-border/50 pb-3">
              <span className="text-sm font-semibold text-primary">02</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Track key indicators weekly</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Monitor blood pressure, glucose, activity, and sleep patterns
                  over time.
                </p>
              </div>
            </li>
            <li className="flex gap-3 pb-1">
              <span className="text-sm font-semibold text-primary">03</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Repeat assessment after changes</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Re-run this prediction after medication, exercise, or diet
                  changes.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Predict again
          </Link>
          <Link
            href={`/report?${reportSearch}`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            Download report (PDF)
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "outline" })}>
            About heart disease
          </Link>
        </div>
      </div>
    </main>
  )
}
