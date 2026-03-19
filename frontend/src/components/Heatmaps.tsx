import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { predictZone } from "../api/trafficApi"

interface ZoneResult {
  zone: string
  density: string
  green_time: number
  loading: boolean
  lat: number
  lng: number
}

interface Controls {
  time_of_day: string
  day_of_week: string
  weather_condition: string
}

const ZONES = [
  { name: "Connaught Place",  lat: 28.6315, lng: 77.2167, end: "Karol Bagh",      distance_km: 3.2,  road_type: "Urban" },
  { name: "Lajpat Nagar",    lat: 28.5672, lng: 77.2432, end: "Nehru Place",      distance_km: 5.5,  road_type: "Urban" },
  { name: "Rohini",          lat: 28.7495, lng: 77.0680, end: "Pitampura",        distance_km: 4.1,  road_type: "Urban" },
  { name: "Dwarka",          lat: 28.5823, lng: 77.0500, end: "Janakpuri",        distance_km: 6.3,  road_type: "Urban" },
  { name: "Noida Border",    lat: 28.5921, lng: 77.3310, end: "Sector 18 Noida",  distance_km: 8.0,  road_type: "Highway" },
  { name: "Gurgaon Border",  lat: 28.4595, lng: 77.0266, end: "Cyber City",       distance_km: 9.2,  road_type: "Highway" },
  { name: "Karol Bagh",      lat: 28.6520, lng: 77.1900, end: "Connaught Place",  distance_km: 2.8,  road_type: "Urban" },
  { name: "Saket",           lat: 28.5245, lng: 77.2066, end: "Hauz Khas",        distance_km: 3.5,  road_type: "Urban" },
]

const TIME_OPTIONS    = ["Morning", "Afternoon", "Evening", "Night"]
const DAY_OPTIONS     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const WEATHER_OPTIONS = ["Clear", "Rainy", "Foggy", "Cloudy"]

function densityColor(d: string): string {
  switch (d?.toLowerCase()) {
    case "low":       return "#00ff88"
    case "medium":    return "#ffb800"
    case "high":      return "#ff5c00"
    case "very high": return "#ff0040"
    default:          return "#4488ff"
  }
}

function densityGlow(d: string): string {
  switch (d?.toLowerCase()) {
    case "low":       return "0 0 18px #00ff8880"
    case "medium":    return "0 0 18px #ffb80080"
    case "high":      return "0 0 22px #ff5c0099"
    case "very high": return "0 0 28px #ff004099"
    default:          return "0 0 12px #4488ff55"
  }
}

function densityLabel(d: string): string {
  if (!d || d === "loading") return "—"
  return d.charAt(0).toUpperCase() + d.slice(1)
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 14, { duration: 1.2 })
  }, [target, map])
  return null
}

