# Cardio Monitor Frontend

Next.js App Router frontend for collecting patient data and displaying heart-disease risk prediction results.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Prerequisites

- Node.js 20+ recommended
- npm

## Setup

From the `frontend/` directory:

```bash
npm install
```

## Environment

Create or update `frontend/.env.local`:

```env
FLASK_API_BASE_URL=http://127.0.0.1:5000
```

This value is used by `app/api/predict/route.ts` to proxy prediction requests to the Flask backend.

## Run Development Server

```bash
npm run dev
```

Default frontend URL:

- `http://localhost:3000`

## Available Scripts

- `npm run dev` - start development server (Turbopack)
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checks
- `npm run format` - run Prettier for TS/TSX files

## API Flow

1. UI submits patient form data to `POST /api/predict` (Next.js route)
2. Next.js route forwards the request to Flask backend `/api/predict`
3. Frontend renders returned prediction, confidence, and insights

## Notes

- Ensure backend is running before submitting the form.
- If backend is unreachable, the proxy route returns a `502` error.
