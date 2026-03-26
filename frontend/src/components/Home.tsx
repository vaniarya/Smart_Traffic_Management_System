import { useEffect, useRef } from "react"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const PX = 6
      const W = Math.floor(canvas.offsetWidth / PX)
      const H = Math.floor(canvas.offsetHeight / PX)
      canvas.width  = W * PX
      canvas.height = H * PX
    }

    resize()
    window.addEventListener("resize", resize)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const PX = 6

    const buildings = [
      { x: 2,  w: 3,  h: 55, color: "#c87941" },
      { x: 2,  w: 3,  h: 2,  color: "#e8a060", top: true },
      { x: 6,  w: 6,  h: 28, color: "#1a2a4a" },
      { x: 14, w: 1,  h: 42, color: "#c8b87a" },
      { x: 15, w: 4,  h: 20, color: "#c8b87a" },
      { x: 19, w: 1,  h: 42, color: "#c8b87a" },
      { x: 22, w: 5,  h: 32, color: "#0d1f3c" },
      { x: 28, w: 2,  h: 48, color: "#1a3060" },
      { x: 31, w: 7,  h: 38, color: "#142040" },
      { x: 40, w: 2,  h: 30, color: "#e8e0d0" },
      { x: 42, w: 4,  h: 38, color: "#f0ece0" },
      { x: 46, w: 2,  h: 30, color: "#e8e0d0" },
      { x: 50, w: 6,  h: 44, color: "#0f1d38" },
      { x: 57, w: 3,  h: 55, color: "#1a3060" },
      { x: 61, w: 5,  h: 36, color: "#0d1830" },
      { x: 67, w: 8,  h: 28, color: "#152040" },
      { x: 76, w: 4,  h: 50, color: "#1e3a6e" },
      { x: 81, w: 6,  h: 34, color: "#0d1830" },
      { x: 88, w: 3,  h: 45, color: "#1a3060" },
      { x: 92, w: 5,  h: 30, color: "#142040" },
      { x: 98, w: 4,  h: 40, color: "#0f1d38" },
    ]

    const windowColors = ["#ffd700", "#ff9900", "#00ffcc", "#4488ff", "#ffffff"]

    let frame = 0
    let animId: number

    function getWH() {
      const W = Math.floor(canvas!.width / PX)
      const H = Math.floor(canvas!.height / PX)
      return { W, H }
    }

    function drawSky() {
      const { W, H } = getWH()
      for (let y = 0; y < H * 0.6; y++) {
        const t = y / (H * 0.6)
        const r = Math.round(7  + t * 10)
        const g = Math.round(9  + t * 20)
        const b = Math.round(20 + t * 40)
        ctx!.fillStyle = `rgb(${r},${g},${b})`
        ctx!.fillRect(0, y * PX, W * PX, PX)
      }
    }

    function drawStars() {
      const { W } = getWH()
      const stars = [
        [5,3],[12,7],[20,2],[30,5],[45,8],[55,3],[63,6],[72,2],[80,7],[90,4],
        [8,12],[25,10],[40,15],[60,11],[75,9],[88,14],[15,18],[50,16],[70,13],
      ]
      stars.forEach(([sx, sy]) => {
        const blink = Math.sin(frame * 0.05 + sx) > 0.3 ? 1 : 0.4
        ctx!.globalAlpha = blink
        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(sx * PX, sy * PX, PX, PX)
        ctx!.globalAlpha = 1
      })
    }

    function drawMoon() {
      ctx!.fillStyle = "#fffde0"
      ctx!.fillRect(85 * PX, 4 * PX, 4 * PX, 4 * PX)
      ctx!.fillStyle = "#0a0f1e"
      ctx!.fillRect(86 * PX, 3 * PX, 3 * PX, 3 * PX)
    }

    function drawGround() {
      const { W, H } = getWH()
      const groundY = Math.floor(H * 0.88)
      ctx!.fillStyle = "#0a0f1a"
      ctx!.fillRect(0, groundY * PX, W * PX, H * PX)
      ctx!.fillStyle = "#ffd700"
      const dashCount = Math.floor(W / 8)
      for (let i = 0; i < dashCount; i++) {
        const offset = Math.floor(frame * 0.3) % 8
        ctx!.fillRect((i * 8 + offset) * PX, (groundY + 2) * PX, 4 * PX, PX)
      }
      ctx!.fillStyle = "#131f3a"
      ctx!.fillRect(0, (groundY - 1) * PX, W * PX, PX)
    }

    function drawBuildings() {
      const { W, H } = getWH()
      const groundY = Math.floor(H * 0.72)
      buildings.forEach(b => {
        const bx = Math.floor((b.x / 100) * W)
        const bw = Math.floor((b.w / 100) * W)
        const bh = Math.floor((b.h / 100) * (groundY * 0.85))
        const by = groundY - bh

        ctx!.fillStyle = b.color
        ctx!.fillRect(bx * PX, by * PX, bw * PX, bh * PX)

        if (bw >= 2 && bh >= 4) {
          for (let wy = by + 1; wy < groundY - 1; wy += 3) {
            for (let wx = bx; wx < bx + bw; wx += 2) {
              const isLit = Math.sin(wx * 3.7 + wy * 2.3 + frame * 0.02) > 0.1
              if (isLit) {
                const wc = windowColors[Math.floor((wx * 7 + wy * 3) % windowColors.length)]
                ctx!.fillStyle = wc
                ctx!.globalAlpha = 0.7 + Math.sin(frame * 0.03 + wx) * 0.1
                ctx!.fillRect(wx * PX, wy * PX, PX, PX)
                ctx!.globalAlpha = 1
              }
            }
          }
        }
      })
    }

    function drawCars() {
      const { W, H } = getWH()
      const groundY = Math.floor(H * 0.72)
      const carY = groundY + 1

      const car1X = Math.floor((frame * 0.4) % (W + 10)) - 5
      ctx!.fillStyle = "#ff3366"
      ctx!.fillRect(car1X * PX, carY * PX, 5 * PX, 2 * PX)
      ctx!.fillStyle = "#ff6688"
      ctx!.fillRect((car1X + 1) * PX, (carY - 1) * PX, 3 * PX, PX)
      ctx!.fillStyle = "#ffffaa"
      ctx!.fillRect((car1X + 4) * PX, (carY) * PX, PX, PX)

      const car2X = W - Math.floor((frame * 0.25) % (W + 10))
      ctx!.fillStyle = "#3388ff"
      ctx!.fillRect(car2X * PX, (carY - 3) * PX, 5 * PX, 2 * PX)
      ctx!.fillStyle = "#6699ff"
      ctx!.fillRect((car2X + 1) * PX, (carY - 4) * PX, 3 * PX, PX)
      ctx!.fillStyle = "#ffaaaa"
      ctx!.fillRect(car2X * PX, (carY - 3) * PX, PX, PX)
    }

    function drawTrafficLight() {
      const { W, H } = getWH()
      const groundY = Math.floor(H * 0.72)
      const tlX = Math.floor(W * 0.48)
      const tlY = groundY - 8

      ctx!.fillStyle = "#334455"
      ctx!.fillRect(tlX * PX, tlY * PX, PX, 8 * PX)
      ctx!.fillStyle = "#111"
      ctx!.fillRect((tlX - 1) * PX, tlY * PX, 3 * PX, 6 * PX)

      const cycle = Math.floor(frame / 60) % 3
      ctx!.fillStyle = cycle === 0 ? "#ff2200" : "#330000"
      ctx!.fillRect(tlX * PX, (tlY + 1) * PX, PX, PX)
      ctx!.fillStyle = cycle === 1 ? "#ffbb00" : "#332200"
      ctx!.fillRect(tlX * PX, (tlY + 3) * PX, PX, PX)
      ctx!.fillStyle = cycle === 2 ? "#00ff44" : "#003311"
      ctx!.fillRect(tlX * PX, (tlY + 5) * PX, PX, PX)
    }

    // Overlay: title + stats + features on the bottom half of the canvas
    function drawOverlay() {
      const { W, H } = getWH()
      // Semi-transparent overlay for content area
      const overlayY = Math.floor(H * 0.74)
      ctx!.fillStyle = "rgba(7,9,15,0.97)"
      ctx!.fillRect(0, overlayY * PX, W * PX, (H - overlayY) * PX)
    }

    function draw() {
      const { W, H } = getWH()
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      drawSky()
      drawStars()
      drawMoon()
      drawBuildings()
      drawGround()
      drawCars()
      drawTrafficLight()
      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

        .home-wrap {
          background: #07090f;
          height: 100vh;
          display: grid;
          grid-template-rows: 55% 45%;
          overflow: hidden;
          position: relative;
        }

        .pixel-canvas {
          width: 100%;
          height: 100%;
          display: block;
          image-rendering: pixelated;
        }

        .home-content {
          padding: 24px 40px 32px;
          overflow-y: auto;
          background: #07090f;
        }

        .home-badge {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #3366ff;
          letter-spacing: 3px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .home-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 8px #00ff88;
          animation: hblink 2s infinite;
        }

        @keyframes hblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes hfadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .home-title {
          font-family: 'VT323', monospace;
          font-size: 48px;
          color: #e8f0ff;
          line-height: 1;
          margin-bottom: 8px;
          animation: hfadein 0.6s ease both;
          letter-spacing: 2px;
        }

        .home-title span {
          color: #3366ff;
        }

        .home-sub {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: #4466aa;
          line-height: 1.7;
          margin-bottom: 20px;
          animation: hfadein 0.7s ease 0.1s both;
          max-width: 560px;
        }

        .home-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
          animation: hfadein 0.7s ease 0.2s both;
        }

        .home-stat {
          background: #0a0f1e;
          border: 1px solid #131f3a;
          border-radius: 10px;
          padding: 12px 14px;
        }

        .home-stat-val {
          font-family: 'VT323', monospace;
          font-size: 28px;
          color: #3366ff;
          line-height: 1;
          margin-bottom: 4px;
        }

        .home-stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: #4466aa;
          letter-spacing: 1px;
        }

        .home-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          animation: hfadein 0.7s ease 0.3s both;
        }

        .home-feature {
          background: #0a0f1e;
          border: 1px solid #131f3a;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .home-feature-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          margin-top: 4px;
          flex-shrink: 0;
        }

        .home-feature-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: #c8d8f0;
          margin-bottom: 4px;
          font-weight: bold;
        }

        .home-feature-desc {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: #4466aa;
          line-height: 1.5;
        }

        .home-stack {
          margin-top: 20px;
          animation: hfadein 0.7s ease 0.4s both;
        }

        .home-stack-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: #3366ff;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .home-stack-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .home-pill {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: #6688aa;
          background: #0d1525;
          border: 1px solid #1e3060;
          border-radius: 4px;
          padding: 4px 10px;
        }
      `}</style>

      <div className="home-wrap">
        <canvas ref={canvasRef} className="pixel-canvas" />

        <div className="home-content">
          <div className="home-badge">
            <div className="home-badge-dot" />
            SYSTEM ONLINE · DELHI NCR
          </div>

          <h1 className="home-title">
            SMART<span>TRAFFIC</span> MANAGEMENT
          </h1>

          <p className="home-sub">
            AI-powered corridor traffic prediction across Delhi NCR.
            ML model → FastAPI → Java Spring Boot → React dashboard.
          </p>

          <div className="home-stats">
            {[
              { val: "8",    label: "MONITORED ZONES" },
              { val: "25",   label: "DELHI AREAS" },
              { val: "4",    label: "DENSITY LEVELS" },
              { val: "120s", label: "SIGNAL CYCLE" },
            ].map(s => (
              <div className="home-stat" key={s.label}>
                <div className="home-stat-val">{s.val}</div>
                <div className="home-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="home-features">
            {[
              { color: "#00ff88", title: "Live Heatmap", desc: "8 Delhi NCR zones queried in real time from the ML model" },
              { color: "#3366ff", title: "Custom Route", desc: "Check density between any 2 of 25 Delhi areas instantly" },
              { color: "#ffb800", title: "Analytics", desc: "4 filterable charts — time, zones, density, weather impact" },
              { color: "#ff0040", title: "Signal Logic", desc: "Java backend converts density to recommended green time" },
            ].map(f => (
              <div className="home-feature" key={f.title}>
                <div className="home-feature-dot" style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }} />
                <div>
                  <div className="home-feature-title">{f.title}</div>
                  <div className="home-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="home-stack">
            <div className="home-stack-label">◈ TECH STACK</div>
            <div className="home-stack-pills">
              {["Python", "Scikit-learn", "FastAPI", "Java 17", "Spring Boot", "React", "TypeScript", "Leaflet", "Recharts", "Vite"].map(t => (
                <span className="home-pill" key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}