function SignalBar({ greenTime }: { greenTime: number }) {
  const total     = 120
  const greenPct  = (greenTime / total) * 100
  const yellowPct = (5 / total) * 100
  const redPct    = 100 - greenPct - yellowPct
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8899bb", marginBottom: 4, letterSpacing: 1 }}>
        SIGNAL CYCLE  {greenTime}s / 120s
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
        <div style={{ width: `${greenPct}%`,  background: "#00ff88", boxShadow: "0 0 8px #00ff8866" }} />
        <div style={{ width: `${yellowPct}%`, background: "#ffb800" }} />
        <div style={{ width: `${redPct}%`,    background: "#ff0040", opacity: 0.7 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#556688" }}>
        <span>GREEN {greenPct.toFixed(0)}%</span>
        <span>RED {redPct.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default function Heatmaps({ onBack }: { onBack?: () => void }) {
  const [zones, setZones] = useState<ZoneResult[]>(
    ZONES.map(z => ({ zone: z.name, density: "loading", green_time: 0, loading: true, lat: z.lat, lng: z.lng }))
  )
  const [controls, setControls] = useState<Controls>({
    time_of_day: "Evening",
    day_of_week: "Monday",
    weather_condition: "Clear",
  })
  const [flyTarget,  setFlyTarget]  = useState<[number, number] | null>(null)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [globalLoad, setGlobalLoad] = useState(false)

  const fetchAll = useCallback(async (ctrl: Controls) => {
    setGlobalLoad(true)
    setZones(prev => prev.map(z => ({ ...z, loading: true, density: "loading" })))

    await Promise.all(
      ZONES.map(async (z, i) => {
        try {
          const res = await predictZone({
            start_area: z.name, end_area: z.end,
            distance_km: z.distance_km, time_of_day: ctrl.time_of_day,
            day_of_week: ctrl.day_of_week, weather_condition: ctrl.weather_condition,
            road_type: z.road_type, average_speed_kmph: 22, travel_time_minutes: 15,
          })
          setZones(prev => {
            const next = [...prev]
            next[i] = { ...next[i], density: res.density, green_time: res.green_time, loading: false }
            return next
          })
        } catch {
          setZones(prev => {
            const next = [...prev]
            next[i] = { ...next[i], density: "error", loading: false }
            return next
          })
        }
      })
    )
    setGlobalLoad(false)
  }, [])

  useEffect(() => { fetchAll(controls) }, [])

  const densityCounts = zones.reduce<Record<string, number>>((acc, z) => {
    const d = z.density.toLowerCase()
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  const activeZoneData = zones.find(z => z.zone === activeZone)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { background: #07090f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1120; }
        ::-webkit-scrollbar-thumb { background: #1e3060; border-radius: 2px; }
        .leaflet-container { background: #0d1525 !important; }
        .leaflet-tile { filter: brightness(0.75) saturate(0.65); }
        .zone-popup .leaflet-popup-content-wrapper {
          background: #0d1525cc; backdrop-filter: blur(12px);
          border: 1px solid #1e3060; border-radius: 10px;
          color: #c8d8f0; box-shadow: 0 8px 32px #00000099;
        }
        .zone-popup .leaflet-popup-tip { background: #0d1525; }
        .zone-popup .leaflet-popup-close-button { color: #4466aa !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .sidebar-zone-row:hover { background: #111d35 !important; cursor: pointer; }
        .ctrl-select {
          background: #0d1525; border: 1px solid #1e3060; color: #c8d8f0;
          padding: 6px 10px; border-radius: 6px; font-family: 'DM Mono', monospace;
          font-size: 11px; width: 100%; outline: none; transition: border-color 0.2s;
        }
        .ctrl-select:focus { border-color: #3366ff; }
        .run-btn {
          background: linear-gradient(135deg, #1a3aff 0%, #0022cc 100%);
          border: none; color: #fff; font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 12px; letter-spacing: 2px;
          padding: 10px 0; width: 100%; border-radius: 7px; cursor: pointer;
          transition: opacity 0.2s, box-shadow 0.2s; box-shadow: 0 0 20px #1a3aff44;
          text-transform: uppercase;
        }
        .run-btn:hover:not(:disabled) { opacity: 0.85; box-shadow: 0 0 28px #1a3aff77; }
        .run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#07090f" }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 280, minWidth: 280, background: "#0a0f1e",
          borderRight: "1px solid #131f3a", display: "flex",
          flexDirection: "column", zIndex: 1000, boxShadow: "4px 0 40px #00000077",
        }}>
          {/* Header */}
          <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid #131f3a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 10px #00ff88", animation: "blink 2s infinite" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3366ff", letterSpacing: 2 }}>LIVE · DELHI NCR</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e8f0ff", lineHeight: 1.2, marginBottom: 4 }}>
              TRAFFIC<br />CONTROL ROOM
            </h1>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4466aa", letterSpacing: 1 }}>
              SMART SIGNAL MANAGEMENT · v2.1
            </p>
            {onBack && (
              <div onClick={onBack} style={{ marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3366ff", cursor: "pointer", letterSpacing: 1 }}>
                ← BACK TO MENU
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #131f3a" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 12 }}>◈  CONDITIONS</div>
            {[
              { label: "TIME OF DAY", key: "time_of_day",       opts: TIME_OPTIONS },
              { label: "DAY",         key: "day_of_week",       opts: DAY_OPTIONS },
              { label: "WEATHER",     key: "weather_condition", opts: WEATHER_OPTIONS },
            ].map(({ label, key, opts }) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4466aa", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <select className="ctrl-select" value={(controls as any)[key]}
                  onChange={e => setControls(prev => ({ ...prev, [key]: e.target.value }))}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <button className="run-btn" disabled={globalLoad} onClick={() => fetchAll(controls)}>
                {globalLoad ? "⟳  QUERYING..." : "▶  RUN PREDICTION"}
              </button>
            </div>
          </div>

          {/* Density summary */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #131f3a" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 10 }}>◈  DENSITY SUMMARY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "LOW",       key: "low",       color: "#00ff88" },
                { label: "MEDIUM",    key: "medium",    color: "#ffb800" },
                { label: "HIGH",      key: "high",      color: "#ff5c00" },
                { label: "VERY HIGH", key: "very high", color: "#ff0040" },
              ].map(({ label, key, color }) => (
                <div key={key} style={{
                  background: "#0d1525", border: `1px solid ${color}22`,
                  borderRadius: 6, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color, lineHeight: 1 }}>
                      {densityCounts[key] || 0}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#4466aa", letterSpacing: 1 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, padding: "0 20px", marginBottom: 8 }}>◈  ZONES</div>
            {zones.map(z => (
              <div key={z.zone} className="sidebar-zone-row"
                style={{
                  padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: activeZone === z.zone ? "#111d35" : "transparent",
                  borderLeft: activeZone === z.zone ? `2px solid ${densityColor(z.density)}` : "2px solid transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => { setActiveZone(z.zone); setFlyTarget([z.lat, z.lng]) }}
              >
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, color: "#c8d8f0" }}>{z.zone}</div>
                  {!z.loading && (
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4466aa", marginTop: 1 }}>
                      🟢 {z.green_time}s green
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 500,
                  color: z.loading ? "#4466aa" : densityColor(z.density),
                  animation: z.loading ? "blink 1s infinite" : undefined,
                }}>
                  {z.loading ? "QUERY..." : densityLabel(z.density)}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAP */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00000008 2px, #00000008 4px)",
          }} />
          <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, pointerEvents: "none" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#6688aa", letterSpacing: 2 }}>28.6139° N  77.2090° E</div>
          </div>
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20, pointerEvents: "none", textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#6688aa", letterSpacing: 2 }}>ZOOM: AUTO · MODE: HEATMAP</div>
          </div>

          <MapContainer
            center={[28.6139, 77.2090]}
            zoom={11}
            minZoom={10}
            maxZoom={16}
            maxBounds={[[28.40, 76.85], [28.88, 77.55]]}
            maxBoundsViscosity={1.0}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer attribution="" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <FlyTo target={flyTarget} />

            {zones.map(z => (
              <CircleMarker key={z.zone} center={[z.lat, z.lng]}
                radius={z.loading ? 10 : 16}
                pathOptions={{
                  color:       z.loading ? "#4488ff" : densityColor(z.density),
                  fillColor:   z.loading ? "#4488ff" : densityColor(z.density),
                  fillOpacity: z.loading ? 0.15 : 0.28,
                  weight: 2,
                }}
                eventHandlers={{ click: () => { setActiveZone(z.zone); setFlyTarget([z.lat, z.lng]) } }}
              >
                <Popup className="zone-popup">
                  <div style={{ padding: "4px 2px", minWidth: 180 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#e8f0ff", marginBottom: 4 }}>{z.zone}</div>
                    {z.loading ? (
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4466aa", animation: "blink 1s infinite" }}>QUERYING ML MODEL...</div>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: densityColor(z.density), boxShadow: densityGlow(z.density) }} />
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: densityColor(z.density), fontWeight: 500 }}>
                            {densityLabel(z.density).toUpperCase()} DENSITY
                          </span>
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6688aa", marginBottom: 2 }}>Green signal: {z.green_time}s</div>
                        <SignalBar greenTime={z.green_time} />
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Active zone card */}
          {activeZoneData && !activeZoneData.loading && (
            <div style={{
              position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
              zIndex: 20, background: "#0a0f1eee", backdropFilter: "blur(16px)",
              border: `1px solid ${densityColor(activeZoneData.density)}44`,
              borderRadius: 12, padding: "16px 24px", minWidth: 320,
              boxShadow: `0 8px 40px #00000088, 0 0 30px ${densityColor(activeZoneData.density)}22`,
              animation: "fadeIn 0.25s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#3366ff", letterSpacing: 2, marginBottom: 3 }}>◈  ACTIVE ZONE</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#e8f0ff" }}>{activeZoneData.zone}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: densityColor(activeZoneData.density), textShadow: densityGlow(activeZoneData.density), letterSpacing: 1 }}>
                    {densityLabel(activeZoneData.density).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4466aa" }}>DENSITY</div>
                </div>
              </div>
              <SignalBar greenTime={activeZoneData.green_time} />
              <button style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#4466aa", cursor: "pointer", fontSize: 14 }}
                onClick={() => setActiveZone(null)}>✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}