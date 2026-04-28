import type { PredictionRequest } from "@/lib/types"

export type SelectOption = {
  label: string
  value: string
}

export type NumericFieldRule = {
  min: number
  max: number
  label: string
  unit?: string
  step?: number
}

export type StatusModalState = {
  open: boolean
  variant: "success" | "error" | "loading"
  title: string
  message: string
  continueHref?: string
}

export type FieldErrors = Partial<Record<keyof PredictionRequest, string>>
