import React, { useEffect, useRef, useState } from 'react';

const BlochSphereTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // State for the Quantum Angles
  const [theta, setTheta] = useState(Math.PI / 2); // Default to |+> state
  const [phi, setPhi] = useState(0);
  const [isPrecessing, setIsPrecessing] = useState(false);

  // Refs for smooth animation and value tracking
  const phiAnimRef = useRef(0);
  const requestRef = useRef();

  // Calculate the probability amplitudes for the HUD
  const alpha = Math.cos(theta / 2).toFixed(2);
  const betaMag = Math.sin(theta / 2).toFixed(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // 1. Update Physics
      if (isPrecessing) {
        phiAnimRef.current += 0.02;
      } else {
        // Sync the animation ref to the slider value when not precessing
        phiAnimRef.current = phi;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) * 0.35;

      // 3D Projection: Standard Orthographic
      const project = (t, p) => {
        return {
          x: centerX + radius * Math.sin(t) * Math.cos(p),
          y: centerY - radius * Math.cos(t), // Z is up in physics, Y is down in Canvas
        };
      };

      // --- Draw Sphere Wireframe ---
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;

      // Latitude (Equator)
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Longitude (Prime Meridian)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 0.15, radius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Boundary
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Axis Lines
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 10); ctx.lineTo(centerX, centerY + radius + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Draw State Vector ---
      const target = project(theta, phiAnimRef.current);

      // Neon Line
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Vector Tip
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
      ctx.fill();

      requestRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [theta, phi, isPrecessing]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '450px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#050505' }}>
      
      {/* Title HUD */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>QUANTUM STATE VISUALIZER</div>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          |ψ⟩ = {alpha}|0⟩ + {betaMag}e<sup>iφ</sup>|1⟩
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, cursor: 'crosshair' }} />

      {/* Control Panel (Glassmorphism) */}
      <div style={{ 
        padding: '20px', 
        background: 'rgba(255,255,255,0.03)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        gap: '25px', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>POLAR (θ): {(theta/Math.PI).toFixed(2)}π</label>
          <input type="range" min="0" max={Math.PI} step="0.01" value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))} style={{ accentColor: '#00f2ff' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>AZIMUTH (φ): {(phi/Math.PI).toFixed(2)}π</label>
          <input type="range" min="0" max={Math.PI * 2} step="0.01" value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} style={{ accentColor: '#00f2ff' }} />
        </div>

        <button 
          onClick={() => setIsPrecessing(!isPrecessing)}
          style={{ 
            padding: '8px 16px', 
            background: isPrecessing ? '#00f2ff' : 'transparent', 
            color: isPrecessing ? '#000' : '#00f2ff', 
            border: '1px solid #00f2ff', 
            borderRadius: '4px', 
            fontSize: '10px', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            transition: '0.3s'
          }}
        >
          {isPrecessing ? 'STOP PRECESSION' : 'LARMOR PRECESSION'}
        </button>
      </div>
    </div>
  );
};

export default BlochSphereTile;
