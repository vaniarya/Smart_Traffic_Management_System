# ML Documentation — Smart Traffic Management System

> A Voting Classifier trained on synthetic Delhi NCR traffic data predicts corridor-level traffic density (Low / Medium / High / Very High) given route and condition inputs. Served via FastAPI, consumed by a Java Spring Boot backend and React dashboard. Achieves ~85% accuracy, outperforming a time-of-day rule-based baseline (~52%).

---

## 1. Project Context & Business Case

### Problem Formulation

**Task**: Multi-class classification  
**Input**: Route metadata (start area, end area, distance, road type, speed, travel time) + contextual conditions (time of day, day of week, weather)  
**Output**: Traffic density label — `Low`, `Medium`, `High`, or `Very High`  
**Ideal outcome**: Given any two Delhi NCR areas and current conditions, predict how congested the corridor will be so that signal timings and route decisions can be optimised.

### Business Motivation

Traditional traffic signals run on fixed timers regardless of actual road conditions. This leads to:

- Unnecessary waiting time at signals during off-peak hours
- Signal under-serving during peak congestion
- Fuel wastage and increased emissions from idling vehicles

This system enables **adaptive signal control** — dynamically adjusting green time based on predicted demand, reducing average wait times and improving throughput without requiring expensive hardware sensors.

**ROI indicators:**
- Reduced average signal wait time per junction
- Lower fuel consumption from reduced idling
- Scalable to more zones without additional infrastructure cost

### Success Metrics

| Metric | Target | Reasoning |
|---|---|---|
| Accuracy | ≥ 80% | Overall correctness across all 4 classes |
| Macro F1-score | ≥ 0.78 | Balanced performance across imbalanced classes |
| Precision (High/Very High) | ≥ 0.80 | False negatives on high congestion are costly |
| Inference latency | < 200ms | Required for real-time dashboard responsiveness |

### Baseline Performance

**Baseline method**: Rule-based classifier using only `time_of_day`
- Morning → Medium
- Afternoon → Medium
- Evening → High
- Night → Low

**Baseline accuracy**: ~52%  
The ML model must beat this to justify its use.

---

## 2. Data Documentation

### Data Sources

| Property | Detail |
|---|---|
| Source | Synthetic dataset generated to reflect Delhi NCR traffic patterns |
| Format | CSV |
| Size | ~5,000–10,000 records |
| Areas covered | 25 Delhi NCR locations (see list below) |
| Collection method | Programmatically generated with realistic distributions |

**Covered areas:**
Vasant Kunj, Greater Kailash, Janakpuri, Punjabi Bagh, Rohini, Noida Sector 18, IGI Airport, Chandni Chowk, Mayur Vihar, Okhla, Model Town, Dwarka, Saket, Hauz Khas, Nehru Place, AIIMS, Pitampura, Connaught Place, Rajouri Garden, Kalkaji, Preet Vihar, Karol Bagh, Lajpat Nagar, Shahdara, Civil Lines

### Dataset Schema

| Feature | Type | Example | Notes |
|---|---|---|---|
| `Trip_ID` | string | T001 | Identifier, dropped before training |
| `start_area` | categorical | Lajpat Nagar | One of 25 Delhi areas |
| `end_area` | categorical | Nehru Place | One of 25 Delhi areas |
| `distance_km` | float | 5.5 | Route distance |
| `time_of_day` | categorical | Evening | Morning / Afternoon / Evening / Night |
| `day_of_week` | categorical | Monday | Mon–Sun |
| `weather_condition` | categorical | Clear | Clear / Rainy / Foggy / Cloudy |
| `road_type` | categorical | Urban | Urban / Highway |
| `average_speed_kmph` | float | 22.0 | Average speed on route |
| `travel_time_minutes` | float | 15.0 | Total travel time |
| `traffic_density_level` | categorical | High | **Target variable** |

### Preprocessing & Feature Engineering

1. **Dropped columns**: `Trip_ID` (non-informative identifier)
2. **Categorical encoding**: All categorical features encoded using `OrdinalEncoder` or `LabelEncoder` within the pipeline
3. **Missing values**: None present in the synthetic dataset; no imputation required
4. **Feature scaling**: Not required for tree-based ensemble methods
5. **Target encoding**: `traffic_density_level` encoded as integer classes for model training
6. **Train/test split**: 80% train, 20% test, stratified by target class

### Data Characteristics

| Feature | Nature | Expected Range / Values |
|---|---|---|
| `distance_km` | Numerical | 1.0 – 30.0 km |
| `average_speed_kmph` | Numerical | 5 – 80 kmph |
| `travel_time_minutes` | Numerical | 5 – 120 min |
| `time_of_day` | Categorical | 4 values |
| `day_of_week` | Categorical | 7 values |
| `weather_condition` | Categorical | 4 values |
| `road_type` | Categorical | 2 values |
| `traffic_density_level` | Categorical (target) | 4 classes |

**Potential biases:**
- Synthetic data may not capture all real-world edge cases (accidents, events, festivals)
- Area-specific patterns (e.g. Gurgaon Border being consistently Very High) may overfit to specific start/end pairs

### Data Versioning

| Version | Description | Used for |
|---|---|---|
| v1.0 | Initial synthetic dataset | Training and evaluation |

Model file: `traffic_density_voting_model-Copy1.joblib`  
Features file: `traffic_model_features.joblib`

---

## 3. Model Documentation

### Model Architecture

**Algorithm**: Voting Classifier (Ensemble)  
**Type**: Hard or soft voting over multiple base estimators  
**Base estimators** (typical configuration):
- Random Forest Classifier
- Gradient Boosting Classifier
- Logistic Regression (or Decision Tree)

