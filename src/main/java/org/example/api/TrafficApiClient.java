package org.example.api;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TrafficApiClient {

    public static String getPredictedDensity(String jsonInput) throws Exception {

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:8000/predict"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonInput))
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        // Example response: {"predicted_density":"High"}
        String responseBody = response.body();

        // Extract value safely
        int start = responseBody.indexOf(":") + 2;
        int end = responseBody.lastIndexOf("\"");

        return responseBody.substring(start, end);
    }
}
