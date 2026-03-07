import React, { useEffect, useRef, useState } from 'react';

const DiracConeTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);

  // User Parameters
  const [mass, setMass] = useState(0); 
  const [fermiLevel, setFermiLevel] = useState(0.2);

  // Animation Refs (to keep the loop stable without re-renders)
  const rotationRef = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // 1. Update Rotation
      rotationRef.current += 0.008;

      // 2. Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const scale = Math.min(w, h) * 0.16;

      // 3D Projection Logic
      const project = (kx, ky, e) => {
        const angle = rotationRef.current;
        const rotX = kx * Math.cos(angle) - ky * Math.sin(angle);
        const rotY = kx * Math.sin(angle) + ky * Math.cos(angle);
        const tilt = 0.55;
        return {
          x: centerX + rotX * scale,
          y: centerY - (e * scale * 0.8) + (rotY * scale * tilt)
        };
      };

      const steps = 14;
      const range = 2.2;

      // Draw Cones
      ['kx', 'ky'].forEach(axis => {
        for (let i = -steps; i <= steps; i++) {
          const kFixed = (i / steps) * range;
          
          // --- UPPER CONE (Conduction Band - Cyan) ---
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 242, 255, 0.25)';
          ctx.lineWidth = 1;
          for (let j = -steps; j <= steps; j++) {
            const kVar = (j / steps) * range;
            const kx = axis === 'kx' ? kFixed : kVar;
            const ky = axis === 'ky' ? kFixed : kVar;
            const energy = Math.sqrt(kx * kx + ky * ky + mass * mass);
            const p = project(kx, ky, energy);
            if (j === -steps) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();

          // --- LOWER CONE (Valence Band - Magenta) ---
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
          for (let j = -steps; j <= steps; j++) {
            const kVar = (j / steps) * range;
            const kx = axis === 'kx' ? kFixed : kVar;
            const ky = axis === 'ky' ? kFixed : kVar;
            const energy = -Math.sqrt(kx * kx + ky * ky + mass * mass);
            const p = project(kx, ky, energy);
            if (j === -steps) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        }
      });

      // --- FERMI SURFACE (The Glowing Ring) ---
      const ringPoints = 72;
      const kf = Math.sqrt(Math.max(0, fermiLevel * fermiLevel - mass * mass));
      
      if (Math.abs(fermiLevel) >= mass) {
        ctx.beginPath();
        ctx.shadowBlur = 15;
        ctx.shadowColor = fermiLevel >= 0 ? '#00f2ff' : '#ff00ff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i <= ringPoints; i++) {
          const phi = (i / ringPoints) * Math.PI * 2;
          const kx = kf * Math.cos(phi);
          const ky = kf * Math.sin(phi);
          const p = project(kx, ky, fermiLevel);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const hudH = hudRef.current?.offsetHeight || 0;
        const ctrlH = controlsRef.current?.offsetHeight || 0;
        canvasRef.current.width = rect.width;
        canvasRef.current.height = Math.max(250, rect.height - hudH - ctrlH);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();
    requestRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(requestRef.current);
      observer.disconnect();
    };
  }, [mass, fermiLevel]); // Loop updates when user changes params

  return (
    <div 
      ref={containerRef} 
      className="simulation-card" 
      style={{ 
        height: '450px', 
        maxHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#050505', 
        padding: '0', 
        overflow: 'hidden' 
      }}
    >
      <div ref={hudRef} style={{ padding: '20px 20px 10px 20px' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
          DISPERSION RELATION // DIRAC CONE
        </div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          E(k) = ±√(v_f²k² + m²)
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'crosshair' }} />

      <div ref={controlsRef} style={{ 
        padding: '15px 20px', 
        background: 'rgba(255,255,255,0.03)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px 25px', 
        justifyContent: 'center' 
      }}>
        <div style={controlGroup}>
          <label style={labelStyle}>MASS TERM (GAP): {mass.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.01" value={mass} onChange={(e) => setMass(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={controlGroup}>
          <label style={labelStyle}>FERMI LEVEL: {fermiLevel.toFixed(2)}</label>
          <input type="range" min="-1.5" max="1.5" step="0.05" value={fermiLevel} onChange={(e) => setFermiLevel(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
      </div>
    </div>
  );
};

const controlGroup = { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 120px', maxWidth: '180px' };
const labelStyle = { color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' };
const sliderStyle = { width: '100%', accentColor: '#00f2ff', cursor: 'pointer' };

export default DiracConeTile;
