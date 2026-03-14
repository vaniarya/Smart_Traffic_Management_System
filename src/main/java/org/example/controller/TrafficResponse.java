package org.example.controller;

public class TrafficResponse {

    public String zone;
    public String density;
    public int green_time;

    public TrafficResponse(String zone, String density, int green_time){
        this.zone = zone;
        this.density = density;
        this.green_time = green_time;
    }
}