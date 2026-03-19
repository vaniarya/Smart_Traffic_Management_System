import { useEffect, useState, useCallback } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { predictZone } from "../api/trafficApi"

const ZONES = [
  { name: "Connaught Place", end: "Karol Bagh",     distance_km: 3.2, road_type: "Urban" },
  { name: "Lajpat Nagar",   end: "Nehru Place",     distance_km: 5.5, road_type: "Urban" },
  { name: "Rohini",         end: "Pitampura",       distance_km: 4.1, road_type: "Urban" },
  { name: "Dwarka",         end: "Janakpuri",       distance_km: 6.3, road_type: "Urban" },
  { name: "Noida Border",   end: "Sector 18 Noida", distance_km: 8.0, road_type: "Highway" },
  { name: "Gurgaon Border", end: "Cyber City",      distance_km: 9.2, road_type: "Highway" },
  { name: "Karol Bagh",     end: "Connaught Place", distance_km: 2.8, road_type: "Urban" },
  { name: "Saket",          end: "Hauz Khas",       distance_km: 3.5, road_type: "Urban" },
]

const TIMES    = ["Morning", "Afternoon", "Evening", "Night"]
const WEATHERS = ["Clear", "Rainy", "Foggy", "Cloudy"]
const DAYS     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const DENSITY_SCORE: Record<string, number> = { "low": 1, "medium": 2, "high": 3, "very high": 4, "error": 0 }
const DENSITY_COLORS: Record<string, string> = { "Low": "#22c55e", "Medium": "#f59e0b", "High": "#f97316", "Very High": "#ef4444" }
const CHART_COLORS = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"]

function densityScore(d: string) { return DENSITY_SCORE[d?.toLowerCase()] ?? 0 }
function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#ffffffee", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#213547", boxShadow: "0 4px 12px #00000011" }}>
      <div style={{ marginBottom: 4, color: "#999" }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "#213547" }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}</div>
      ))}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#213547",
  background: "#fff", outline: "none", cursor: "pointer",
}

