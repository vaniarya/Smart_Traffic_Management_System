package org.example.simulator;

public class TrafficSignal {
    private int greenTime;
    private int yellowTime = 5;
    private int redTime;
    private static final int TOTAL_CYCLE_TIME = 120;

    public TrafficSignal(int greenTime) {
        this.greenTime = greenTime;
        this.redTime = TOTAL_CYCLE_TIME - (greenTime + yellowTime);
    }

    public void startSignal() {
        System.out.println("🟢 Green for " + greenTime + " seconds");
        System.out.println("🟡 Yellow for " + yellowTime + " seconds");
        System.out.println("🔴 Red for " + redTime + " seconds");
    }
}
