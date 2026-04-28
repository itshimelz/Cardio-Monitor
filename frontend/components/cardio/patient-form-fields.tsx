"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SelectOption } from "@/lib/types/patient-form"
import { cn } from "@/lib/utils"

export function getFilledFieldClass(value: string) {
  if (!value.trim()) {
    return ""
  }
  return "border-primary/70 bg-primary/5 text-primary focus-visible:ring-primary/40"
}

function FieldHelp({ label, text }: { label: string; text: string }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        render={
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            aria-label={`What does ${label} mean?`}
          />
        }
      >
        i
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-80 space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm leading-6 text-muted-foreground">{text}</p>
      </HoverCardContent>
    </HoverCard>
  )
}

export function FieldLabelWithHelp({
  label,
  htmlFor,
  helpText,
}: {
  label: string
  htmlFor: string
  helpText: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className="text-base font-medium">
        {label}
      </Label>
      <FieldHelp label={label} text={helpText} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  helpText,
  placeholder,
  options,
  value,
  error,
  describedBy,
  hint,
  hintId,
  onValueChange,
}: {
  id: string
  label: string
  helpText: string
  placeholder: string
  options: SelectOption[]
  value: string
  error?: string
  describedBy?: string
  hint?: string
  hintId?: string
  onValueChange: (value: string | null) => void
}) {
  const errorId = error ? `${id}-error` : undefined
  const resolvedHintId = hint ? (hintId ?? `${id}-hint`) : undefined
  return (
    <div className="space-y-2">
      <FieldLabelWithHelp label={label} htmlFor={id} helpText={helpText} />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [describedBy, resolvedHintId, errorId].filter(Boolean).join(" ") || undefined
          }
          className={cn(
            "h-12 w-full rounded-xl text-base",
            getFilledFieldClass(value),
            error ? "border-destructive/70 focus-visible:ring-destructive/40" : ""
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint ? (
        <p id={resolvedHintId} className="text-xs leading-6 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
