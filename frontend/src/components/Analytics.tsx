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
    <div style={{
      background: "#1a1f2e", border: "1px solid #2a3045",
      borderRadius: 10, padding: "10px 16px",
      fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e2e8f0",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
    }}>
      <div style={{ marginBottom: 6, color: "#6b7fa3", fontSize: 11 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "#e2e8f0", fontWeight: 600 }}>
          {p.name}: <span style={{ color: "#fff" }}>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: "9px 14px", borderRadius: 8,
  border: "1px solid #2a3045",
  fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e2e8f0",
  background: "#131827", outline: "none", cursor: "pointer",
  appearance: "auto",
}

const CHART_DEFS = [
  { id: "time",    label: "01", title: "Traffic by Time of Day",   subtitle: "Avg density score across all 8 zones" },
  { id: "density", label: "02", title: "Density Distribution",     subtitle: "Zone breakdown by congestion level — Evening" },
  { id: "zone",    label: "03", title: "Zone Comparison",          subtitle: "Ranked worst → best — Evening peak hour" },
  { id: "weather", label: "04", title: "Weather Impact",           subtitle: "Avg density across all weather conditions" },
]

export default function Analytics() {
  const [day,     setDay]     = useState("Monday")
  const [weather, setWeather] = useState("Clear")
  const [activeChart, setActiveChart] = useState(0)

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

  const renderChart = () => {
    switch (activeChart) {
      case 0:
        return (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={timeData} barSize={52} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis
                dataKey="time"
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fill: "#94a3b8" }}
                axisLine={{ stroke: "#2a3045" }} tickLine={false}
              />
              <YAxis
                domain={[0, 4]}
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fill: "#4a5568" }}
                axisLine={false} tickLine={false}
                label={{ value: "Density Score", angle: -90, position: "insideLeft", fill: "#4a5568", fontFamily: "'DM Mono', monospace", fontSize: 11, dx: -4 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="score" name="Density Score" radius={[6, 6, 0, 0]}>
                {timeData.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[Math.min(Math.round(entry.score) - 1, 3)] ?? "#4488ff"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      case 1:
        return (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="45%" innerRadius={90} outerRadius={140} dataKey="value" nameKey="name" paddingAngle={4}>
                {donutData.map((entry, i) => <Cell key={i} fill={DENSITY_COLORS[entry.name] ?? "#4488ff"} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={v => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c8d5e8" }}>{v}</span>}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        )
      case 2:
        return (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={zoneData} layout="vertical" barSize={20} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <XAxis
                type="number" domain={[0, 4]}
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fill: "#4a5568" }}
                axisLine={{ stroke: "#2a3045" }} tickLine={false}
              />
              <YAxis
                type="category" dataKey="zone" width={110}
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="score" name="Density Score" radius={[0, 6, 6, 0]}>
                {zoneData.map((entry, i) => <Cell key={i} fill={entry.color ?? "#4488ff"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      case 3:
        return (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={weatherData} barSize={60} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis
                dataKey="weather"
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fill: "#94a3b8" }}
                axisLine={{ stroke: "#2a3045" }} tickLine={false}
              />
              <YAxis
                domain={[0, 4]}
                tick={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fill: "#4a5568" }}
                axisLine={false} tickLine={false}
                label={{ value: "Density Score", angle: -90, position: "insideLeft", fill: "#4a5568", fontFamily: "'DM Mono', monospace", fontSize: 11, dx: -4 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="score" name="Density Score" radius={[6, 6, 0, 0]}>
                {weatherData.map((_, i) => (
                  <Cell key={i} fill={["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        .analytics-wrap * { box-sizing: border-box; }
        .analytics-wrap select option { background: #131827; color: #e2e8f0; }
        .nav-btn { transition: all 0.18s ease; }
        .nav-btn:hover { background: #1e2840 !important; border-color: #3b4d6e !important; }
        .nav-btn.active { background: #1a2540 !important; border-color: #3366ff !important; }
        .chart-tab { transition: all 0.2s ease; cursor: pointer; }
        .chart-tab:hover { background: #1a2035 !important; }
        .chart-tab.active-tab { background: #0f1d35 !important; border-left: 3px solid #3366ff !important; }
        .update-btn { transition: background 0.2s ease; }
        .update-btn:hover:not(:disabled) { background: #1a3aff !important; }
        .arrow-btn { transition: all 0.18s; }
        .arrow-btn:hover:not(:disabled) { background: #1e2840 !important; }
      `}</style>

      <div className="analytics-wrap" style={{
        background: "#0d1117", minHeight: "100%",
        fontFamily: "'Syne', sans-serif", color: "#e2e8f0",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>

        {/* Header */}
        <div style={{
          padding: "24px 28px 16px",
          borderBottom: "1px solid #1a2035",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3366ff", letterSpacing: 3, marginBottom: 6 }}>
              ◈ LIVE ANALYTICS · DELHI NCR
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 24, color: "#f0f4ff", margin: 0 }}>Traffic Intelligence</h1>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4a5a7a", marginTop: 4 }}>
              Real-time ML predictions across 8 zones
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a5a7a", letterSpacing: 1 }}>DAY</span>
              <select style={selectStyle} value={day} onChange={e => setDay(e.target.value)}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a5a7a", letterSpacing: 1 }}>WEATHER</span>
              <select style={selectStyle} value={weather} onChange={e => setWeather(e.target.value)}>
                {WEATHERS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <button
              className="update-btn"
              disabled={loading}
              onClick={() => fetchAll(day, weather)}
              style={{
                background: "#2244ff", color: "#fff", border: "none", borderRadius: 8,
                padding: "9px 20px", fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 12, letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? `LOADING… ${progress}%` : "▶ UPDATE"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ height: 3, background: "#1a2035" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg, #2244ff, #22c55e)",
              transition: "width 0.3s ease",
            }} />
          </div>
        )}

        {/* Main layout: sidebar tabs + chart area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Left sidebar — chart tabs */}
          <div style={{
            width: 200, borderRight: "1px solid #1a2035",
            display: "flex", flexDirection: "column", padding: "20px 0", gap: 4,
            overflowY: "auto", flexShrink: 0
          }}>
            {CHART_DEFS.map((c, i) => (
              <div
                key={c.id}
                className={`chart-tab ${activeChart === i ? "active-tab" : ""}`}
                onClick={() => setActiveChart(i)}
                style={{
                  padding: "14px 20px",
                  borderLeft: `3px solid ${activeChart === i ? "#3366ff" : "transparent"}`,
                  background: activeChart === i ? "#0f1d35" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  color: activeChart === i ? "#3366ff" : "#2a3a55",
                  letterSpacing: 2, marginBottom: 5
                }}>
                  {c.label}
                </div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                  color: activeChart === i ? "#e8f0ff" : "#4a5a7a",
                  lineHeight: 1.3
                }}>
                  {c.title}
                </div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Chart header */}
            <div style={{
              padding: "20px 28px 12px",
              borderBottom: "1px solid #1a2035",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  color: "#3366ff", letterSpacing: 2, marginBottom: 4
                }}>
                  ◈ {CHART_DEFS[activeChart].label} / {CHART_DEFS.length}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "#f0f4ff", margin: 0 }}>
                  {CHART_DEFS[activeChart].title}
                </h2>
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  color: "#4a5a7a", marginTop: 4
                }}>
                  {CHART_DEFS[activeChart].subtitle} · {day} · {weather}
                </p>
              </div>

              {/* Prev / Next */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="arrow-btn"
                  disabled={activeChart === 0}
                  onClick={() => setActiveChart(p => p - 1)}
                  style={{
                    background: "#131827", border: "1px solid #2a3045",
                    color: activeChart === 0 ? "#2a3045" : "#94a3b8",
                    borderRadius: 8, padding: "8px 14px", cursor: activeChart === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'DM Mono', monospace", fontSize: 14
                  }}
                >←</button>
                <button
                  className="arrow-btn"
                  disabled={activeChart === CHART_DEFS.length - 1}
                  onClick={() => setActiveChart(p => p + 1)}
                  style={{
                    background: "#131827", border: "1px solid #2a3045",
                    color: activeChart === CHART_DEFS.length - 1 ? "#2a3045" : "#94a3b8",
                    borderRadius: 8, padding: "8px 14px", cursor: activeChart === CHART_DEFS.length - 1 ? "not-allowed" : "pointer",
                    fontFamily: "'DM Mono', monospace", fontSize: 14
                  }}
                >→</button>
              </div>
            </div>

            {/* Chart body */}
            <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
              {loading ? (
                <div style={{
                  height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#2a3a55"
                }}>
                  Fetching predictions… {progress}%
                </div>
              ) : (
                renderChart()
              )}
            </div>

            {/* Dot pagination */}
            <div style={{
              padding: "14px 28px", borderTop: "1px solid #1a2035",
              display: "flex", alignItems: "center", gap: 8
            }}>
              {CHART_DEFS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveChart(i)}
                  style={{
                    width: activeChart === i ? 24 : 8, height: 8,
                    borderRadius: 4,
                    background: activeChart === i ? "#3366ff" : "#1e2a40",
                    cursor: "pointer", transition: "all 0.2s ease"
                  }}
                />
              ))}
              <span style={{
                marginLeft: "auto", fontFamily: "'DM Mono', monospace",
                fontSize: 10, color: "#2a3a55", letterSpacing: 1
              }}>
                {activeChart + 1} / {CHART_DEFS.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}