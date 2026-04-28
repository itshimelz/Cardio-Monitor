import { PageHeader } from "@/components/cardio/page-header"
import { PatientForm } from "@/components/cardio/patient-form"

export default function Page() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-background to-muted/30 px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader />
        <PatientForm />
      </div>
    </main>
  )
}
