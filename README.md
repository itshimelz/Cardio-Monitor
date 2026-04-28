# Cardio Monitor Backend

Flask API service for heart-disease risk prediction in the Cardio Monitor project.

## What This Service Provides

- `POST /api/predict` for model inference from patient inputs
- `GET /health` for service/model readiness checks
- Input validation and categorical encoding before inference
- Prediction metadata (risk probability, confidence band, chart values, contributors)

## Project Layout

- `app.py` - Flask app and API routes
- `backend_features.py` - payload validation, ranges, and feature mappings
- `prediction.py` - model loading and prediction logic
- `visualization.py` - chart value preprocessing
- `heartmodel.pkl` - trained model artifact
- `heart.csv` - dataset used by model logic
- `frontend/` - Next.js frontend (see `frontend/README.md`)

## Requirements

- Python 3.10+ recommended
- `pip`

## Setup

From repository root:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Run Backend

```bash
python app.py
```

Default backend URL:

- `http://127.0.0.1:5000`

## Environment Variables

- `FLASK_DEBUG` - set to `1` to enable Flask debug mode
- `LOG_LEVEL` - logging level (for example `INFO`, `DEBUG`, `WARNING`)

## API Reference

### `POST /api/predict`

Accepts JSON with required fields:

- `name`, `age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`

Returns:

- `prediction`
- `riskProbability`
- `confidenceBand` (`low`, `high`)
- `nameOfPatient`
- `modelCounter`, `totalCounter`
- `topContributors`, `redFlags`
- `chartValues` (`primary`, `secondary`)

Validation errors return `422` with `fieldErrors` and `missingFields`.

### `GET /health`

Returns service/model health details:

- `status`
- `modelReady`
- `modelSource`
- optional `modelWarning` or `modelError`

## Running Frontend Together

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## Credits

Original project created by Sarvesh Kumar Sharma.  
Backend-first API architecture maintained in this repository.
