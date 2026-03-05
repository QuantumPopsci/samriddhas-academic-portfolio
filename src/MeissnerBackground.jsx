import { useEffect, useRef } from "react";

const MeissnerBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const mouse = { x: width / 2, y: height / 2 };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const cx = width / 2;
    const cy = height / 2;
    const radius = 150;

    const lines = [];

    for (let i = 0; i < 50; i++) {
      lines.push({
        baseY: (i / 50) * height,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // draw superconducting disk
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15,23,42,0.9)";
      ctx.fill();

      lines.forEach((line) => {
        ctx.beginPath();

        for (let x = 0; x < width; x += 8) {
          let y = line.baseY;

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // --- MEISSNER EXCLUSION ---
          if (dist < radius + 120) {
            const angle = Math.atan2(dy, dx);
            const push = (radius + 120 - dist) * 0.8;

            y += Math.sin(angle) * push;
          }

          // --- CURSOR INTERACTION ---
          const mx = x - mouse.x;
          const my = y - mouse.y;
          const md = Math.sqrt(mx * mx + my * my);

          const cursorRadius = 60; // small cursor effect

          if (md < cursorRadius) {
            const influence = (cursorRadius - md) / cursorRadius;
            y += my * influence * 0.5;
          }

          // smooth wave motion
          y += Math.sin(x * 0.01 + line.phase) * 2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "rgba(34,211,238,0.45)";
        ctx.lineWidth = 2;
        ctx.stroke();

        line.phase += 0.01;
      });

      requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

export default MeissnerBackground;
