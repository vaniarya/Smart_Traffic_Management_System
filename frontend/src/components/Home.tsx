import { useEffect, useRef } from "react";
import "../styles/home.css";

/* Pixel Canvas Component*/
function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PX = 6;
    const W = Math.floor(canvas.offsetWidth / PX);
    const H = Math.floor(canvas.offsetHeight / PX);
    canvas.width = W * PX;
    canvas.height = H * PX;

    let frame = 0;
    let animId: number;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);



      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="pixel-canvas" />;
}
/* Stats Component */
function Stats() {
  const stats = [
    { val: "8", label: "MONITORED ZONES" },
    { val: "25", label: "DELHI AREAS" },
    { val: "4", label: "DENSITY LEVELS" },
    { val: "120s", label: "SIGNAL CYCLE" },
  ];

  return (
    <div className="home-stats">
      {stats.map((s) => (
        <div className="home-stat" key={s.label}>
          <div className="home-stat-val">{s.val}</div>
          <div className="home-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
/* Features Component */
function Features() {
  const features = [
    {
      color: "#00ff88",
      title: "Live Heatmap",
      desc: "8 Delhi NCR zones queried in real time from the ML model",
    },
    {
      color: "#3366ff",
      title: "Custom Route",
      desc: "Check density between any 2 of 25 Delhi areas instantly",
    },
    {
      color: "#ffb800",
      title: "Analytics",
      desc: "4 filterable charts — time, zones, density, weather impact",
    },
    {
      color: "#ff0040",
      title: "Signal Logic",
      desc: "Java backend converts density to recommended green time",
    },
  ];

  return (
    <div className="home-features">
      {features.map((f) => (
        <div className="home-feature" key={f.title}>
          <div
            className="home-feature-dot"
            style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }}
          />
          <div>
            <div className="home-feature-title">{f.title}</div>
            <div className="home-feature-desc">{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
/* Stack Component */
function Stack() {
  const tech = [
    "Python",
    "Scikit-learn",
    "FastAPI",
    "Java 17",
    "Spring Boot",
    "React",
    "TypeScript",
    "Leaflet",
    "Recharts",
    "Vite",
  ];

  return (
    <div className="home-stack">
      <div className="home-stack-label">◈ TECH STACK</div>
      <div className="home-stack-pills">
        {tech.map((t) => (
          <span className="home-pill" key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}