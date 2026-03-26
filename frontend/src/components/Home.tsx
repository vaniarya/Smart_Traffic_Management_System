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