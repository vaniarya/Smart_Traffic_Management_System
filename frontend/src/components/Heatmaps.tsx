import { useEffect, useState } from "react"
import { predictZone } from "../api/trafficApi"

const defaultInput = {
  start_area: "Lajpat Nagar",
  end_area: "Nehru Place",
  distance_km: 5.5,
  time_of_day: "Evening",
  day_of_week: "Monday",
  weather_condition: "Clear",
  road_type: "Urban",
  average_speed_kmph: 22,
  travel_time_minutes: 15
}

export default function Heatmaps() {
  const [form, setForm] = useState(defaultInput)
  const [result, setResult] = useState<{ zone: string; density: string; green_time: number } | null>(null)
  const [loading, setLoading] = useState(false)

  async function runPrediction(input = form) {
    setLoading(true)
    try {
      const res = await predictZone(input)
      setResult(res)
      console.log("Prediction:", res)
    } catch (err) {
      console.error("Prediction failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runPrediction(defaultInput)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: ["distance_km", "average_speed_kmph", "travel_time_minutes"].includes(name)
        ? Number(value)
        : value
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runPrediction(form)
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Traffic Heatmap</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: "400px" }}>
        <input name="start_area"           placeholder="Start Area"           value={form.start_area}           onChange={handleChange} />
        <input name="end_area"             placeholder="End Area"             value={form.end_area}             onChange={handleChange} />
        <input name="distance_km"          placeholder="Distance (km)"        value={form.distance_km}          onChange={handleChange} type="number" />
        <input name="time_of_day"          placeholder="Time of Day"          value={form.time_of_day}          onChange={handleChange} />
        <input name="day_of_week"          placeholder="Day of Week"          value={form.day_of_week}          onChange={handleChange} />
        <input name="weather_condition"    placeholder="Weather Condition"    value={form.weather_condition}    onChange={handleChange} />
        <input name="road_type"            placeholder="Road Type"            value={form.road_type}            onChange={handleChange} />
        <input name="average_speed_kmph"   placeholder="Avg Speed (kmph)"    value={form.average_speed_kmph}   onChange={handleChange} type="number" />
        <input name="travel_time_minutes"  placeholder="Travel Time (mins)"   value={form.travel_time_minutes}  onChange={handleChange} type="number" />

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>Result</h2>
          <p><strong>Zone:</strong> {result.zone}</p>
          <p><strong>Density:</strong> {result.density}</p>
          <p><strong>Green Time:</strong> {result.green_time}s</p>
        </div>
      )}
    </div>
  )
}