export default function Analytics() {
  const [day,     setDay]     = useState("Monday")
  const [weather, setWeather] = useState("Clear")

  const [timeData,    setTimeData]    = useState<any[]>([])
  const [zoneData,    setZoneData]    = useState<any[]>([])
  const [donutData,   setDonutData]   = useState<any[]>([])
  const [weatherData, setWeatherData] = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [progress,    setProgress]    = useState(0)

  const fetchAll = useCallback(async (selectedDay: string, selectedWeather: string) => {
    setLoading(true)
    setProgress(0)

    const total = TIMES.length + ZONES.length + WEATHERS.length
    let done = 0
    const tick = () => { done++; setProgress(Math.round((done / total) * 100)) }

    // Chart 1 — by time of day
    const timeResults = await Promise.all(
      TIMES.map(async t => {
        const scores = await Promise.all(
          ZONES.map(z => predictZone({
            start_area: z.name, end_area: z.end, distance_km: z.distance_km,
            time_of_day: t, day_of_week: selectedDay, weather_condition: selectedWeather,
            road_type: z.road_type, average_speed_kmph: 22, travel_time_minutes: 15,
          }).then(r => { tick(); return densityScore(r.density) }).catch(() => { tick(); return 0 }))
        )
        return { time: t, score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) }
      })
    )
    setTimeData(timeResults)

    // Chart 2 & 3 — zone comparison + donut
    const zoneResults = await Promise.all(
      ZONES.map(async z => {
        const r = await predictZone({
          start_area: z.name, end_area: z.end, distance_km: z.distance_km,
          time_of_day: "Evening", day_of_week: selectedDay, weather_condition: selectedWeather,
          road_type: z.road_type, average_speed_kmph: 22, travel_time_minutes: 15,
        }).catch(() => ({ density: "error", green_time: 30 }))
        tick()
        return {
          zone: z.name.replace(" Border", "").replace("Connaught Place", "CP Place"),
          score: densityScore(r.density),
          density: capitalize(r.density),
          color: DENSITY_COLORS[capitalize(r.density)] ?? "#4488ff"
        }
      })
    )
    setZoneData(zoneResults.sort((a, b) => b.score - a.score))

    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, "Very High": 0 }
    zoneResults.forEach(z => { const k = capitalize(z.density); if (counts[k] !== undefined) counts[k]++ })
    setDonutData(Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })))

    // Chart 4 — weather impact
    const weatherResults = await Promise.all(
      WEATHERS.map(async w => {
        const scores = await Promise.all(
          ZONES.slice(0, 4).map(z => predictZone({
            start_area: z.name, end_area: z.end, distance_km: z.distance_km,
            time_of_day: "Evening", day_of_week: selectedDay, weather_condition: w,
            road_type: z.road_type, average_speed_kmph: 22, travel_time_minutes: 15,
          }).then(r => { tick(); return densityScore(r.density) }).catch(() => { tick(); return 0 }))
        )
        return { weather: w, score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) }
      })
    )
    setWeatherData(weatherResults)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll(day, weather) }, [])

  const card: React.CSSProperties = {
    background: "#f8f9fc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "20px 20px 12px"
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .analytics-wrap * { box-sizing: border-box; }
        .analytics-wrap select:focus { border-color: #3366ff !important; }
        .update-btn:hover { background: #1a3aff !important; }
      `}</style>

      <div className="analytics-wrap" style={{ background: "#ffffff", minHeight: "100%", padding: "28px 32px", fontFamily: "'Syne', sans-serif", color: "#213547", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3366ff", letterSpacing: 2, marginBottom: 6 }}>◈ LIVE ANALYTICS · DELHI NCR</div>
          <h1 style={{ fontWeight: 800, fontSize: 26, color: "#213547", margin: 0 }}>Traffic Intelligence</h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginTop: 4 }}>Real-time ML predictions across 8 zones</p>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "14px 18px", background: "#f8f9fc", border: "1px solid #e2e8f0", borderRadius: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3366ff", letterSpacing: 2 }}>◈ FILTERS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999" }}>DAY</span>
            <select style={selectStyle} value={day} onChange={e => setDay(e.target.value)}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999" }}>WEATHER</span>
            <select style={selectStyle} value={weather} onChange={e => setWeather(e.target.value)}>
              {WEATHERS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <button
            className="update-btn"
            disabled={loading}
            onClick={() => fetchAll(day, weather)}
            style={{ marginLeft: "auto", background: "#2244ff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "background 0.2s" }}
          >
            {loading ? `UPDATING... ${progress}%` : "▶ UPDATE CHARTS"}
          </button>
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2244ff, #22c55e)", transition: "width 0.3s ease", borderRadius: 2 }} />
            </div>
          </div>
        )}

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Chart 1 — Time of day */}
          <div style={card}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 4, display: "block" }}>◈  TRAFFIC BY TIME OF DAY</span>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#999", marginBottom: 12 }}>{day} · {weather} · avg across all zones</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeData} barSize={32}>
                <XAxis dataKey="time" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "#bbb" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Density Score" radius={[4, 4, 0, 0]}>
                  {timeData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[Math.min(Math.round(entry.score) - 1, 3)] ?? "#4488ff"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2 — Donut */}
          <div style={card}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 4, display: "block" }}>◈  DENSITY DISTRIBUTION</span>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#999", marginBottom: 12 }}>{day} · {weather} · Evening · all zones</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                  {donutData.map((entry, i) => <Cell key={i} fill={DENSITY_COLORS[entry.name] ?? "#4488ff"} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#213547" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3 — Zone comparison */}
          <div style={card}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 4, display: "block" }}>◈  ZONE COMPARISON</span>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#999", marginBottom: 12 }}>{day} · {weather} · Evening · ranked worst→best</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneData} layout="vertical" barSize={14}>
                <XAxis type="number" domain={[0, 4]} tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "#bbb" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="zone" width={90} tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Density Score" radius={[0, 4, 4, 0]}>
                  {zoneData.map((entry, i) => <Cell key={i} fill={entry.color ?? "#4488ff"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4 — Weather impact */}
          <div style={card}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 4, display: "block" }}>◈  WEATHER IMPACT</span>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#999", marginBottom: 12 }}>{day} · Evening · all weather conditions compared</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weatherData} barSize={36}>
                <XAxis dataKey="weather" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "#bbb" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Density Score" radius={[4, 4, 0, 0]}>
                  {weatherData.map((_, i) => <Cell key={i} fill={["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </>
  )
}