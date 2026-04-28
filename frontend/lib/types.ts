export type PredictionRequest = {
  name: string
  age: string
  sex: string
  cp: string
  trestbps: string
  chol: string
  fbs: string
  restecg: string
  thalach: string
  exang: string
  oldpeak: string
  slope: string
  ca: string
  thal: string
}

export type ChartValue = {
  metric: string
  normal: number
  user: number
}

export type ConfidenceBand = {
  low: number
  high: number
}

export type ContributorInsight = {
  metric: string
  label: string
  impactScore: number
  difference: number
  note: string
}

export type PredictionResponse = {
  prediction: number
  riskProbability: number
  confidenceBand: ConfidenceBand
  nameOfPatient: string
  modelCounter: number
  totalCounter: number
  topContributors: ContributorInsight[]
  redFlags: string[]
  chartValues: {
    primary: ChartValue[]
    secondary: ChartValue[]
  }
}

export const defaultPredictionRequest: PredictionRequest = {
  name: "",
  age: "",
  sex: "",
  cp: "",
  trestbps: "",
  chol: "",
  fbs: "",
  restecg: "",
  thalach: "",
  exang: "",
  oldpeak: "",
  slope: "",
  ca: "",
  thal: "",
}
