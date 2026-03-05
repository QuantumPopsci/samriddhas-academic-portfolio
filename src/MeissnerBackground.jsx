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

    const lines = [];

    for (let i = 0; i < 40; i++) {
      lines.push({
        y: (i / 40) * height,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // superconducting disk
      const cx = width / 2;
      const cy = height / 2;
      const r = 120;

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      lines.forEach((line) => {
        ctx.beginPath();

        for (let x = 0; x < width; x += 10) {
          const dx = x - cx;
          const dy = line.y - cy;

          const dist = Math.sqrt(dx * dx + dy * dy);

          let offset = 0;

          if (dist < 300) {
            offset =
              (150 / (dist + 1)) *
              Math.sin(line.phase + x * 0.01);
          }

          const mouseDist = Math.sqrt(
            (x - mouse.x) ** 2 + (line.y - mouse.y) ** 2
          );

          if (mouseDist < 200) {
            offset += 10 * Math.sin(x * 0.05);
          }

          const y = line.y + offset;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "rgba(59,130,246,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        line.phase += 0.01;
      });

      requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
    />
  );
};

export default MeissnerBackground;
