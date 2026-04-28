# Cardio-Monitor Project Summary

## Overview
Cardio-Monitor is a Flask web application for early heart disease risk prediction. It accepts health metrics through a web form, preprocesses the input, runs an ML model for inference, and renders prediction results with comparative visualizations.

## Main Features
- Predicts heart disease risk from user-provided clinical attributes.
- Generates result visualizations comparing user values to baseline values.
- Supports MongoDB integration for storing prediction records.
- Includes model-retraining utilities for rebuilding a KNN model from database data.

## Tech Stack
- **Backend:** Python, Flask
- **ML/Data:** scikit-learn, NumPy, Pandas, joblib, XGBoost (in training utilities)
- **Visualization:** Matplotlib, Seaborn
- **Database:** MongoDB via `pymongo`
- **Deployment Runtime:** `gunicorn` (from `requirements.txt`)

## High-Level Flow
1. User opens home page and submits health data.
2. Flask route `/predict` receives form values.
3. `prediction.preprocess()` transforms raw categorical/numeric inputs and runs model inference from `heartmodel.pkl`.
4. `visualization.visualizationpreprocess()` prepares comparison datasets.
5. Chart images are generated and saved to `static/`.
6. Result page displays model output and metadata counters.

## File and Folder Summary

### Root Python Files
- `app.py`
  - Flask app entry point and route definitions.
  - Handles home, prediction, and error routes.
  - Builds and saves chart images (`static/plotng.png`, `static/plotng2.png`).
- `prediction.py`
  - Input preprocessing logic for model inference.
  - Loads trained model via `joblib.load("heartmodel.pkl")`.
  - Returns integer prediction result.
- `visualization.py`
  - Converts input form values into numeric series for plotting.
  - Returns two lists used by plotting functions in `app.py`.
- `database.py`
  - MongoDB connection and CRUD helper functions.
  - Converts user inputs to a normalized dictionary format for insertion.
- `modelbuild.py`
  - Utility code for reading MongoDB data and retraining a KNN model.
  - Saves model when accuracy threshold criteria are met.

### Data and Model Artifacts
- `heart.csv`
  - Primary dataset used for training/scaling reference.
- `heartmodel.pkl` / `Heart_model1.pkl`
  - Serialized model artifacts used for prediction/training workflows.
- `Input Data.png`
  - Diagram image referenced in project documentation.

### Web App Structure
- `templates/`
  - Jinja2 templates for pages such as home, result, and error views.
- `static/`
  - Static assets and generated plot images.

### Documentation and Config
- `README.md`
  - Project-level introduction, abstract, and technology notes.
- `requirements.txt`
  - Pinned Python dependency list for environment setup.
- `Procfile`
  - Process declaration for deployment platforms.

## Current Notes and Improvement Opportunities
- Input-to-number mapping logic is duplicated across multiple modules (`prediction.py`, `visualization.py`, `database.py`); centralizing this mapping would reduce drift and bugs.
- Some mappings are inconsistent (for example, category encodings differ between modules), which may impact prediction and reporting consistency.
- `modelbuild.py` currently contains a hardcoded MongoDB connection string in one function; move all credentials/URIs to environment variables.
- Consider adding tests for preprocessing and route-level behavior to improve reliability.

## Quick Start
1. Create a virtual environment.
2. Install dependencies from `requirements.txt`.
3. Ensure `heartmodel.pkl` and `heart.csv` are available in the project root.
4. Set `DATABASE_LINK` if MongoDB features are required.
5. Run `app.py` (or `gunicorn` for production).
