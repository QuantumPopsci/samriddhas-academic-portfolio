import React, { useEffect, useRef, useState } from 'react';

const BlochSphereTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Quantum State: Spherical Coordinates
  const [theta, setTheta] = useState(Math.PI / 4); // Elevation
  const [phi, setPhi] = useState(Math.PI / 4);   // Azimuth
  const [isPrecessing, setIsPrecessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const draw = () => {
      if (isPrecessing) {
        setPhi(prev => (prev + 0.02) % (Math.PI * 2));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      // 3D Projection Logic
      const project = (x, y, z) => {
        const perspective = 0.8;
        const scale = perspective / (perspective + (z / radius));
        return {
          x: centerX + x,
          y: centerY - y // Canvas Y is inverted
        };
      };

      // 1. Draw Axis Lines (Subtle Neon)
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 20); ctx.lineTo(centerX, centerY + radius + 20); // Z
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Sphere Wireframe
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Longitudinal Circle
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Equator
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. The State Vector (The Neon Vector)
      // Conversion: Spherical -> Cartesian
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.cos(theta); // Mapping Z-phys to Y-canvas
      const z = radius * Math.sin(theta) * Math.sin(phi);

      const target = project(x, y, z);

      // Draw Vector Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Vector Head (Pulsing tip)
      const pulse = 4 + Math.sin(Date.now() / 200) * 2;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadows
      ctx.shadowBlur = 0;

      // 4. Labels
      ctx.fillStyle = 'rgba(0, 242, 255, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText('|0⟩', centerX - 8, centerY - radius - 15);
      ctx.fillText('|1⟩', centerX - 8, centerY + radius + 25);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [theta, phi, isPrecessing]);

  return (
    <div ref={containerRef} style={tileStyle}>
      <div style={headerStyle}>NV Center Spin State // Bloch Sphere</div>
      
      <canvas ref={canvasRef} style={{ flex: 1 }} />

      <div style={controlPanelStyle}>
        <div style={controlGroup}>
          <label style={labelStyle}>THETA (θ)</label>
          <input type="range" min="0" max={Math.PI} step="0.01" value={theta} 
            onChange={(e) => setTheta(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <div style={controlGroup}>
          <label style={labelStyle}>PHI (φ)</label>
          <input type="range" min="0" max={Math.PI * 2} step="0.01" value={phi} 
            onChange={(e) => setPhi(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        <button 
          onClick={() => setIsPrecessing(!isPrecessing)}
          style={{
            ...buttonStyle,
            borderColor: isPrecessing ? '#00f2ff' : '#444',
            color: isPrecessing ? '#fff' : '#888'
          }}
        >
          {isPrecessing ? "STOP PRECESSION" : "START PRECESSION"}
        </button>
      </div>
    </div>
  );
};

// Styles to ensure it fits the "Shivkar" Tile layout
const tileStyle = {
  position: 'relative', width: '100%', height: '450px',
  background: '#070707', borderRadius: '12px', border: '1px solid #1a1a1a',
  overflow: 'hidden', display: 'flex', flexDirection: 'column'
};

const headerStyle = {
  position: 'absolute', top: '15px', left: '20px', color: '#00f2ff',
  fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', opacity: 0.7
};

const controlPanelStyle = {
  padding: '15px', background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px'
};

const controlGroup = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { color: '#555', fontSize: '9px', fontFamily: 'monospace' };
const sliderStyle = { width: '100px', accentColor: '#00f2ff', cursor: 'pointer' };
const buttonStyle = {
  background: 'transparent', border: '1px solid', padding: '6px 12px',
  fontSize: '9px', fontFamily: 'monospace', cursor: 'pointer', transition: '0.3s'
};

export default BlochSphereTile;
