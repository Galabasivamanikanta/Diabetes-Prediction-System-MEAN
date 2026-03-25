"""
Diabetes Prediction Script
Called by Node.js backend via child_process.spawn
Accepts JSON input via command line argument
Returns JSON prediction result to stdout
"""

import pickle
import sys
import json
import os
import numpy as np

script_dir = os.path.dirname(os.path.abspath(__file__))

# Load model and scaler
model = pickle.load(open(os.path.join(script_dir, "model.pkl"), "rb"))
scaler = pickle.load(open(os.path.join(script_dir, "scaler.pkl"), "rb"))

try:
    # Parse input data
    data = json.loads(sys.argv[1])

    # Extract features in correct order
    values = np.array([[
        float(data["pregnancies"]),
        float(data["glucose"]),
        float(data["bloodPressure"]),
        float(data["skinThickness"]),
        float(data["insulin"]),
        float(data["bmi"]),
        float(data["dpf"]),
        float(data["age"])
    ]])

    # Scale features
    values_scaled = scaler.transform(values)

    # Predict
    prediction = model.predict(values_scaled)[0]
    probability = model.predict_proba(values_scaled)[0]

    # Risk level
    diabetic_prob = round(float(probability[1]) * 100, 2)
    if diabetic_prob < 30:
        risk_level = "Low"
        recommendation = "Your risk is low. Maintain a healthy lifestyle with regular exercise and balanced diet."
    elif diabetic_prob < 50:
        risk_level = "Moderate"
        recommendation = "Moderate risk detected. Consider regular blood sugar monitoring and lifestyle improvements."
    elif diabetic_prob < 70:
        risk_level = "High"
        recommendation = "High risk detected. Please consult a healthcare provider for proper evaluation and guidance."
    else:
        risk_level = "Very High"
        recommendation = "Very high risk detected. Immediate medical consultation is strongly recommended."

    result = {
        "result": int(prediction),
        "probability": diabetic_prob,
        "riskLevel": risk_level,
        "recommendation": recommendation,
        "label": "Diabetic" if prediction == 1 else "Non-Diabetic"
    }

    print(json.dumps(result))

except Exception as e:
    error_result = {
        "error": str(e),
        "result": -1
    }
    print(json.dumps(error_result))
    sys.exit(1)
