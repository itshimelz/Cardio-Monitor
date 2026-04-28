# Next.js Frontend Setup (Phase 1)

## What this is
This repository now contains a separate Next.js App Router frontend in `frontend/`, initialized with the requested shadcn preset and Tailwind styling.

Phase 1 is intentionally **UI only**:
- The first page is a presentational version of the Cardio Monitor form.
- No Flask backend request or ML prediction call is connected yet.

## Run the frontend
From project root:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current frontend structure
- `frontend/app/page.tsx` - first page composition
- `frontend/components/cardio/page-header.tsx` - page heading and intro
- `frontend/components/cardio/patient-form.tsx` - form UI sections and fields
- `frontend/components/ui/*` - shadcn base UI primitives used by the page

## Phase 2 integration points
When connecting logic later, use these steps:
1. Create an API layer in Next.js (route handler) or call existing Flask endpoints.
2. Map frontend form field names to Flask expected payload keys.
3. Submit data on button click and display prediction states (loading/success/error).
4. Add a UI result page/component matching the existing Flask `result.html` flow.
