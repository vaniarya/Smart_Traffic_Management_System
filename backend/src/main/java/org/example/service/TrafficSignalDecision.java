package org.example.service;

public class TrafficSignalDecision {
    public static int getGreenTime(String density){
        if (density == null) {
            return 30;
        }
        switch (density.toLowerCase()){
            case "low":
                return 25;
            case "medium":
                return 35;
            case "high":
                return 45;
            case "very high":
                return 55;
            default:
                return 30;
        }
    }
}
