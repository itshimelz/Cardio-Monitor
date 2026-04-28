import type { PredictionRequest } from "@/lib/types"
import type {
  FieldErrors,
  NumericFieldRule,
  SelectOption,
} from "@/lib/types/patient-form"

export const FORM_DRAFT_KEY = "cardio-monitor:prediction-form-draft"

export const requiredFields: (keyof PredictionRequest)[] = [
  "name",
  "age",
  "sex",
  "cp",
  "trestbps",
  "chol",
  "fbs",
  "restecg",
  "thalach",
  "exang",
  "oldpeak",
  "slope",
  "ca",
  "thal",
]

export const chestPainOptions: SelectOption[] = [
  { label: "Typical angina", value: "Typical angina" },
  { label: "Atypical angina", value: "Atypical angina" },
  { label: "Non-anginal pain", value: "Non-anginal pain" },
  { label: "Asymptomatic", value: "Asymptomatic" },
]

export const yesNoOptions: SelectOption[] = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
]

export const vesselOptions: SelectOption[] = [
  { label: "0 vessels", value: "0" },
  { label: "1 vessel", value: "1" },
  { label: "2 vessels", value: "2" },
  { label: "3 vessels", value: "3" },
]

// Keep values exactly aligned to legacy preprocessing strings.
export const slopeOptions: SelectOption[] = [
  {
    label: "Upsloping: better heart rate with exercise (uncommon)",
    value: "Upsloping: better heart rate with excercise(uncommon)",
  },
  {
    label: "Flatsloping: minimal change (typical healthy heart)",
    value: "Flatsloping: minimal change(typical healthy heart)",
  },
  {
    label: "Downsloping: signs of unhealthy heart",
    value: "Downsloping: signs of unhealthy heart",
  },
]

export const thalOptions: SelectOption[] = [
  {
    label: "fixed defect: used to be defect but ok now",
    value: "fixed defect: used to be defect but ok now",
  },
  {
    label: "reversable defect: no proper blood movement when exercising",
    value: "reversable defect: no proper blood movement when excercising",
  },
  { label: "normal", value: "normal" },
]

export const restEcgOptions: SelectOption[] = [
  { label: "Nothing to note", value: "Nothing to note" },
  { label: "ST-T Wave abnormality", value: "ST-T Wave abnormality" },
  {
    label: "Possible or definite left ventricular hypertrophy",
    value: "Possible or definite left ventricular hypertrophy",
  },
]

export const numericFieldRules: Partial<
  Record<keyof PredictionRequest, NumericFieldRule>
> = {
  age: { min: 1, max: 120, label: "Age", unit: "years", step: 1 },
  trestbps: {
    min: 70,
    max: 250,
    label: "Resting blood pressure",
    unit: "mmHg",
    step: 1,
  },
  chol: {
    min: 100,
    max: 700,
    label: "Serum cholesterol",
    unit: "mg/dl",
    step: 1,
  },
  thalach: {
    min: 60,
    max: 240,
    label: "Max heart rate achieved",
    unit: "bpm",
    step: 1,
  },
  oldpeak: { min: 0, max: 10, label: "ST depression (oldpeak)", step: 0.1 },
  ca: { min: 0, max: 3, label: "Major vessels (ca)", step: 1 },
}

export function validatePredictionForm(values: PredictionRequest): FieldErrors {
  const errors: FieldErrors = {}

  for (const field of requiredFields) {
    if (!values[field].trim()) {
      errors[field] = "This field is required."
    }
  }

  for (const [field, rule] of Object.entries(numericFieldRules)) {
    const typedField = field as keyof PredictionRequest
    const raw = values[typedField]
    if (!raw.trim()) {
      continue
    }

    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) {
      errors[typedField] = "Please enter a valid number."
      continue
    }

    if (parsed < rule.min || parsed > rule.max) {
      errors[typedField] = `${rule.label} should be between ${rule.min} and ${rule.max}.`
    }
  }

  return errors
}
