"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  FieldLabelWithHelp,
  SelectField,
  getFilledFieldClass,
} from "@/components/cardio/patient-form-fields"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  FORM_DRAFT_KEY,
  chestPainOptions,
  numericFieldRules,
  requiredFields,
  restEcgOptions,
  slopeOptions,
  thalOptions,
  validatePredictionForm,
  vesselOptions,
  yesNoOptions,
} from "@/lib/data/patient-form"
import {
  defaultPredictionRequest,
  type PredictionRequest,
  type PredictionResponse,
} from "@/lib/types"
import type { FieldErrors, StatusModalState } from "@/lib/types/patient-form"
import { cn } from "@/lib/utils"

type FormStep = {
  id: number
  title: string
  subtitle: string
  fields: (keyof PredictionRequest)[]
}

const formSteps: FormStep[] = [
  {
    id: 1,
    title: "Basic Information",
    subtitle: "Patient profile details",
    fields: ["name", "age", "sex", "cp"],
  },
  {
    id: 2,
    title: "Vitals & Lab Values",
    subtitle: "Core measurements and labs",
    fields: ["trestbps", "chol", "thalach", "fbs"],
  },
  {
    id: 3,
    title: "ECG & Diagnostics",
    subtitle: "ECG and stress findings",
    fields: ["oldpeak", "ca", "exang", "restecg", "slope", "thal"],
  },
  {
    id: 4,
    title: "Review & Submit",
    subtitle: "Confirm and run prediction",
    fields: [],
  },
]

const predictionLoadingSteps = [
  "Adjusting age-risk weighting",
  "Normalizing blood pressure and pulse response",
  "Calibrating cholesterol and glucose impact",
  "Aligning ECG and diagnostic markers",
  "Finalizing cardiovascular risk profile",
]

