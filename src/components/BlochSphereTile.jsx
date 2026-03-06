import React, { useEffect, useRef, useState } from 'react';

const BlochSphereTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const hudRef = useRef(null);
  
  const [theta, setTheta] = useState(Math.PI / 2); 
  const [phi, setPhi] = useState(0);
  const [isPrecessing, setIsPrecessing] = useState(false);

  const phiAnimRef = useRef(0);
  const requestRef = useRef();

  const alpha = Math.cos(theta / 2).toFixed(2);
  const betaMag = Math.sin(theta / 2).toFixed(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
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
      
      // Radius scales dynamically to fit the smaller dimension
      const radius = Math.min(w, h) * 0.38;

      const project = (t, p) => ({
        x: centerX + radius * Math.sin(t) * Math.cos(p),
        y: centerY - radius * Math.cos(t)
      });

      // --- 1. Draw Axes ---
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.font = '10px monospace';

      const drawAxis = (x1, y1, x2, y2, label, color) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillText(label, x2 + 5, y2 + 5);
      };

      // Z-Axis
      drawAxis(centerX, centerY - radius, centerX, centerY + radius, 'Z', 'rgba(0, 242, 255, 0.4)');
      ctx.fillStyle = '#fff';
      ctx.fillText('|0⟩', centerX - 8, centerY - radius - 10);
      ctx.fillText('|1⟩', centerX - 8, centerY + radius + 20);

      // Y-Axis
      drawAxis(centerX - radius, centerY, centerX + radius, centerY, 'Y', 'rgba(0, 242, 255, 0.2)');

      // X-Axis
      const xEnd = project(Math.PI / 2, 0);
      const xStart = project(Math.PI / 2, Math.PI);
      drawAxis(xStart.x, xStart.y, xEnd.x, xEnd.y, 'X', 'rgba(255, 255, 255, 0.2)');

      ctx.setLineDash([]);

      // --- 2. Wireframe ---
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
      ctx.beginPath(); ctx.ellipse(centerX, centerY, radius, radius * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(centerX, centerY, radius * 0.2, radius, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();

      // --- 3. State Vector ---
      const target = project(theta, phiAnimRef.current);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(target.x, target.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const hudHeight = hudRef.current?.offsetHeight || 60;
        const controlsHeight = controlsRef.current?.offsetHeight || 100;
        
        canvasRef.current.width = rect.width;
        // Precisely calculate remaining height
        canvasRef.current.height = Math.max(200, rect.height - hudHeight - controlsHeight);
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
        height: '450px', // Fixed height for Desktop, Flex-grow for mobile
        maxHeight: '85vh', // Never exceed mobile screen height
        display: 'flex', 
        flexDirection: 'column', 
        background: '#050505',
        padding: '0',
        overflow: 'hidden'
      }}
    >
      <div ref={hudRef} style={{ padding: '15px 20px 0 20px' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
          BLOCH SPHERE VISUALIZER
        </div>
        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          |ψ⟩ = {alpha}|0⟩ + {betaMag}e<sup>iφ</sup>|1⟩
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'crosshair' }} />

      <div ref={controlsRef} style={{ 
        padding: '12px 20px', 
        background: 'rgba(255,255,255,0.03)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '10px 20px', 
        justifyContent: 'center' 
      }}>
        <div style={{ flex: '1 1 110px', maxWidth: '180px' }}>
          <label style={labelStyle}>THETA (θ): {(theta/Math.PI).toFixed(2)}π</label>
          <input type="range" min="0" max={Math.PI} step="0.01" value={theta} 
            onChange={(e) => setTheta(parseFloat(e.target.value))} style={sliderStyle} />
        </div>
        
        <div style={{ flex: '1 1 110px', maxWidth: '180px' }}>
          <label style={labelStyle}>PHI (φ): {(phi/Math.PI).toFixed(2)}π</label>
          <input type="range" min="0" max={Math.PI * 2} step="0.01" value={phi} 
            onChange={(e) => setPhi(parseFloat(e.target.value))} style={sliderStyle} />
        </div>

        <button 
          onClick={() => setIsPrecessing(!isPrecessing)}
          style={{ 
            padding: '8px 12px', 
            background: isPrecessing ? '#00f2ff' : 'transparent', 
            color: isPrecessing ? '#000' : '#00f2ff', 
            border: '1px solid #00f2ff', 
            borderRadius: '4px', 
            fontSize: '9px', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            alignSelf: 'flex-end',
            marginBottom: '4px'
          }}
        >
          {isPrecessing ? 'STOP' : 'LARMOR PRECESSION'}
        </button>
      </div>
    </div>
  );
};

const labelStyle = { color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace', display: 'block', marginBottom: '4px' };
const sliderStyle = { accentColor: '#00f2ff', width: '100%', cursor: 'pointer' };

export default BlochSphereTile;
