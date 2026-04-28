import { ReportPrintControls } from "@/components/cardio/report-print-controls"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChartValue, ContributorInsight } from "@/lib/types"

type ReportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }
  return value ?? ""
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams
  const prediction = Number(readParam(params, "prediction"))
  const riskProbability = Number(readParam(params, "riskProbability"))
  const confidenceLow = Number(readParam(params, "confidenceLow"))
  const confidenceHigh = Number(readParam(params, "confidenceHigh"))
  const nameOfPatient = readParam(params, "nameOfPatient")
  const modelCounter = readParam(params, "modelCounter")
  const totalCounter = readParam(params, "totalCounter")
  const autoPrint = readParam(params, "autoPrint") === "1"

  const chartValuesPrimaryRaw = readParam(params, "chartValuesPrimary")
  const chartValuesSecondaryRaw = readParam(params, "chartValuesSecondary")
  const topContributorsRaw = readParam(params, "topContributors")
  const redFlagsRaw = readParam(params, "redFlags")

  let chartValuesPrimary: ChartValue[] = []
  let chartValuesSecondary: ChartValue[] = []
  let topContributors: ContributorInsight[] = []
  let redFlags: string[] = []

  try {
    chartValuesPrimary = JSON.parse(chartValuesPrimaryRaw) as ChartValue[]
    chartValuesSecondary = JSON.parse(chartValuesSecondaryRaw) as ChartValue[]
    topContributors = JSON.parse(topContributorsRaw) as ContributorInsight[]
    redFlags = JSON.parse(redFlagsRaw) as string[]
  } catch {
    chartValuesPrimary = []
    chartValuesSecondary = []
    topContributors = []
    redFlags = []
  }

  const hasResult = Number.isFinite(prediction) && nameOfPatient.length > 0
  const isLowRisk = prediction === 1
  const riskLabel = isLowRisk ? "Low Risk" : "High Risk"
  const probabilityPercent = Math.round((Number.isFinite(riskProbability) ? riskProbability : (isLowRisk ? 0.32 : 0.78)) * 100)
  const confidenceLowPercent = Math.round((Number.isFinite(confidenceLow) ? confidenceLow : 0.2) * 100)
  const confidenceHighPercent = Math.round((Number.isFinite(confidenceHigh) ? confidenceHigh : 0.85) * 100)
  const generatedAt = new Date().toLocaleString()
  const reportId = `CM-${String(totalCounter).padStart(4, "0")}-${new Date().toISOString().slice(0, 10)}`

  const rows = [
    ...chartValuesPrimary.map((item) => ({ ...item, group: "Primary" })),
    ...chartValuesSecondary.map((item) => ({ ...item, group: "Secondary" })),
  ]

  if (!hasResult) {
    return (
      <main className="min-h-svh bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl font-semibold">Report data missing</h1>
          <p className="text-muted-foreground">
            Open this page from the result screen so we can include your report
            values.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 print:max-w-none print:gap-4">
        <ReportPrintControls autoPrint={autoPrint} />

        <article className="rounded-xl border border-border bg-background p-5 sm:p-7 print:rounded-none print:border-0 print:p-6 print:shadow-none">
          <header className="space-y-3 border-b border-border/70 pb-4">
            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
              Cardio Monitor - Heart Risk Report
            </p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Patient Risk Report</h1>
                <p className="text-sm text-muted-foreground">
                  Generated on {generatedAt}
                </p>
                <p className="text-sm text-muted-foreground">
                  Report ID: <span className="font-medium text-foreground">{reportId}</span>
                </p>
              </div>
              <div className="rounded-lg border border-border/70 px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">Predicted Risk</p>
                <p className="text-lg font-semibold">{riskLabel}</p>
              </div>
            </div>
          </header>

          <section className="grid gap-3 border-b border-border/70 py-4 sm:grid-cols-2 lg:grid-cols-4 print:break-inside-avoid">
            <div>
              <p className="text-xs text-muted-foreground">Patient name</p>
              <p className="text-base font-semibold">{nameOfPatient}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Model counter</p>
              <p className="text-base font-semibold">{modelCounter}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total counter</p>
              <p className="text-base font-semibold">{totalCounter}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total metrics</p>
              <p className="text-base font-semibold">{rows.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk probability</p>
              <p className="text-base font-semibold">{probabilityPercent}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confidence band</p>
              <p className="text-base font-semibold">
                {confidenceLowPercent}% - {confidenceHighPercent}%
              </p>
            </div>
          </section>

          {redFlags.length > 0 ? (
            <section className="space-y-2 border-b border-border/70 py-4 print:break-inside-avoid">
              <h2 className="text-lg font-semibold tracking-tight">Red-Flag Signals</h2>
              <ol className="space-y-1">
                {redFlags.map((flag, index) => (
                  <li key={`${flag}-${index}`} className="text-sm leading-7 text-destructive">
                    {index + 1}. {flag}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {topContributors.length > 0 ? (
            <section className="space-y-2 border-b border-border/70 py-4 print:break-inside-avoid">
              <h2 className="text-lg font-semibold tracking-tight">Top Contributing Factors</h2>
              <ol className="space-y-1">
                {topContributors.map((item, index) => (
                  <li key={`${item.metric}-${index}`} className="text-sm leading-7">
                    <span className="font-semibold">{index + 1}. {item.label}:</span>{" "}
                    <span className="text-muted-foreground">{item.note}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="space-y-3 py-4 print:break-inside-avoid">
            <h2 className="text-lg font-semibold tracking-tight">Detailed Values</h2>
            <p className="text-sm text-muted-foreground">
              This table compares baseline references with your submitted values.
              Positive difference means your value is above the normal reference.
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Normal</TableHead>
                    <TableHead className="text-right">Your value</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => {
                    const diff = item.user - item.normal
                    return (
                      <TableRow key={`${item.group}-${item.metric}`}>
                        <TableCell className="font-medium">{item.metric}</TableCell>
                        <TableCell>{item.group}</TableCell>
                        <TableCell className="text-right">{item.normal.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.user.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </section>

          <footer className="border-t border-border/70 pt-4">
            <p className="text-xs leading-6 text-muted-foreground">
              Disclaimer: This report is an automated prediction and does not
              replace medical diagnosis or treatment advice. Please consult a
              qualified healthcare professional for clinical decisions.
            </p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Intended use: Screening support for non-emergency cardiovascular
              risk awareness. Not for acute chest pain triage, treatment planning,
              or definitive diagnosis.
            </p>
          </footer>
        </article>
      </div>
    </main>
  )
}
