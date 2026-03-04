# Smart Traffic Management System

An AI-powered traffic management platform that predicts road congestion using Machine Learning and visualizes traffic conditions through an interactive web dashboard with real-time maps and heatmaps.

The system integrates Machine Learning, APIs, and a Java-based signal control simulation to demonstrate how intelligent systems can optimize traffic signal timings and reduce congestion.

---

## Project Overview

Traditional traffic signals operate on fixed timers, which often leads to unnecessary waiting time, fuel wastage, and traffic congestion.

This project simulates a Smart Traffic Management System that predicts congestion using Machine Learning and dynamically adjusts signal timings. It also includes a web-based dashboard to visualize traffic conditions and predicted congestion on an interactive map.

The project demonstrates a complete end-to-end workflow:

ML Model → FastAPI REST API → Java Control System → Web Dashboard

---

## Features

- Predicts traffic density (Low / Medium / High)
- Real-time prediction API using FastAPI
- Dynamic signal timing based on congestion level
- Java-based traffic signal simulation
- Web dashboard for traffic visualization
- Interactive map displaying traffic conditions
- Heatmap visualization of predicted congestion
- End-to-end integration of ML, API, backend logic, and frontend visualization

---

## Tech Stack

### Machine Learning
- Python
- Scikit-learn
- Pandas
- Joblib

### Backend / API
- FastAPI
- Uvicorn

### Control System
- Java
- Java HTTP Client

### Frontend
- React
- JavaScript
- HTML
- CSS

### Maps and Visualization
- Map APIs
- Traffic Layer
- Heatmap Visualization

---

## How It Works

1. Traffic input data is collected from the web interface.

2. The data is sent to the FastAPI backend.

3. The Machine Learning model predicts traffic density.

4. The Java application calls the API and retrieves the prediction.

5. Signal timing is adjusted dynamically based on congestion level.

6. The web dashboard displays traffic conditions and predicted congestion using map visualizations.

---

## Running the Project

### 1. Start the ML API

Navigate to the ML service folder and run:

```bash
uvicorn app:app --reload
```

API will run at:

```
http://127.0.0.1:8000/docs
```

---

### 2. Run the Java Application

Run the main Java class from IntelliJ or terminal.

The application will:

- Send traffic input data to the API
- Receive predicted congestion level
- Adjust signal timings automatically

---

### 3. Run the Web Dashboard

Navigate to the frontend directory and run:

```bash
npm install
npm start
```

The React application will start and display the traffic dashboard and map interface.

---

## Future Enhancements

- Real-time traffic data integration
- City-wide traffic prediction model
- Alert system for traffic signal failures
- Notifications for traffic authorities
- Smart route recommendations for drivers
- Integration with IoT traffic sensors

---

## Learning Outcomes

- Machine Learning model deployment
- REST API development
- Cross-language communication (Python and Java)
- Integration of AI with control systems
- Web-based visualization of data
- Simulation of real-world smart traffic systems

---

## License

This project is licensed under the MIT License.