export function PatientForm() {
  const router = useRouter()
  const [form, setForm] = useState<PredictionRequest>(() => {
    if (typeof window === "undefined") {
      return defaultPredictionRequest
    }
    try {
      const raw = window.localStorage.getItem(FORM_DRAFT_KEY)
      if (!raw) {
        return defaultPredictionRequest
      }
      const parsed = JSON.parse(raw) as Partial<PredictionRequest>
      return { ...defaultPredictionRequest, ...parsed }
    } catch {
      return defaultPredictionRequest
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [activeStep, setActiveStep] = useState(1)
  const [isReviewReady, setIsReviewReady] = useState(false)
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const reviewTimerRef = useRef<number | null>(null)
  const loadingTickerRef = useRef<number | null>(null)
  const loadingProgressRef = useRef<number | null>(null)
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    open: false,
    variant: "success",
    title: "",
    message: "",
  })

  useEffect(() => {
    window.localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    return () => {
      if (reviewTimerRef.current) {
        window.clearTimeout(reviewTimerRef.current)
      }
      if (loadingTickerRef.current) {
        window.clearInterval(loadingTickerRef.current)
      }
      if (loadingProgressRef.current) {
        window.clearInterval(loadingProgressRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (loadingTickerRef.current) {
      window.clearInterval(loadingTickerRef.current)
      loadingTickerRef.current = null
    }

    if (statusModal.open && statusModal.variant === "loading") {
      loadingTickerRef.current = window.setInterval(() => {
        setLoadingStepIndex((previous) => (previous + 1) % predictionLoadingSteps.length)
      }, 700)
    }

    return () => {
      if (loadingTickerRef.current) {
        window.clearInterval(loadingTickerRef.current)
        loadingTickerRef.current = null
      }
    }
  }, [statusModal.open, statusModal.variant])

  function setFieldValue<K extends keyof PredictionRequest>(
    field: K,
    value: PredictionRequest[K]
  ) {
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous
      }
      return { ...previous, [field]: undefined }
    })
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function buildResultSearchParams(response: PredictionResponse) {
    const safeRiskProbability =
      typeof response.riskProbability === "number" && Number.isFinite(response.riskProbability)
        ? response.riskProbability
        : response.prediction === 1
          ? 0.32
          : 0.78
    const safeConfidenceLow =
      typeof response.confidenceBand?.low === "number" && Number.isFinite(response.confidenceBand.low)
        ? response.confidenceBand.low
        : 0.2
    const safeConfidenceHigh =
      typeof response.confidenceBand?.high === "number" && Number.isFinite(response.confidenceBand.high)
        ? response.confidenceBand.high
        : 0.85
    const safeTopContributors = Array.isArray(response.topContributors)
      ? response.topContributors
      : []
    const safeRedFlags = Array.isArray(response.redFlags) ? response.redFlags : []

    const params = new URLSearchParams({
      prediction: String(response.prediction),
      riskProbability: String(safeRiskProbability),
      confidenceLow: String(safeConfidenceLow),
      confidenceHigh: String(safeConfidenceHigh),
      nameOfPatient: response.nameOfPatient,
      modelCounter: String(response.modelCounter),
      totalCounter: String(response.totalCounter),
      topContributors: JSON.stringify(safeTopContributors),
      redFlags: JSON.stringify(safeRedFlags),
      chartValuesPrimary: JSON.stringify(response.chartValues.primary),
      chartValuesSecondary: JSON.stringify(response.chartValues.secondary),
    })
    return params.toString()
  }

  function resetAllFields() {
    setForm(defaultPredictionRequest)
    setFieldErrors({})
    setActiveStep(1)
    window.localStorage.removeItem(FORM_DRAFT_KEY)
  }

  function validateCurrentStep() {
    const allErrors = validatePredictionForm(form)
    const step = formSteps[activeStep - 1]
    const stepErrors: FieldErrors = {}

    for (const field of step.fields) {
      if (allErrors[field]) {
        stepErrors[field] = allErrors[field]
      }
    }

    return stepErrors
  }

  function goToNextStep() {
    const stepErrors = validateCurrentStep()
    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors((previous) => ({ ...previous, ...stepErrors }))
      const firstInvalidField = formSteps[activeStep - 1].fields.find((field) => stepErrors[field])
      if (firstInvalidField) {
        window.setTimeout(() => {
          document.getElementById(firstInvalidField)?.focus()
        }, 0)
      }
      return
    }

    const nextStep = Math.min(activeStep + 1, formSteps.length)
    setActiveStep(nextStep)

    if (reviewTimerRef.current) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    if (nextStep === formSteps.length) {
      setIsReviewReady(false)
      reviewTimerRef.current = window.setTimeout(() => {
        setIsReviewReady(true)
      }, 700)
    } else {
      setIsReviewReady(false)
    }
  }

  function goToPreviousStep() {
    if (reviewTimerRef.current) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    setIsReviewReady(false)
    setActiveStep((prev) => Math.max(prev - 1, 1))
  }

  function startLoadingProgress(durationMs: number) {
    if (loadingProgressRef.current) {
      window.clearInterval(loadingProgressRef.current)
      loadingProgressRef.current = null
    }

    const startedAt = Date.now()
    setLoadingProgress(6)
    loadingProgressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const ratio = Math.min(elapsed / durationMs, 1)
      const next = Math.min(95, Math.round(6 + ratio * 89))
      setLoadingProgress(next)
    }, 90)
  }

  function stopLoadingProgress(finalProgress = 100) {
    if (loadingProgressRef.current) {
      window.clearInterval(loadingProgressRef.current)
      loadingProgressRef.current = null
    }
    setLoadingProgress(finalProgress)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (activeStep !== formSteps.length) {
      goToNextStep()
      return
    }
    if (!isReviewReady) {
      return
    }
    setFieldErrors({})
    setStatusModal((prev) => ({ ...prev, open: false }))

    const validationErrors = validatePredictionForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      const firstInvalidField = requiredFields.find((field) => validationErrors[field])
      if (firstInvalidField) {
        window.setTimeout(() => {
          document.getElementById(firstInvalidField)?.focus()
        }, 0)
      }
      setStatusModal({
        open: true,
        variant: "error",
        title: "Please review your inputs",
        message: "Some fields are missing or outside the valid range.",
      })
      return
    }

    setIsSubmitting(true)
    setLoadingStepIndex(0)
    setStatusModal({
      open: true,
      variant: "loading",
      title: "Running prediction analysis",
      message: "",
    })
    const randomLoadingMs = 1700 + Math.floor(Math.random() * 1900)
    startLoadingProgress(randomLoadingMs)
    const minimumLoadingDelay = new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), randomLoadingMs)
    })

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as
        | PredictionResponse
        | { error?: string; missingFields?: string[] }

      await minimumLoadingDelay
      stopLoadingProgress(100)

      if (!response.ok) {
        const missingFieldText =
          "missingFields" in payload && Array.isArray(payload.missingFields)
            ? ` Missing: ${payload.missingFields.join(", ")}.`
            : ""
        const detail =
          "error" in payload && payload.error ? payload.error : "Request failed."
        setStatusModal({
          open: true,
          variant: "error",
          title: "Prediction failed",
          message: `${detail}${missingFieldText}`,
        })
        return
      }

      const search = buildResultSearchParams(payload as PredictionResponse)
      window.localStorage.removeItem(FORM_DRAFT_KEY)
      setStatusModal({
        open: true,
        variant: "success",
        title: "Prediction complete",
        message: "Your report is ready. Continue to view your result.",
        continueHref: `/result?${search}`,
      })
    } catch {
      await minimumLoadingDelay
      stopLoadingProgress(100)
      setStatusModal({
        open: true,
        variant: "error",
        title: "Connection error",
        message: "Unable to connect to prediction service. Please try again.",
      })
    } finally {
      stopLoadingProgress(100)
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Patient details</h2>
          <p className="text-base text-muted-foreground">
            Complete all required fields to run a prediction request.
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 text-base"
            onClick={resetAllFields}
          >
            Reset all
          </Button>
        </div>
      </div>
      <div className="relative">
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {formSteps.map((step, index) => {
            const isCompleted = activeStep > index + 1
            const isCurrent = activeStep === index + 1
            return (
              <li key={step.id} className="relative flex items-center gap-2">
                <div
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    isCompleted || isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                      : "border-primary/60 text-primary"
                  )}
                >
                  {step.id}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{step.title}</p>
                  <p className="truncate text-xs text-muted-foreground">Step {step.id}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="pointer-events-none absolute inset-x-0 -bottom-2.5 hidden md:block">
          <div className="relative h-px bg-border">
            <div
              className="absolute left-0 top-0 h-px bg-primary transition-all duration-500 ease-in-out"
              style={{
                width: `${((activeStep - 1) / (formSteps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-6 border-b border-border/60 pb-8">
        {Object.keys(fieldErrors).length > 0 ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
            <p className="text-sm font-semibold text-destructive">
              Please fix {Object.keys(fieldErrors).length} highlighted field(s) below.
            </p>
          </div>
        ) : null}
        <form id="patient-form" onSubmit={handleSubmit} className="space-y-8">
          {activeStep === 1 ? (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="Name"
                  htmlFor="name"
                  helpText="Your full name helps personalize the report and identify your prediction result."
                />
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setFieldValue("name", event.target.value)}
                  placeholder="Your name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.name),
                    fieldErrors.name ? "border-destructive/70 focus-visible:ring-destructive/40" : ""
                  )}
                />
                {fieldErrors.name ? (
                  <p id="name-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="Age"
                  htmlFor="age"
                  helpText="Age affects heart disease risk. Risk generally increases as age gets higher."
                />
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(event) => setFieldValue("age", event.target.value)}
                  placeholder="e.g. 34"
                  min={numericFieldRules.age?.min}
                  max={numericFieldRules.age?.max}
                  step={numericFieldRules.age?.step}
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors.age)}
                  aria-describedby={fieldErrors.age ? "age-hint age-error" : "age-hint"}
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.age),
                    fieldErrors.age ? "border-destructive/70 focus-visible:ring-destructive/40" : ""
                  )}
                />
                <p id="age-hint" className="text-xs leading-6 text-muted-foreground">
                  Range: 1 - 120 years
                </p>
                {fieldErrors.age ? (
                  <p id="age-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.age}
                  </p>
                ) : null}
              </div>
              <SelectField
                id="sex"
                label="Gender"
                helpText="Biological sex can influence baseline heart disease patterns in clinical datasets."
                placeholder="Select gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                value={form.sex}
                error={fieldErrors.sex}
                onValueChange={(value) => setFieldValue("sex", value ?? "")}
              />
              <SelectField
                id="cp"
                label="Chest pain type"
                helpText="Type of chest pain is a key symptom indicator used in many heart disease screening models."
                placeholder="Select chest pain type"
                options={chestPainOptions}
                value={form.cp}
                error={fieldErrors.cp}
                onValueChange={(value) => setFieldValue("cp", value ?? "")}
              />
            </div>
          </section>
          ) : null}

          {activeStep === 2 ? (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">Vitals & Lab Values</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="Resting blood pressure"
                  htmlFor="trestbps"
                  helpText="Your blood pressure while resting. High resting blood pressure can indicate extra strain on the heart."
                />
                <Input
                  id="trestbps"
                  type="number"
                  value={form.trestbps}
                  onChange={(event) => setFieldValue("trestbps", event.target.value)}
                  placeholder="e.g. 130"
                  min={numericFieldRules.trestbps?.min}
                  max={numericFieldRules.trestbps?.max}
                  step={numericFieldRules.trestbps?.step}
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors.trestbps)}
                  aria-describedby={
                    fieldErrors.trestbps ? "trestbps-hint trestbps-error" : "trestbps-hint"
                  }
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.trestbps),
                    fieldErrors.trestbps
                      ? "border-destructive/70 focus-visible:ring-destructive/40"
                      : ""
                  )}
                />
                <p id="trestbps-hint" className="text-xs leading-6 text-muted-foreground">
                  Range: 70 - 250 mmHg
                </p>
                {fieldErrors.trestbps ? (
                  <p id="trestbps-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.trestbps}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="Serum cholesterol (mg/dl)"
                  htmlFor="chol"
                  helpText="Total cholesterol in your blood. Higher values are commonly associated with increased cardiovascular risk."
                />
                <Input
                  id="chol"
                  type="number"
                  value={form.chol}
                  onChange={(event) => setFieldValue("chol", event.target.value)}
                  placeholder="e.g. 250"
                  min={numericFieldRules.chol?.min}
                  max={numericFieldRules.chol?.max}
                  step={numericFieldRules.chol?.step}
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors.chol)}
                  aria-describedby={fieldErrors.chol ? "chol-hint chol-error" : "chol-hint"}
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.chol),
                    fieldErrors.chol ? "border-destructive/70 focus-visible:ring-destructive/40" : ""
                  )}
                />
                <p id="chol-hint" className="text-xs leading-6 text-muted-foreground">
                  Range: 100 - 700 mg/dl
                </p>
                {fieldErrors.chol ? (
                  <p id="chol-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.chol}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="Max heart rate achieved"
                  htmlFor="thalach"
                  helpText="Highest heart rate reached during activity or stress testing. This reflects cardiovascular response capacity."
                />
                <Input
                  id="thalach"
                  type="number"
                  value={form.thalach}
                  onChange={(event) => setFieldValue("thalach", event.target.value)}
                  placeholder="e.g. 187"
                  min={numericFieldRules.thalach?.min}
                  max={numericFieldRules.thalach?.max}
                  step={numericFieldRules.thalach?.step}
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors.thalach)}
                  aria-describedby={
                    fieldErrors.thalach ? "thalach-hint thalach-error" : "thalach-hint"
                  }
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.thalach),
                    fieldErrors.thalach
                      ? "border-destructive/70 focus-visible:ring-destructive/40"
                      : ""
                  )}
                />
                <p id="thalach-hint" className="text-xs leading-6 text-muted-foreground">
                  Range: 60 - 240 bpm
                </p>
                {fieldErrors.thalach ? (
                  <p id="thalach-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.thalach}
                  </p>
                ) : null}
              </div>
              <SelectField
                id="fbs"
                label="Fasting blood sugar > 120 mg/dl"
                helpText="Shows whether fasting glucose is elevated. High blood sugar is linked with long-term heart and vessel risk."
                placeholder="Select yes/no"
                options={yesNoOptions}
                value={form.fbs}
                error={fieldErrors.fbs}
                onValueChange={(value) => setFieldValue("fbs", value ?? "")}
              />
            </div>
          </section>
          ) : null}

          {activeStep === 3 ? (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">ECG & Diagnostic Findings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabelWithHelp
                  label="ST depression (oldpeak)"
                  htmlFor="oldpeak"
                  helpText="A measure from ECG during exercise compared with rest. Higher values may suggest reduced blood flow to the heart."
                />
                <Input
                  id="oldpeak"
                  type="number"
                  value={form.oldpeak}
                  onChange={(event) => setFieldValue("oldpeak", event.target.value)}
                  placeholder="e.g. 2"
                  min={numericFieldRules.oldpeak?.min}
                  max={numericFieldRules.oldpeak?.max}
                  step={numericFieldRules.oldpeak?.step}
                  inputMode="decimal"
                  aria-invalid={Boolean(fieldErrors.oldpeak)}
                  aria-describedby={
                    fieldErrors.oldpeak ? "oldpeak-hint oldpeak-error" : "oldpeak-hint"
                  }
                  className={cn(
                    "h-12 text-base",
                    getFilledFieldClass(form.oldpeak),
                    fieldErrors.oldpeak
                      ? "border-destructive/70 focus-visible:ring-destructive/40"
                      : ""
                  )}
                />
                <p id="oldpeak-hint" className="text-xs leading-6 text-muted-foreground">
                  Range: 0 - 10
                </p>
                {fieldErrors.oldpeak ? (
                  <p id="oldpeak-error" className="text-sm leading-6 text-destructive">
                    {fieldErrors.oldpeak}
                  </p>
                ) : null}
              </div>
              <SelectField
                id="ca"
                label="Major vessels (ca)"
                helpText="Number of major blood vessels observed in imaging (0 to 3)."
                placeholder="Select vessel count"
                options={vesselOptions}
                value={form.ca}
                error={fieldErrors.ca}
                hint="Use the imaging/clinical value from 0 to 3."
                hintId="ca-hint"
                onValueChange={(value) => setFieldValue("ca", value ?? "")}
              />
              <SelectField
                id="exang"
                label="Exercise induced angina"
                helpText="Indicates whether chest pain appears during physical activity. This can signal reduced blood supply to heart muscle."
                placeholder="Select yes/no"
                options={yesNoOptions}
                value={form.exang}
                error={fieldErrors.exang}
                onValueChange={(value) => setFieldValue("exang", value ?? "")}
              />
              <SelectField
                id="restecg"
                label="Resting electrocardiographic result"
                helpText="Your ECG pattern while resting. Certain abnormalities may be associated with underlying cardiac conditions."
                placeholder="Select ECG result"
                options={restEcgOptions}
                value={form.restecg}
                error={fieldErrors.restecg}
                onValueChange={(value) => setFieldValue("restecg", value ?? "")}
              />
              <SelectField
                id="slope"
                label="Slope of peak exercise"
                helpText="Describes ECG ST segment behavior during peak exercise. It helps detect potential ischemic heart changes."
                placeholder="Select slope"
                options={slopeOptions}
                value={form.slope}
                error={fieldErrors.slope}
                onValueChange={(value) => setFieldValue("slope", value ?? "")}
              />
              <SelectField
                id="thal"
                label="Heart rate condition (thal)"
                helpText="Represents thalassemia-related scan pattern categories used by this model as heart perfusion indicators."
                placeholder="Select thal condition"
                options={thalOptions}
                value={form.thal}
                error={fieldErrors.thal}
                onValueChange={(value) => setFieldValue("thal", value ?? "")}
              />
            </div>
          </section>
          ) : null}

          {activeStep === 4 ? (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Review & Submit</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Review your key details below, then submit to generate the prediction result.
              </p>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p><span className="font-medium">Name:</span> {form.name || "-"}</p>
                <p><span className="font-medium">Age:</span> {form.age || "-"}</p>
                <p><span className="font-medium">Gender:</span> {form.sex || "-"}</p>
                <p><span className="font-medium">Chest pain type:</span> {form.cp || "-"}</p>
                <p><span className="font-medium">Resting BP:</span> {form.trestbps || "-"}</p>
                <p><span className="font-medium">Cholesterol:</span> {form.chol || "-"}</p>
                <p><span className="font-medium">Max heart rate:</span> {form.thalach || "-"}</p>
                <p><span className="font-medium">Fasting blood sugar:</span> {form.fbs || "-"}</p>
                <p><span className="font-medium">Oldpeak:</span> {form.oldpeak || "-"}</p>
                <p><span className="font-medium">Major vessels (ca):</span> {form.ca || "-"}</p>
                <p><span className="font-medium">Exercise angina:</span> {form.exang || "-"}</p>
                <p><span className="font-medium">Rest ECG:</span> {form.restecg || "-"}</p>
                <p><span className="font-medium">Slope:</span> {form.slope || "-"}</p>
                <p><span className="font-medium">Thal:</span> {form.thal || "-"}</p>
              </div>
            </section>
          ) : null}

          <div className="hidden items-center justify-between gap-3 border-t border-border/60 pt-4 md:flex">
            <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={activeStep === 1}>
              Back
            </Button>
            {activeStep < formSteps.length ? (
              <Button type="button" onClick={goToNextStep}>
                Next step
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !isReviewReady}>
                {isSubmitting ? "Predicting..." : isReviewReady ? "Predict" : "Review details"}
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={activeStep === 1 ? resetAllFields : goToPreviousStep}
          >
            {activeStep === 1 ? "Reset" : "Back"}
          </Button>
          {activeStep < formSteps.length ? (
            <Button type="button" className="h-11 flex-1" onClick={goToNextStep}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              form="patient-form"
              className="h-11 flex-1"
              disabled={isSubmitting || !isReviewReady}
            >
              {isSubmitting ? "Predicting..." : isReviewReady ? "Predict" : "Review"}
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm leading-7 text-muted-foreground">
        Privacy note: this form is for educational risk estimation. It should not
        replace clinical diagnosis or treatment advice.
      </p>
      <Dialog
        open={statusModal.open}
        onOpenChange={(open) => {
          if (statusModal.variant === "loading" && !open) {
            return
          }
          setStatusModal((prev) => ({ ...prev, open }))
        }}
      >
        <DialogContent showCloseButton={statusModal.variant === "error"} className="max-w-md gap-4">
          <DialogHeader className="space-y-3">
            <div
              className={cn(
                "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                statusModal.variant === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              )}
            >
              {statusModal.variant}
            </div>
            <DialogTitle className="text-2xl font-semibold leading-tight">
              {statusModal.title}
            </DialogTitle>
            {statusModal.variant === "loading" ? (
              <DialogDescription className="space-y-3 text-base leading-7">
                <span className="block text-muted-foreground">
                  {predictionLoadingSteps[loadingStepIndex]}
                </span>
                <span className="block space-y-1.5">
                  <span className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Processing</span>
                    <span>{loadingProgress}%</span>
                  </span>
                  <span className="block h-2 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </span>
                </span>
              </DialogDescription>
            ) : (
              <DialogDescription className="text-base leading-7">
                {statusModal.message}
              </DialogDescription>
            )}
          </DialogHeader>
          {statusModal.variant === "loading" ? null : (
            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                className="h-11 w-full text-base"
                variant={statusModal.variant === "success" ? "default" : "secondary"}
                onClick={() => {
                  if (statusModal.variant === "success" && statusModal.continueHref) {
                    router.push(statusModal.continueHref)
                    return
                  }
                  setStatusModal((prev) => ({ ...prev, open: false }))
                }}
              >
                {statusModal.variant === "success" ? "View result" : "Got it"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
