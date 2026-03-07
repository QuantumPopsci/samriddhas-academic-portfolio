import React, { useEffect, useRef, useState } from 'react';

const DiracConeTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);

  // User Parameters
  const [mass, setMass] = useState(0); 
  const [fermiLevel, setFermiLevel] = useState(0.2);

  // Interaction & Animation Refs
  const rotationRef = useRef({ x: 0.5, y: 0.5 }); // Initial tilt
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const scale = Math.min(w, h) * 0.16;

      // 3D Projection Logic with manual rotation
      const project = (kx, ky, e) => {
        const rotY = rotationRef.current.x; // Horizontal drag
        const rotX = rotationRef.current.y; // Vertical drag

        // Rotate around Y axis (Horizontal mouse movement)
        let x1 = kx * Math.cos(rotY) + ky * Math.sin(rotY);
        let y1 = ky * Math.cos(rotY) - kx * Math.sin(rotY);
        
        // Rotate around X axis (Vertical mouse movement)
        let z2 = e * Math.cos(rotX) - y1 * Math.sin(rotX);
        let y2 = y1 * Math.cos(rotX) + e * Math.sin(rotX);

        return {
          x: centerX + x1 * scale,
          y: centerY - z2 * scale // Z is mapped to Screen Y
        };
      };

      const steps = 14;
      const range = 2.2;

      // Draw Grid Lines
      ['kx', 'ky'].forEach(axis => {
        for (let i = -steps; i <= steps; i++) {
          const kFixed = (i / steps) * range;
          
          // --- UPPER CONE (Cyan) ---
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
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

          // --- LOWER CONE (Magenta) ---
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)';
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

      // --- FERMI SURFACE ---
      const kf = Math.sqrt(Math.max(0, fermiLevel * fermiLevel - mass * mass));
      if (Math.abs(fermiLevel) >= mass) {
        ctx.beginPath();
        ctx.shadowBlur = 15;
        ctx.shadowColor = fermiLevel >= 0 ? '#00f2ff' : '#ff00ff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 64; i++) {
          const phi = (i / 64) * Math.PI * 2;
          const p = project(kf * Math.cos(phi), kf * Math.sin(phi), fermiLevel);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    // --- INTERACTION LOGIC ---
    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      rotationRef.current.x += dx * 0.01;
      rotationRef.current.y += dy * 0.01;
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Mobile Touch Support
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasElem.addEventListener('touchstart', (e) => handleMouseDown(e.touches[0]));
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

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
      canvasElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mass, fermiLevel]);

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
      <div ref={hudRef} style={{ padding: '20px 20px 10px 20px', userSelect: 'none' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>
          3D INTERACTIVE DISPERSION // DRAG TO ROTATE
        </div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          E(k) = ±√(v_f²k² + m²)
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        style={{ flex: 1, width: '100%', cursor: 'grab' }} 
        onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
        onMouseUp={(e) => e.target.style.cursor = 'grab'}
      />

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
          <label style={labelStyle}>MASS TERM (m): {mass.toFixed(2)}</label>
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
