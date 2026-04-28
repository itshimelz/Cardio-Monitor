import { ResultView } from "@/components/cardio/result-view"
import type { ChartValue, ContributorInsight } from "@/lib/types"

type ResultPageProps = {
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

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams
  const prediction = Number(readParam(params, "prediction"))
  const riskProbability = Number(readParam(params, "riskProbability"))
  const confidenceLow = Number(readParam(params, "confidenceLow"))
  const confidenceHigh = Number(readParam(params, "confidenceHigh"))
  const nameOfPatient = readParam(params, "nameOfPatient")
  const modelCounter = readParam(params, "modelCounter")
  const totalCounter = readParam(params, "totalCounter")

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

  return (
    <ResultView
      hasResult={hasResult}
      isLowRisk={isLowRisk}
      riskProbability={Number.isFinite(riskProbability) ? riskProbability : undefined}
      confidenceLow={Number.isFinite(confidenceLow) ? confidenceLow : undefined}
      confidenceHigh={Number.isFinite(confidenceHigh) ? confidenceHigh : undefined}
      nameOfPatient={nameOfPatient}
      modelCounter={modelCounter}
      totalCounter={totalCounter}
      topContributors={topContributors}
      redFlags={redFlags}
      chartValuesPrimary={chartValuesPrimary}
      chartValuesSecondary={chartValuesSecondary}
    />
  )
}
