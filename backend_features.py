from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping

FEATURE_ORDER = (
    "age",
    "sex",
    "cp",
    "trestbps",
    "restecg",
    "chol",
    "fbs",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
)

PRIMARY_METRICS = ("cp", "fbs", "restecg", "exang", "oldpeak", "slope", "ca", "thal")
SECONDARY_METRICS = ("trestbps", "chol", "thalach")

NORMAL_REFERENCE_VALUES = {
    "cp": 0.478261,
    "fbs": 0.159420,
    "restecg": 0.449275,
    "exang": 0.550725,
    "oldpeak": 1.585507,
    "slope": 1.166667,
    "ca": 1.166667,
    "thal": 2.543478,
    "trestbps": 134.398551,
    "chol": 251.086957,
    "thalach": 139.101449,
}

METRIC_LABELS = {
    "cp": "Chest pain profile",
    "fbs": "Fasting blood sugar",
    "restecg": "Resting ECG",
    "exang": "Exercise-induced angina",
    "oldpeak": "ST depression (oldpeak)",
    "slope": "ST slope",
    "ca": "Major vessels (ca)",
    "thal": "Thal condition",
    "trestbps": "Resting blood pressure",
    "chol": "Cholesterol",
    "thalach": "Max heart rate",
}

REQUIRED_FIELDS = (
    "name",
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
)

NUMERIC_FIELD_RULES = {
    "age": (1.0, 120.0),
    "trestbps": (70.0, 250.0),
    "chol": (100.0, 700.0),
    "thalach": (60.0, 240.0),
    "oldpeak": (0.0, 10.0),
    "ca": (0.0, 3.0),
}

CATEGORICAL_MAPPINGS = {
    "sex": {"male": 1.0, "female": 0.0},
    "cp": {
        "Typical angina": 0.0,
        "Atypical angina": 1.0,
        "Non-anginal pain": 2.0,
        "Asymptomatic": 3.0,
    },
    "fbs": {"Yes": 1.0, "No": 0.0},
    "restecg": {
        "Nothing to note": 0.0,
        "ST-T Wave abnormality": 1.0,
        "Possible or definite left ventricular hypertrophy": 2.0,
    },
    "exang": {"Yes": 1.0, "No": 0.0},
    "slope": {
        "Upsloping: better heart rate with excercise(uncommon)": 0.0,
        "Flatsloping: minimal change(typical healthy heart)": 1.0,
        "Downsloping: signs of unhealthy heart": 2.0,
    },
    "thal": {
        "fixed defect: used to be defect but ok now": 6.0,
        "reversable defect: no proper blood movement when excercising": 7.0,
        "normal": 2.31,
    },
}


@dataclass
class PayloadValidationError(Exception):
    message: str
    details: dict[str, str]

    def __str__(self) -> str:
        return self.message


def _to_clean_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def validate_and_encode_payload(payload: Mapping[str, Any]) -> tuple[str, dict[str, float]]:
    errors: dict[str, str] = {}

    missing_fields = [field for field in REQUIRED_FIELDS if not _to_clean_string(payload.get(field))]
    for field in missing_fields:
        errors[field] = "This field is required."

    patient_name = _to_clean_string(payload.get("name"))
    if patient_name and len(patient_name) > 120:
        errors["name"] = "Name is too long."

    encoded: dict[str, float] = {}

    for field, choices in CATEGORICAL_MAPPINGS.items():
        raw = _to_clean_string(payload.get(field))
        if not raw:
            continue
        mapped = choices.get(raw)
        if mapped is None:
            errors[field] = "Invalid option."
            continue
        encoded[field] = mapped

    for field, (min_value, max_value) in NUMERIC_FIELD_RULES.items():
        raw = _to_clean_string(payload.get(field))
        if not raw:
            continue
        try:
            parsed = float(raw)
        except ValueError:
            errors[field] = "Must be a valid number."
            continue
        if parsed < min_value or parsed > max_value:
            errors[field] = f"Must be between {min_value:g} and {max_value:g}."
            continue
        encoded[field] = parsed

    if errors:
        raise PayloadValidationError(
            message="Validation failed",
            details=errors,
        )

    return patient_name, encoded
