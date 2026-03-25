"""
Diabetes Prediction Model Training Script
Uses Pima Indians Diabetes Dataset
Trains both Logistic Regression and Random Forest, picks the best one.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import json

# --- Load Dataset ---
script_dir = os.path.dirname(os.path.abspath(__file__))
data = pd.read_csv(os.path.join(script_dir, "diabetes.csv"))

print(f"Dataset shape: {data.shape}")
print(f"Columns: {list(data.columns)}")
print(f"\nClass distribution:\n{data['Outcome'].value_counts()}")

# --- Handle zeros as missing values ---
# In this dataset, 0 values for Glucose, BloodPressure, SkinThickness, Insulin, BMI are missing
zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
for col in zero_cols:
    data[col] = data[col].replace(0, np.nan)
    data[col] = data[col].fillna(data[col].median())

# --- Features and Target ---
feature_columns = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                   'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
X = data[feature_columns]
y = data['Outcome']

# --- Scale Features ---
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# --- Split Data ---
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# --- Train Logistic Regression ---
lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X_train, y_train)
lr_acc = accuracy_score(y_test, lr_model.predict(X_test))
lr_cv = cross_val_score(lr_model, X_scaled, y, cv=5).mean()
print(f"\n--- Logistic Regression ---")
print(f"Test Accuracy: {lr_acc:.4f}")
print(f"CV Accuracy:   {lr_cv:.4f}")

# --- Train Random Forest ---
rf_model = RandomForestClassifier(
    n_estimators=200, max_depth=8, min_samples_split=5,
    min_samples_leaf=2, random_state=42
)
rf_model.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf_model.predict(X_test))
rf_cv = cross_val_score(rf_model, X_scaled, y, cv=5).mean()
print(f"\n--- Random Forest ---")
print(f"Test Accuracy: {rf_acc:.4f}")
print(f"CV Accuracy:   {rf_cv:.4f}")

# --- Pick Best Model ---
if rf_cv >= lr_cv:
    best_model = rf_model
    best_name = "RandomForest"
    best_acc = rf_acc
else:
    best_model = lr_model
    best_name = "LogisticRegression"
    best_acc = lr_acc

print(f"\n✅ Best Model: {best_name} (Accuracy: {best_acc:.4f})")

# --- Classification Report ---
y_pred = best_model.predict(X_test)
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

# --- Save Model and Scaler ---
model_path = os.path.join(script_dir, "model.pkl")
scaler_path = os.path.join(script_dir, "scaler.pkl")
meta_path = os.path.join(script_dir, "model_meta.json")

pickle.dump(best_model, open(model_path, "wb"))
pickle.dump(scaler, open(scaler_path, "wb"))

# Save metadata
meta = {
    "model_name": best_name,
    "accuracy": round(best_acc, 4),
    "cv_accuracy": round(max(rf_cv, lr_cv), 4),
    "features": feature_columns,
    "lr_accuracy": round(lr_acc, 4),
    "rf_accuracy": round(rf_acc, 4)
}
with open(meta_path, "w") as f:
    json.dump(meta, f, indent=2)

print(f"\n✅ Model saved to {model_path}")
print(f"✅ Scaler saved to {scaler_path}")
print(f"✅ Metadata saved to {meta_path}")
