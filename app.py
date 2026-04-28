import logging
import os
from threading import Lock

from flask import Flask, jsonify, request

import prediction
import visualization
from backend_features import (
    METRIC_LABELS,
    NORMAL_REFERENCE_VALUES,
    PayloadValidationError,
    PRIMARY_METRICS,
    SECONDARY_METRICS,
    validate_and_encode_payload,
)

app = Flask(__name__)
logger = logging.getLogger(__name__)
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())


counter = 0
counter2 = 0
counter_lock = Lock()


def _run_prediction(form_data):
    global counter, counter2

    name_of_patient, encoded_features = validate_and_encode_payload(form_data)
    prediction_result = prediction.predict_with_metadata(encoded_features)
    result = int(prediction_result["prediction"])
    data1, data2 = visualization.visualizationpreprocess(encoded_features, result)

    with counter_lock:
        counter = (counter % 50) + 1
        counter2 += 1
        model_counter = counter
        total_counter = counter2

    primary_comparison = [
        {
            "metric": metric,
            "normal": float(data1[0][index]),
            "user": float(data1[1][index]),
        }
        for index, metric in enumerate(PRIMARY_METRICS)
    ]
    secondary_comparison = [
        {
            "metric": metric,
            "normal": float(data2[0][index]),
            "user": float(data2[1][index]),
        }
        for index, metric in enumerate(SECONDARY_METRICS)
    ]

    top_contributors = _build_top_contributors(encoded_features)
    red_flags = _build_red_flags(encoded_features)

    return {
        "prediction": int(result),
        "riskProbability": float(prediction_result["riskProbability"]),
        "confidenceBand": {
            "low": float(prediction_result["confidenceLow"]),
            "high": float(prediction_result["confidenceHigh"]),
        },
        "nameOfPatient": name_of_patient,
        "modelCounter": int(model_counter),
        "totalCounter": int(total_counter),
        "topContributors": top_contributors,
        "redFlags": red_flags,
        "chartValues": {
            "primary": primary_comparison,
            "secondary": secondary_comparison,
        },
    }


def _build_top_contributors(encoded_features):
    weighted_metrics = {
        "ca": 1.3,
        "oldpeak": 1.2,
        "exang": 1.15,
        "chol": 1.0,
        "trestbps": 0.95,
        "restecg": 0.9,
        "thal": 0.9,
        "cp": 0.85,
        "fbs": 0.75,
    }

    scored = []
    for metric, weight in weighted_metrics.items():
        baseline = NORMAL_REFERENCE_VALUES[metric]
        current = float(encoded_features[metric])
        delta = current - baseline
        if delta <= 0:
            continue
        score = delta * weight
        scored.append((metric, score, delta))

    scored.sort(key=lambda item: item[1], reverse=True)
    top_items = scored[:3]
    output = []
    for metric, score, delta in top_items:
        output.append({
            "metric": metric,
            "label": METRIC_LABELS.get(metric, metric),
            "impactScore": round(float(score), 3),
            "difference": round(float(delta), 3),
            "note": f"{METRIC_LABELS.get(metric, metric)} is above baseline reference.",
        })

    return output


def _build_red_flags(encoded_features):
    flags = []

    if encoded_features["trestbps"] >= 180:
        flags.append("Very high resting blood pressure was detected.")
    if encoded_features["chol"] >= 300:
        flags.append("Cholesterol is markedly elevated.")
    if encoded_features["oldpeak"] >= 2.5:
        flags.append("High ST depression (oldpeak) may indicate ischemic stress.")
    if encoded_features["ca"] >= 2:
        flags.append("Multiple major vessels are involved (ca >= 2).")
    if encoded_features["exang"] >= 1:
        flags.append("Exercise-induced angina is present.")

    return flags


@app.route('/api/predict', methods=['POST'])
def predict_api():
    payload = request.get_json(silent=True) or request.form.to_dict()
    if not isinstance(payload, dict):
        return jsonify({
            "error": "Invalid request payload",
            "code": "INVALID_PAYLOAD",
        }), 400

    try:
        prediction_payload = _run_prediction(payload)
    except PayloadValidationError as exc:
        return jsonify({
            "error": exc.message,
            "code": "VALIDATION_FAILED",
            "fieldErrors": exc.details,
            "missingFields": [key for key, value in exc.details.items() if value == "This field is required."],
        }), 422
    except prediction.InferenceNotReadyError as exc:
        logger.exception("Inference assets are not ready.")
        return jsonify({
            "error": str(exc),
            "code": "INFERENCE_NOT_READY",
        }), 503
    except Exception:  # noqa: BLE001
        logger.exception("Unhandled prediction failure.")
        return jsonify({
            "error": "Prediction failed",
            "code": "PREDICTION_FAILED",
        }), 500

    return jsonify(prediction_payload)


@app.route('/health', methods=['GET'])
def health():
    model_ready = prediction.is_ready()
    response = {
        "status": "ok" if model_ready else "degraded",
        "modelReady": model_ready,
        "modelSource": prediction.model_source(),
    }
    warning = prediction.readiness_warning()
    if warning:
        response["modelWarning"] = warning
    if not model_ready:
        response["modelError"] = prediction.readiness_error()
    return jsonify(response), (200 if model_ready else 503)

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")