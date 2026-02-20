package org.example;

import org.example.api.TrafficApiClient;
import org.example.service.TrafficSignalDecision;
import org.example.simulator.TrafficSignal;

public class Main {
    public static void main(String[] args) {

        try {
            String jsonInput = """
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
            """;

            // 🔥 ML OUTPUT COMES HERE
            String density = TrafficApiClient.getPredictedDensity(jsonInput);

            System.out.println("ML Predicted Density: " + density);

            int greenTime = TrafficSignalDecision.getGreenTime(density);

            TrafficSignal signal = new TrafficSignal(greenTime);
            signal.startSignal();

        } catch (Exception e) {
            System.out.println("Error connecting to ML model");
            e.printStackTrace();
        }
    }
}
