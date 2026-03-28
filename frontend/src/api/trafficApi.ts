export interface TrafficRequest {
  start_area: string
  end_area: string
  distance_km: number
  time_of_day: string
  day_of_week: string
  weather_condition: string
  road_type: string
  average_speed_kmph: number
  travel_time_minutes: number
}

export interface TrafficResponse {
  zone: string
  density: string
  green_time: number
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"

export async function predictZone(data: TrafficRequest): Promise<TrafficResponse> {
  const response = await fetch(`${API_BASE}/predict-zone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error("Prediction request failed")
  }

  return response.json()
}