import os
import numpy as np
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from typing import Literal, Optional, Union, List

from backend_features import FEATURE_ORDER


MODEL_PATH = os.getenv("CARDIO_MODEL_PATH", "heartmodel.pkl")
DATASET_PATH = os.getenv("CARDIO_DATASET_PATH", "heart.csv")

_model = None
_scaler: Optional[StandardScaler] = None
_initialization_error: Optional[Exception] = None
_initialization_warning: Optional[str] = None
_model_source = "uninitialized"


class InferenceNotReadyError(RuntimeError):
    """Raised when model/scaler assets are not available for inference."""


def _initialize_assets() -> None:
    global _model, _scaler, _initialization_error, _initialization_warning, _model_source

    if _model is not None and _scaler is not None:
        return
    if _initialization_error is not None:
        return

    try:
        df = pd.read_csv(DATASET_PATH)
        if "target" not in df.columns:
            raise ValueError("Dataset must contain a 'target' column.")

        missing_feature_columns = [column for column in FEATURE_ORDER if column not in df.columns]
        if missing_feature_columns:
            raise ValueError(
                f"Dataset is missing required feature columns: {', '.join(missing_feature_columns)}"
            )

        X = df[list(FEATURE_ORDER)]
        y = df["target"]
        X_train, _, _, _ = train_test_split(X, y, test_size=0.20, random_state=0)

        scaler = StandardScaler()
        scaler.fit(X_train)

        transformed_full = scaler.transform(X)

        model = None
        load_error = None
        try:
            model = joblib.load(MODEL_PATH)
            _model_source = "pickle"
        except Exception as exc:  # noqa: BLE001
            load_error = exc

        if model is None:
            fallback_model = LogisticRegression(max_iter=1000, random_state=0)
            fallback_model.fit(transformed_full, y)
            model = fallback_model
            _model_source = "fallback-logistic-regression"
            _initialization_warning = (
                f"Failed to load model artifact '{MODEL_PATH}'. "
                f"Using fallback LogisticRegression trained from '{DATASET_PATH}'. "
                f"Original error: {load_error}"
            )

        _model = model
        _scaler = scaler
    except Exception as exc:  # noqa: BLE001
        _initialization_error = exc


def is_ready() -> bool:
    _initialize_assets()
    return _model is not None and _scaler is not None


def readiness_error() -> Optional[str]:
    _initialize_assets()
    if _initialization_error is None:
        return None
    return str(_initialization_error)


def readiness_warning() -> Optional[str]:
    _initialize_assets()
    return _initialization_warning


def model_source() -> str:
    _initialize_assets()
    return _model_source


def preprocess(encoded_features: dict[str, float]) -> int:
    return predict_with_metadata(encoded_features)["prediction"]


def predict_with_metadata(encoded_features: dict[str, float]) -> dict[str, Union[float, int]]:
    _initialize_assets()

    if _model is None or _scaler is None:
        raise InferenceNotReadyError(
            f"Inference assets are not ready. {readiness_error() or 'Unknown initialization error.'}"
        )

    user_input = pd.DataFrame(
        [[encoded_features[feature] for feature in FEATURE_ORDER]],
        columns=list(FEATURE_ORDER),
        dtype=float,
    )
    transformed = _scaler.transform(user_input)
    prediction = int(_model.predict(transformed)[0])

    probability = None
    if hasattr(_model, "predict_proba"):
        probability = float(_model.predict_proba(transformed)[0][1])
    elif hasattr(_model, "decision_function"):
        score = float(_model.decision_function(transformed)[0])
        probability = float(1 / (1 + np.exp(-score)))

    if probability is None:
        probability = 0.75 if prediction == 1 else 0.25

    distance = abs(probability - 0.5)
    margin = float(np.clip(0.18 - distance * 0.2, 0.06, 0.18))
    confidence_low = float(np.clip(probability - margin, 0.0, 1.0))
    confidence_high = float(np.clip(probability + margin, 0.0, 1.0))

    return {
        "prediction": prediction,
        "riskProbability": probability,
        "confidenceLow": confidence_low,
        "confidenceHigh": confidence_high,
    }