"""
Bulk CSV Prediction Script
Accepts a CSV file path, runs predictions for all rows
Returns JSON array of results
"""

import pickle
import sys
import json
import os
import csv
import numpy as np

script_dir = os.path.dirname(os.path.abspath(__file__))

model = pickle.load(open(os.path.join(script_dir, "model.pkl"), "rb"))
scaler = pickle.load(open(os.path.join(script_dir, "scaler.pkl"), "rb"))

try:
    csv_path = sys.argv[1]
    results = []

    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            values = np.array([[
                float(row.get("pregnancies", row.get("Pregnancies", 0))),
                float(row.get("glucose", row.get("Glucose", 0))),
                float(row.get("bloodPressure", row.get("BloodPressure", 0))),
                float(row.get("skinThickness", row.get("SkinThickness", 0))),
                float(row.get("insulin", row.get("Insulin", 0))),
                float(row.get("bmi", row.get("BMI", 0))),
                float(row.get("dpf", row.get("DiabetesPedigreeFunction", 0))),
                float(row.get("age", row.get("Age", 0)))
            ]])

            values_scaled = scaler.transform(values)
            prediction = model.predict(values_scaled)[0]
            probability = model.predict_proba(values_scaled)[0]
            diabetic_prob = round(float(probability[1]) * 100, 2)

            if diabetic_prob < 30:
                risk_level = "Low"
            elif diabetic_prob < 50:
                risk_level = "Moderate"
            elif diabetic_prob < 70:
                risk_level = "High"
            else:
                risk_level = "Very High"

            results.append({
                "input": {k: v for k, v in row.items()},
                "result": int(prediction),
                "probability": diabetic_prob,
                "riskLevel": risk_level,
                "label": "Diabetic" if prediction == 1 else "Non-Diabetic"
            })

    print(json.dumps(results))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
