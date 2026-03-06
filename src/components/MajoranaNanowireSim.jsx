import React, { useEffect, useRef, useState } from 'react';

const MajoranaNanowireSim = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Physics Parameters
  const [mu, setMu] = useState(0.5); // Chemical Potential
  const [delta, setDelta] = useState(0.8); // SC Gap
  const [noise, setNoise] = useState(0.1); // Thermal Noise

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const wireLength = w * 0.8;
      const startX = (w - wireLength) / 2;

      // 1. Draw Nanowire Background (Subtle Neon)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + wireLength, centerY);
      ctx.stroke();

      // 2. Physics Logic: Topological Condition
      // Simple criteria: if |mu| < delta, we are in topological phase
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
            const xi = 6; // Localization length
            const left = Math.exp(-xRel * xi) * Math.sin(time * 2);
            const right = Math.exp(-(1 - xRel) * xi) * Math.sin(time * 2 + Math.PI);
            amplitude = (left + right) * delta;
          } else {
            // Trivial Phase: Smeared bulk states
            amplitude = Math.sin(time + xRel * 10) * 0.05 * mu;
          }

          // Add Thermal Noise
          const n = (Math.random() - 0.5) * noise * 5;
          const yPos = centerY + (amplitude * 50) + n;

          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();
      };

      // Composite the neon glow
      drawLayer('#00f2ff', 20, 0.3, 4);  // Outer Bloom
      drawLayer('#ffffff', 0, 0.9, 1.5); // Core path

      // 3. Majorana Zero Mode Pulsars
      if (isTopological) {
        const drawMZM = (x) => {
          const pulse = Math.abs(Math.sin(time * 2)) * 10 + 5;
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

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [mu, delta, noise]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '400px', // Adjust this to fit your grid/tile
        background: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid #222',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Simulation Title */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '20px',
        color: '#00f2ff',
        fontFamily: 'monospace',
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        pointerEvents: 'none'
      }}>
        Nanowire MZM Simulation
      </div>

      <canvas ref={canvasRef} style={{ flex: 1 }} />

      {/* Control Panel (Glassmorphism) */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '15px',
        right: '15px',
        padding: '12px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px',
        display: 'flex',
        gap: '20px',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={labelStyle}>
          MU (μ)
          <input type="range" min="-2" max="2" step="0.1" value={mu} 
            onChange={(e) => setMu(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={labelStyle}>
          GAP (Δ)
          <input type="range" min="0" max="2" step="0.1" value={delta} 
            onChange={(e) => setDelta(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={labelStyle}>
          NOISE
          <input type="range" min="0" max="0.5" step="0.01" value={noise} 
            onChange={(e) => setNoise(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        
        <div style={{
          color: Math.abs(mu) < delta ? '#00f2ff' : '#444',
          fontSize: '9px',
          fontWeight: 'bold',
          transition: 'color 0.3s'
        }}>
          {Math.abs(mu) < delta ? "TOPOLOGICAL" : "TRIVIAL"}
        </div>
      </div>
    </div>
  );
};

// Internal styles for clean JSX
const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  color: '#888',
  fontSize: '9px',
  fontFamily: 'monospace'
};

const sliderStyle = {
  width: '80px',
  cursor: 'pointer',
  accentColor: '#00f2ff'
};

export default MajoranaNanowireSim;
