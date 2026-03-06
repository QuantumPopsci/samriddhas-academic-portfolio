import React, { useEffect, useRef, useState } from 'react';

const MajoranaNanowireSim = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Physics Parameters
  const [mu, setMu] = useState(0.5); // Chemical Potential
  const [delta, setDelta] = useState(0.8); // Superconducting Gap
  const [noise, setNoise] = useState(0.05); // Thermal Noise

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      const wireLength = w * 0.85;
      const startX = (w - wireLength) / 2;

      // Physics Logic
      const isTopological = Math.abs(mu) < delta;
      const points = 150;

      const drawLayer = (color, blur, opacity, weight) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.lineWidth = weight;

        for (let i = 0; i <= points; i++) {
          const xRel = i / points;
          const xPos = startX + xRel * wireLength;
          
          let amplitude = 0;
          if (isTopological) {
            // Majorana Localized states (Exponential decay)
            const xi = 6; 
            const left = Math.exp(-xRel * xi) * Math.sin(time * 2.5);
            const right = Math.exp(-(1 - xRel) * xi) * Math.sin(time * 2.5 + Math.PI);
            amplitude = (left + right) * delta;
          } else {
            // Trivial Phase
            amplitude = Math.sin(time * 1.5 + xRel * 12) * 0.08 * mu;
          }

          // Thermal Fluctuations
          const n = (Math.random() - 0.5) * noise * 8;
          const yPos = centerY + (amplitude * (h * 0.2)) + n;

          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();
      };

      // Composite the neon glow
      drawLayer('#00f2ff', 20, 0.3, 4);  // Outer Bloom
      drawLayer('#ffffff', 0, 0.9, 2);   // Core path

      // Majorana Zero Mode Pulsars (Heads)
      if (isTopological) {
        const drawMZM = (x) => {
          const pulse = 6 + Math.abs(Math.sin(time * 2.5)) * 10;
          const g = ctx.createRadialGradient(x, centerY, 0, x, centerY, pulse);
          g.addColorStop(0, '#fff');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, centerY, pulse, 0, Math.PI * 2);
          ctx.fill();
        };
        drawMZM(startX);
        drawMZM(startX + wireLength);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        // Subtract height of HUD and Controls dynamically
        canvasRef.current.height = Math.max(200, rect.height - 150); 
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [mu, delta, noise]);

  return (
    <div 
      ref={containerRef}
      className="simulation-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '450px',
        height: 'auto',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        padding: '0'
      }}
    >
      {/* HUD Title */}
      <div style={{ padding: '20px 20px 0 20px', zIndex: 10 }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
          TOPOLOGICAL NANOWIRE SIMULATION
        </div>
        <div style={{ 
          color: Math.abs(mu) < delta ? '#00f2ff' : '#444',
          fontSize: '18px', 
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textShadow: Math.abs(mu) < delta ? '0 0 10px #00f2ff' : 'none'
        }}>
          {Math.abs(mu) < delta ? "PHASE: TOPOLOGICAL (MZM)" : "PHASE: TRIVIAL (GAPPED)"}
        </div>
      </div>

      {/* Flexible Canvas Area */}
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'crosshair' }} />

      {/* Responsive Control Panel */}
      <div style={{
        padding: '15px 20px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={labelContainer}>
          <label style={labelStyle}>POTENTIAL (μ)</label>
          <input type="range" min="-2" max="2" step="0.1" value={mu} 
            onChange={(e) => setMu(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={labelContainer}>
          <label style={labelStyle}>GAP (Δ)</label>
          <input type="range" min="0" max="2" step="0.1" value={delta} 
            onChange={(e) => setDelta(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={labelContainer}>
          <label style={labelStyle}>THERMAL NOISE</label>
          <input type="range" min="0" max="0.3" step="0.01" value={noise} 
            onChange={(e) => setNoise(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
      </div>
    </div>
  );
};

// Styles
const labelContainer = { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 100px' };
const labelStyle = { color: '#888', fontSize: '9px', fontFamily: 'monospace' };
const sliderStyle = { width: '100%', cursor: 'pointer', accentColor: '#00f2ff' };

export default MajoranaNanowireSim;
