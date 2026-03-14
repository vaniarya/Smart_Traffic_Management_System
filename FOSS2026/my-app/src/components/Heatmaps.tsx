import { useEffect } from "react"
import { predictZone } from "../api/trafficApi"

export default function Heatmaps() {

  async function runPrediction() {

    const result = await predictZone({
      start_area: "Lajpat Nagar",
      end_area: "Nehru Place",
      distance_km: 5.5,
      time_of_day: "Evening",
      day_of_week: "Monday",
      weather_condition: "Clear",
      road_type: "Urban",
      average_speed_kmph: 22,
      travel_time_minutes: 15
    })

    console.log("Prediction:", result)
  }

  useEffect(() => {
    runPrediction()
  }, [])

  return (
    <div>
      <h1>Traffic Heatmap</h1>
      <button onClick={runPrediction}>Run Prediction</button>
    </div>
  )
}