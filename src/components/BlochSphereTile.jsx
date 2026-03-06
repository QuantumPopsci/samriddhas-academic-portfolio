import React, { useEffect, useRef, useState } from 'react';

const BlochSphereTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // React state for sliders
  const [theta, setTheta] = useState(Math.PI / 4);
  const [phi, setPhi] = useState(Math.PI / 4);
  const [isPrecessing, setIsPrecessing] = useState(false);
  
  // Refs for smooth animation (avoids React re-render lag)
  const phiRef = useRef(Math.PI / 4);
  const requestRef = useRef();

  // Sync state to ref so animation loop can see it
  useEffect(() => {
    phiRef.current = phi;
  }, [phi]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // 1. Update Physics (Precession)
      if (isPrecessing) {
        phiRef.current += 0.02;
      }

      // 2. Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;

      // Projection Helpers
      const project = (t, p) => {
        // Spherical to Cartesian
        const x = radius * Math.sin(t) * Math.cos(p);
        const y = radius * Math.cos(t); 
        const z = radius * Math.sin(t) * Math.sin(p);
        
        // Simple 3D projection to 2D
        return {
          x: centerX + x,
          y: centerY - y, // Invert Y for screen space
          z: z
        };
      };

      // --- DRAW BACKGROUND SPHERE ---
      ctx.lineWidth = 1;
      
      // Vertical Ellipse (Longitudinal)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Equator (Latitudinal)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
      ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Z-Axis
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 20);
      ctx.lineTo(centerX, centerY + radius + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- DRAW STATE VECTOR ---
      const pos = project(theta, phiRef.current);

      // Neon Glow Line
      ctx.beginPath();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      // Vector Head
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Reset for next frame
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = '#00f2ff';
      ctx.font = '12px monospace';
      ctx.fillText('|0⟩', centerX - 10, centerY - radius - 25);
      ctx.fillText('|1⟩', centerX - 10, centerY + radius + 40);

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
  }, [theta, isPrecessing]); // Only restart if theta or precession status changes

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '400px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: '15px', left: '20px', color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', zIndex: 10 }}>
        NV CENTER // BLOCH SPHERE INTERACTIVE
      </div>
      
      <canvas ref={canvasRef} style={{ flex: 1 }} />

      <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ color: '#888', fontSize: '10px' }}>THETA (θ)</label>
          <input type="range" min="0" max={Math.PI} step="0.01" value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ color: '#888', fontSize: '10px' }}>PHI (φ)</label>
          <input type="range" min="0" max={Math.PI * 2} step="0.01" value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} />
        </div>
        <button 
          onClick={() => setIsPrecessing(!isPrecessing)}
          style={{ padding: '5px 15px', background: isPrecessing ? '#00f2ff' : 'transparent', color: isPrecessing ? '#000' : '#00f2ff', border: '1px solid #00f2ff', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
        >
          {isPrecessing ? 'STOP PRECESSION' : 'START PRECESSION'}
        </button>
      </div>
    </div>
  );
};

export default BlochSphereTile;
