#  Smart Traffic Management System

An AI-powered intelligent traffic control system that predicts congestion using Machine Learning and dynamically adjusts signal timings through a Java-based control module.

---

##  Project Overview

Traditional traffic signals operate on fixed timers, which often leads to unnecessary waiting time, fuel wastage, and traffic congestion.

This project simulates a **Smart Traffic Signal System** that adapts to real-time traffic conditions using Machine Learning and automation.

It demonstrates a complete end-to-end workflow:

**ML Model → REST API → Java Control System → Adaptive Signal Timing**

---

##  Features

* Predicts traffic density (**Low / Medium / High**)
* Real-time prediction API using FastAPI
* Dynamic signal timing based on congestion level
* Java-based traffic signal simulation
* End-to-end integration of ML with control logic

---

##  Tech Stack

### Machine Learning

* Python
* Scikit-learn
* Pandas
* Joblib

### Backend / API

* FastAPI
* Uvicorn

### Control System

* Java
* Java HTTP Client

---

##  How It Works

1. Traffic input data is sent to the FastAPI server.
2. The Machine Learning model predicts traffic density.
3. The Java application calls the API and receives the prediction.
4. Signal timing is adjusted dynamically based on congestion level.
5. The traffic signal cycle is simulated accordingly.

---

##  Running the Project

### 1️1 Start the ML API

Navigate to the ML service folder and run:

```bash
uvicorn app:app --reload
```

API will run at:

```
http://127.0.0.1:8000/docs
```

---

### 2 Run the Java Application

Run the main Java class from IntelliJ or terminal.

The application will:

* Send traffic input data to the API
* Receive predicted congestion level
* Adjust signal timings automatically

---

##  Future Enhancements

* Web dashboard for traffic monitoring
* Alert system for signal failures
* Notifications for traffic authorities
* Manual override option for operators

---

##  Learning Outcomes

* Machine Learning model deployment
* REST API integration
* Cross-language communication (Python ↔ Java)
* Real-world AI system simulation

