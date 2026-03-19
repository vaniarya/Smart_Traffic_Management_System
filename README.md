# Smart Traffic Management System

An AI-powered traffic intelligence platform that predicts road congestion using Machine Learning and visualizes real-time traffic conditions across Delhi NCR through an interactive control room dashboard.

---

## Screenshots

### Traffic Control Room — Live Heatmap

<!-- Add heatmap screenshot here -->

---

### Traffic Intelligence — Analytics Dashboard

<!-- Add analytics screenshot here -->

---

## What It Does

Traditional traffic signals run on fixed timers — this project predicts congestion intelligently and recommends optimal signal timings based on real ML output.

End-to-end pipeline:
```
React Dashboard → Java Spring Boot → FastAPI → ML Model → Prediction → Signal Recommendation
```

---

## Features

- ML-powered density prediction — predicts traffic as Low / Medium / High / Very High for any route
- Interactive heatmap — 8 pre-mapped Delhi NCR zones with live colour-coded circle markers
- Custom route search — pick any two areas from 25 Delhi locations and get an instant prediction
- Condition controls — change time of day, day of week, and weather; re-query all zones instantly
- Analytics dashboard — 4 live charts (time of day, zone comparison, density distribution, weather impact)
- Filterable analytics — update all charts by selecting day and weather condition
- Signal timing recommendations — Java backend converts density to recommended green time
- Delhi NCR locked map — map is bounded to Delhi region, cannot pan outside

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | Python, Scikit-learn (Voting Classifier), Pandas, Joblib |
| ML API | FastAPI, Uvicorn |
| Backend | Java 17, Spring Boot, Java HTTP Client |
| Frontend | React, TypeScript, Vite |
| Maps | React Leaflet, OpenStreetMap / CartoDB tiles |
| Charts | Recharts |

---

## How It Works

1. User sets conditions (time of day, day, weather) on the dashboard
2. React frontend calls the Java Spring Boot backend at localhost:8080/predict-zone
3. Spring Boot formats the request and forwards it to the FastAPI ML API at localhost:8000/predict
4. The ML Voting Classifier predicts traffic density for that corridor
5. Java converts density to recommended green signal time and returns it to the frontend
6. The map updates zone markers with colour-coded density; analytics charts update with live data

---

## Project Structure

```
SmartTrafficManagement/
├── ml_services/
│   ├── app.py
│   ├── models/
│   │   └── traffic_density_voting_model.joblib
│   └── requirements.txt
├── src/
│   └── main/java/org/example/
│       ├── Main.java
│       ├── api/TrafficApiClient.java
│       ├── controller/TrafficController.java
│       └── service/TrafficSignalDecision.java
└── frontend/
    └── src/
        ├── components/
        │   ├── Heatmaps.tsx
        │   ├── Analytics.tsx
        │   ├── Home.tsx
        │   └── Settings.tsx
        └── api/trafficApi.ts
```

---

## Running the Project

Start all three services before using the dashboard.

### 1. Start the ML API
```bash
cd ml_services
uvicorn app:app --reload --port 8000
```
API docs available at http://127.0.0.1:8000/docs

### 2. Start the Java Backend
```bash
mvn spring-boot:run
```
Runs at http://localhost:8080

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard at http://localhost:5173

---

## Prerequisites

- Python 3.9+ with fastapi, uvicorn, scikit-learn, pandas, joblib
- Java 17+ and Maven
- Node.js 18+

Install Python dependencies:
```bash
pip install fastapi uvicorn scikit-learn pandas joblib
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

---

## ML Model

The model predicts traffic_density_level (Low / Medium / High / Very High) based on:

| Feature | Example |
|---|---|
| start_area | Lajpat Nagar |
| end_area | Nehru Place |
| distance_km | 5.5 |
| time_of_day | Evening |
| day_of_week | Monday |
| weather_condition | Clear |
| road_type | Urban |
| average_speed_kmph | 22 |
| travel_time_minutes | 15 |

Trained on Delhi NCR traffic data covering 25 areas including Connaught Place, Lajpat Nagar, Rohini, Dwarka, Noida Sector 18, IGI Airport, Chandni Chowk, and more.

---

## Signal Timing Logic

```
Low density      →  30s green
Medium density   →  45s green
High density     →  60s green
Very High        →  75s green
```

---

## Future Enhancements

- Real-time traffic data integration via city APIs
- IoT sensor integration for live vehicle counts
- Alert system for traffic anomalies
- Smart route recommendation for drivers
- City-wide prediction model beyond Delhi NCR
- Notifications for traffic authorities

---

## License

MIT License