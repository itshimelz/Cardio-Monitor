import { NextResponse } from "next/server"

import type { PredictionResponse } from "@/lib/types"

const FLASK_API_BASE_URL =
  process.env.FLASK_API_BASE_URL ?? "http://127.0.0.1:5000"

function withBackendBase(path: string) {
  return new URL(path, FLASK_API_BASE_URL).toString()
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const backendResponse = await fetch(withBackendBase("/api/predict"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = (await backendResponse.json()) as
      | PredictionResponse
      | { error?: string; missingFields?: string[] }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: "Backend request failed",
          detail: "error" in data ? data.error : undefined,
          missingFields:
            "missingFields" in data && Array.isArray(data.missingFields)
              ? data.missingFields
              : undefined,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(data as PredictionResponse, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: "Unable to reach backend prediction service" },
      { status: 502 }
    )
  }
}
