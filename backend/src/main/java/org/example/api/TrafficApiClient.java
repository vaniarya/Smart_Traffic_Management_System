package org.example.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TrafficApiClient {

    public static String getPredictedDensity(String jsonInput) throws Exception {

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(System.getenv().getOrDefault("ML_API_URL", "http://127.0.0.1:8000") + "/predict"))
                .header("Content-Type", "application/json; charset=utf-8")  // add charset
                .POST(HttpRequest.BodyPublishers.ofString(jsonInput, java.nio.charset.StandardCharsets.UTF_8))  // explicit charset
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        // Example response: {"predicted_density":"High"}
        String responseBody = response.body();
        System.out.println("Status Code: " + response.statusCode());
        System.out.println("Response Body: " + responseBody);

        // Extract value safely
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(responseBody);
        JsonNode densityNode = node.get("predicted_density");

        if (densityNode == null) {
            throw new RuntimeException("Missing 'predicted_density' in response: " + responseBody);
        }

        return densityNode.asText();
    }
}
