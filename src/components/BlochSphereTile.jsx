import React, { useEffect, useRef, useState } from 'react';

const BlochSphereTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // State for the Quantum Angles
  const [theta, setTheta] = useState(Math.PI / 2); 
  const [phi, setPhi] = useState(0);
  const [isPrecessing, setIsPrecessing] = useState(false);

  // Refs for smooth animation and value tracking
  const phiAnimRef = useRef(0);
  const requestRef = useRef();

  // Probability amplitudes for the HUD
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
        phiAnimRef.current = phi;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      
      // Scale radius based on container size for prominence
      const radius = Math.min(w, h) * 0.38;

      // 3D Projection Logic (Orthographic with depth)
      const project = (t, p) => {
        return {
          x: centerX + radius * Math.sin(t) * Math.cos(p),
          y: centerY - radius * Math.cos(t),
          z: Math.sin(t) * Math.sin(p) // Depth for layering if needed
        };
      };

      // --- 1. Draw Axis Lines & Labels ---
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.font = 'bold 10px monospace';

      const drawAxis = (x1, y1, x2, y2, label, color) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillText(label, x2 + 5, y2 + 5);
      };

      // Z-Axis (Vertical)
      drawAxis(centerX, centerY - radius, centerX, centerY + radius, 'Z', 'rgba(0, 242, 255, 0.4)');
      ctx.fillStyle = '#fff';
      ctx.fillText('|0⟩', centerX - 8, centerY - radius - 10);
      ctx.fillText('|1⟩', centerX - 8, centerY + radius + 20);

      // Y-Axis (Horizontal)
      drawAxis(centerX - radius, centerY, centerX + radius, centerY, 'Y', 'rgba(0, 242, 255, 0.2)');

      // X-Axis (Perspective)
      const xEnd = project(Math.PI / 2, 0);
      const xStart = project(Math.PI / 2, Math.PI);
      drawAxis(xStart.x, xStart.y, xEnd.x, xEnd.y, 'X', 'rgba(255, 255, 255, 0.2)');

      ctx.setLineDash([]); // Reset dash

      // --- 2. Draw Sphere Wireframe ---
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
      
      // Equator
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Prime Meridian
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 0.2, radius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Boundary
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // --- 3. Draw State Vector ---
      const target = project(theta, phiAnimRef.current);

      // Neon Line Effect
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
      ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadows for performance
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        // Force canvas to match container size minus HUD/Controls
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height - 140; // Subtract UI height
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();

    requestRef.current = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(requestRef.current);
    };
  }, [theta, phi, isPrecessing]);

  return (
    <div 
      ref={containerRef} 
      className="simulation-card" 
      style={{ 
        minHeight: '500px', 
        height: 'auto', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#050505',
        padding: '0' 
      }}
    >
      
      {/* Title HUD - Padded for safety */}
      <div style={{ padding: '20px 20px 0 20px', zIndex: 10 }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
          QUANTUM STATE VISUALIZER
        </div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          |ψ⟩ = {alpha}|0⟩ + {betaMag}e<sup>iφ</sup>|1⟩
        </div>
      </div>

      {/* Main Drawing Area */}
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'crosshair' }} />

      {/* Control Panel (Responsive Glassmorphism) */}
      <div style={{ 
        padding: '15px 20px', 
        background: 'rgba(255,255,255,0.03)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        flexWrap: 'wrap', // Key for mobile stacking
        gap: '20px', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 120px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>
            POLAR (θ): {(theta/Math.PI).toFixed(2)}π
          </label>
          <input 
            type="range" min="0" max={Math.PI} step="0.01" value={theta} 
            onChange={(e) => setTheta(parseFloat(e.target.value))} 
            style={{ accentColor: '#00f2ff', width: '100%' }} 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 120px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>
            AZIMUTH (φ): {(phi/Math.PI).toFixed(2)}π
          </label>
          <input 
            type="range" min="0" max={Math.PI * 2} step="0.01" value={phi} 
            onChange={(e) => setPhi(parseFloat(e.target.value))} 
            style={{ accentColor: '#00f2ff', width: '100%' }} 
          />
        </div>

        <button 
          onClick={() => setIsPrecessing(!isPrecessing)}
          style={{ 
            padding: '10px 20px', 
            background: isPrecessing ? '#00f2ff' : 'transparent', 
            color: isPrecessing ? '#000' : '#00f2ff', 
            border: '1px solid #00f2ff', 
            borderRadius: '4px', 
            fontSize: '10px', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            transition: '0.3s',
            minWidth: '140px'
          }}
        >
          {isPrecessing ? 'STOP PRECESSION' : 'LARMOR PRECESSION'}
        </button>
      </div>
    </div>
  );
};

export default BlochSphereTile;
