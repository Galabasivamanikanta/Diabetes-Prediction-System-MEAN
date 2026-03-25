from http.server import BaseHTTPRequestHandler
import json
import pickle
import os
import numpy as np

# Load model and scaler once on boot
script_dir = os.path.dirname(os.path.abspath(__file__))
model = pickle.load(open(os.path.join(script_dir, "model.pkl"), "rb"))
scaler = pickle.load(open(os.path.join(script_dir, "scaler.pkl"), "rb"))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        try:
            # Extract features (match original order)
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

            # Scale and Predict
            values_scaled = scaler.transform(values)
            prediction = model.predict(values_scaled)[0]
            probability = model.predict_proba(values_scaled)[0]

            # Risk level
            diabetic_prob = round(float(probability[1]) * 100, 2)
            if diabetic_prob < 30:
                risk_level = "Low"
                recommendation = "Your risk is low. Maintain a healthy lifestyle."
            elif diabetic_prob < 50:
                risk_level = "Moderate"
                recommendation = "Moderate risk. Monitor blood sugar regularly."
            elif diabetic_prob < 70:
                risk_level = "High"
                recommendation = "High risk. Please consult a specialist."
            else:
                risk_level = "Very High"
                recommendation = "Very high risk. Immediate medical consultation recommended."

            result = {
                "result": int(prediction),
                "probability": diabetic_prob,
                "riskLevel": risk_level,
                "recommendation": recommendation,
                "label": "Diabetic" if prediction == 1 else "Non-Diabetic"
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e), "result": -1}).encode())

    # For testing/readiness if needed
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("DPS Prediction Engine (Serverless) is alive.".encode())