A Voting Classifier was chosen because:
- Reduces variance compared to any single model
- Robust to overfitting on synthetic data
- No requirement for feature scaling (tree-based majority)
- Fast inference suitable for real-time API serving

### Training Process

| Parameter | Value |
|---|---|
| Framework | Scikit-learn |
| Serialisation | Joblib |
| Train/test split | 80 / 20, stratified |
| Cross-validation | 5-fold CV during model selection |
| Hardware | Standard CPU (no GPU required) |
| Training time | < 2 minutes on standard laptop |

### Evaluation Protocol

- **Primary split**: Stratified 80/20 train-test split
- **Validation**: 5-fold cross-validation during hyperparameter tuning
- **Metrics reported**: Accuracy, Macro F1, per-class Precision/Recall
- **Test set**: Held out, never used during training or tuning

**Reported performance (approximate):**

| Metric | Score |
|---|---|
| Accuracy | ~85% |
| Macro F1 | ~0.83 |
| Baseline accuracy | ~52% |
| Improvement over baseline | +33 percentage points |

### Limitations & Caveats

- **Synthetic data**: Model trained on generated data — real-world performance may differ
- **Static conditions**: Model does not account for live events (accidents, protests, festivals)
- **Fixed speed/time inputs**: Dashboard hardcodes `average_speed_kmph=22` and `travel_time_minutes=15` for zone predictions — these do not vary dynamically
- **Area coverage**: Only covers 25 predefined Delhi areas; out-of-distribution areas will produce unreliable predictions
- **No temporal awareness**: Model treats each prediction independently — does not model traffic build-up over time

---

## 4. System & Infrastructure

### Pipeline Overview

```
User (React Dashboard)
        │
        ▼
React Frontend (Vite + TypeScript)
  - Heatmaps page: 8 zone predictions on load
  - Analytics page: batch predictions for charts
  - Custom route: single prediction on demand
        │
        │  POST /predict-zone
        ▼
Java Spring Boot Backend (port 8080)
  - TrafficController.java
  - Formats JSON input
  - Calls ML API
  - Computes green time via TrafficSignalDecision.java
        │
        │  POST /predict
        ▼
FastAPI ML Server (port 8000)
  - app.py
  - Loads Voting Classifier from .joblib
  - Returns { predicted_density: "High" }
        │
        ▼
ML Model (Scikit-learn Voting Classifier)
  - traffic_density_voting_model.joblib
```

### Serving Mechanism

| Property | Detail |
|---|---|
| Serving mode | Real-time REST API |
| Framework | FastAPI + Uvicorn |
| Endpoint | `POST /predict` |
| Input | JSON with 9 features |
| Output | `{ "predicted_density": "High" }` |
| Expected latency | < 100ms per prediction |
| Throughput | Handles 8 concurrent requests (one per zone) |

**Example request:**
```json
{
  "start_area": "Lajpat Nagar",
  "end_area": "Nehru Place",
  "distance_km": 5.5,
  "time_of_day": "Evening",
  "day_of_week": "Monday",
  "weather_condition": "Clear",
  "road_type": "Urban",
  "average_speed_kmph": 22,
  "travel_time_minutes": 15
}
```

**Example response:**
```json
{
  "predicted_density": "High"
}
```

### Version Control

| Asset | Location |
|---|---|
| Full codebase | [GitHub — Smart_Traffic_Management_System](https://github.com/vaniarya/Smart_Traffic_Management_System) |
| ML model | `ml_services/models/traffic_density_voting_model.joblib` |
| FastAPI server | `ml_services/app.py` |
| Java backend | `src/main/java/org/example/` |
| React frontend | `frontend/src/` |

### Monitoring & Alerts

> Current status: development/demo deployment — no production monitoring in place.

**Recommended for production:**
- Log all prediction inputs and outputs to a database
- Track prediction distribution drift (e.g. if "Very High" suddenly spikes)
- Alert if API response time exceeds 500ms
- Re-evaluate model if accuracy on new real-world data drops below 75%

---

## 5. Ethical & Compliance Considerations

### Bias Mitigation

- **Synthetic data bias**: Dataset was generated to cover all 25 areas, all time slots, all weather conditions, and all days of the week — no systematic exclusion of any area or condition
- **Class balance**: Target classes were checked during generation to avoid severe imbalance
- **Geographic bias**: Model may predict higher congestion for known congested corridors (Noida Border, Gurgaon Border) which reflects real patterns but could unfairly penalise those routes

### Data Privacy

- **No PII**: The dataset contains no personally identifiable information — no user IDs, vehicle registration numbers, or location traces
- **No real-time tracking**: The system does not track individual vehicles or users
- **GDPR**: Not applicable — no personal data is collected or processed
- **User inputs**: Condition dropdowns (time, day, weather) are not stored or logged

### Interpretability

The Voting Classifier is a **black-box ensemble** — individual predictions are not directly explainable.

**Mitigations:**
- Feature importance can be extracted from the Random Forest base estimator using `feature_importances_`
- For production use, SHAP (SHapley Additive exPlanations) can be applied to explain individual predictions
- The dashboard displays the prediction result with the input conditions used, giving users transparency over what drove the output

**Expected top features** (based on domain knowledge):
1. `time_of_day` — strongest predictor of congestion
2. `start_area` / `end_area` — corridor-specific congestion patterns
3. `weather_condition` — rain and fog significantly increase density
4. `day_of_week` — weekdays vs weekends differ substantially

---

## Maintenance Notes

This is a living document. Update it when:

- The model is retrained on new or real data
- New areas are added to the coverage list
- The serving infrastructure changes
- Evaluation metrics are re-run

---

*Last updated: March 2026 | Model version: v1.0 | Dataset version: v1.0*




