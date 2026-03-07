import React, { useEffect, useRef, useState } from 'react';

const SkyrmionTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);

  // Physics Parameters
  const [dmi, setDmi] = useState(0.6); // Dzyaloshinskii-Moriya Interaction
  const [field, setField] = useState(0.4); // External Magnetic Field
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      
      // Grid settings
      const spacing = Math.max(15, w / 25);
      const cols = Math.floor(w / spacing);
      const rows = Math.floor(h / spacing);
      const startX = (w - (cols - 1) * spacing) / 2;
      const startY = (h - (rows - 1) * spacing) / 2;

      // Skyrmion Profile Parameters
      const R = dmi * 80; // Skyrmion Radius depends on DMI
      const wallWidth = 20;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = startX + i * spacing;
          const y = startY + j * spacing;
          
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Physics: Spin Angle Theta (0 at edge, PI at center)
          // Simplified profile: theta = PI * exp(-dist/R)
          const theta = Math.PI * Math.exp(-dist / R);
          const sz = Math.cos(theta); // Spin Z component
          const s_inplane = Math.sin(theta); // In-plane magnitude
          
          // Phase for swirling (Néel skyrmion)
          const angle = Math.atan2(dy, dx);
          const sx = s_inplane * Math.cos(angle + t * 0.2);
          const sy = s_inplane * Math.sin(angle + t * 0.2);

          // Neon Coloring based on Sz
          // Sz = 1 (Up) -> Cyan
          // Sz = -1 (Down) -> Magenta
          const r = Math.floor(127 + sz * -128); // Increases as Sz goes negative
          const b = 255;
          const g = Math.floor(127 + sz * 128);  // Increases as Sz goes positive
          
          ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.shadowBlur = Math.abs(sz) > 0.8 ? 10 : 0;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.lineWidth = 2;

          // Draw Spin Arrow
          const len = spacing * 0.4;
          ctx.beginPath();
          ctx.moveTo(x - sx * len, y - sy * len);
          ctx.lineTo(x + sx * len, y + sy * len);
          ctx.stroke();
          
          // Draw "Core" Dot
          if (dist < R * 0.5) {
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const hH = hudRef.current?.offsetHeight || 0;
        const cH = controlsRef.current?.offsetHeight || 0;
        canvasRef.current.width = rect.width;
        canvasRef.current.height = Math.max(250, rect.height - hH - cH);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [dmi, field]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '480px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#050505', padding: '0', overflow: 'hidden' }}>
      
      <div ref={hudRef} style={{ padding: '20px 20px 10px 20px' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>MAGNETIC TEXTURE // SKYRMION</div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          Topological Charge Q = 1
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: '100%' }} />

      <div ref={controlsRef} style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div style={controlGroup}>
          <label style={labelStyle}>DMI STRENGTH (D): {dmi.toFixed(2)}</label>
          <input type="range" min="0.2" max="1.5" step="0.05" value={dmi} onChange={(e) => setDmi(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={controlGroup}>
          <label style={labelStyle}>MAGNETIC FIELD (B): {field.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={field} onChange={(e) => setField(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
      </div>
    </div>
  );
};

const controlGroup = { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 120px', maxWidth: '180px' };
const labelStyle = { color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' };
const sliderStyle = { width: '100%', accentColor: '#00f2ff', cursor: 'pointer' };

export default SkyrmionTile;
