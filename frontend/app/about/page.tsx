import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

const diseaseTypes = [
  {
    title: "Coronary artery disease",
    detail:
      "Plaque narrows arteries that feed your heart, reducing oxygen supply and increasing heart attack risk.",
  },
  {
    title: "Arrhythmia",
    detail:
      "Electrical signaling changes can make heartbeat too fast, too slow, or irregular.",
  },
  {
    title: "Cardiomyopathy",
    detail:
      "Heart muscle can become weak or thickened, reducing pumping efficiency over time.",
  },
  {
    title: "Valve disease",
    detail:
      "Heart valves may narrow or leak, forcing the heart to work harder to move blood.",
  },
]

const symptoms = [
  "Chest pain or pressure",
  "Shortness of breath",
  "Palpitations (fast or irregular heartbeat)",
  "Fatigue and dizziness",
  "Swelling in legs, ankles, or feet",
]

const riskFactors = [
  "Smoking",
  "High blood pressure",
  "High cholesterol",
  "Diabetes",
  "Obesity and inactivity",
  "Long-term stress",
  "Family history of heart disease",
]

const preventionTips = [
  "Avoid smoking and limit alcohol intake.",
  "Exercise for at least 30 minutes most days.",
  "Follow a low-salt, low-saturated-fat diet.",
  "Keep blood pressure, sugar, and cholesterol controlled.",
  "Maintain healthy sleep and stress management habits.",
]

export default function AboutPage() {
  return (
    <main className="min-h-svh bg-linear-to-b from-background to-muted/30 px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4 border-b border-border/60 pb-6">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            Cardio Monitor
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            About Heart Disease
          </h1>
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
            Heart disease includes conditions affecting heart function, blood
            flow, rhythm, and valves. This page summarizes common types,
            warning signs, risk factors, and prevention steps.
          </p>
        </header>

        <section className="space-y-4 border-b border-border/60 pb-8">
          <h2 className="text-xl font-semibold tracking-tight">Common Types</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {diseaseTypes.map((item) => (
              <article key={item.title} className="space-y-2">
                <h3 className="text-base font-semibold text-primary">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-b border-border/60 pb-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Symptoms</h2>
            <ol className="space-y-3">
              {symptoms.map((item, index) => (
                <li key={item} className="flex gap-3 border-b border-border/50 pb-3">
                  <span className="text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Risk Factors</h2>
            <ol className="space-y-3">
              {riskFactors.map((item, index) => (
                <li key={item} className="flex gap-3 border-b border-border/50 pb-3">
                  <span className="text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="space-y-3 border-b border-border/60 pb-8">
          <h2 className="text-xl font-semibold tracking-tight">Prevention</h2>
          <ol className="space-y-3">
            {preventionTips.map((item, index) => (
              <li key={item} className="flex gap-3 border-b border-border/50 pb-3">
                <span className="text-sm font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Prevention Tip</p>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pt-2 text-sm leading-7 text-muted-foreground">
            This information is educational and does not replace a clinical
            diagnosis. If you have persistent symptoms, contact a doctor.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Back to prediction form
          </Link>
          <Link href="/result" className={buttonVariants({ variant: "outline" })}>
            Open result page
          </Link>
        </div>
      </div>
    </main>
  )
}
