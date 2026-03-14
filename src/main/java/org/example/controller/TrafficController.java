package org.example.controller;

import org.example.api.TrafficApiClient;
import org.example.service.TrafficSignalDecision;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class TrafficController {

    @GetMapping("/")
    public String home() {
        return "Smart Traffic Backend Running 🚦";
    }

    @PostMapping("/predict-zone")
    public TrafficResponse predict(@RequestBody TrafficRequest request) {

        try {

            String jsonInput = """
            {
              "start_area": "%s",
              "end_area": "%s",
              "distance_km": %f,
              "time_of_day": "%s",
              "day_of_week": "%s",
              "weather_condition": "%s",
              "road_type": "%s",
              "average_speed_kmph": %d,
              "travel_time_minutes": %d
            }
            """.formatted(
                    request.start_area,
                    request.end_area,
                    request.distance_km,
                    request.time_of_day,
                    request.day_of_week,
                    request.weather_condition,
                    request.road_type,
                    request.average_speed_kmph,
                    request.travel_time_minutes
            );

            String density = TrafficApiClient.getPredictedDensity(jsonInput);

            int greenTime = TrafficSignalDecision.getGreenTime(density);

            return new TrafficResponse(
                    request.start_area,
                    density,
                    greenTime
            );

        } catch (Exception e) {
            return new TrafficResponse(request.start_area,"error",30);
        }
    }
}