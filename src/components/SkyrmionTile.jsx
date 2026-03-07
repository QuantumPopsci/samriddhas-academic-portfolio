import React, { useEffect, useRef, useState } from 'react';

const SkyrmionTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const controlsRef = useRef(null);

  const [dmi, setDmi] = useState(0.8);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.6 });
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
      
      // Scaling for 3D grid
      const gridSize = Math.min(w, h) * 0.07;
      const meshDensity = 18; 
      const radiusScale = dmi * 5;

      const project = (px, py, pz) => {
        const rotY = rotation.x;
        const rotX = rotation.y;

        // Y-axis rotation (Horizontal drag)
        let x1 = px * Math.cos(rotY) + pz * Math.sin(rotY);
        let z1 = pz * Math.cos(rotY) - px * Math.sin(rotY);
        
        // X-axis rotation (Vertical drag)
        let y2 = py * Math.cos(rotX) + z1 * Math.sin(rotX);
        let z2 = z1 * Math.cos(rotX) - py * Math.sin(rotX);

        return {
          x: centerX + x1 * gridSize,
          y: centerY - y2 * gridSize,
          depth: z2
        };
      };

      // Generate Mesh Points
      const points = [];
      for (let ix = -meshDensity/2; ix <= meshDensity/2; ix++) {
        for (let iy = -meshDensity/2; iy <= meshDensity/2; iy++) {
          const px = ix;
          const py = iy;
          const dist = Math.sqrt(px * px + py * py);
          
          // Physics: Sz = cos(theta). Theta goes 0 -> PI
          const theta = Math.PI * Math.exp(-dist / radiusScale);
          const sz = Math.cos(theta); // This is our HEIGHT
          
          // Map Sz to vertical coordinate (pz)
          // We also draw a small arrow vector at this point
          const pz = sz * 2.5; 

          const p = project(px, pz, py); // Notice pz is the 3D 'y'
          points.push({ ...p, sz, ix, iy });
        }
      }

      // Depth sorting for 3D visibility
      points.sort((a, b) => a.depth - b.depth);

      points.forEach(p => {
        // Color based on Sz Height
        const r = Math.floor(127 + p.sz * -128);
        const g = Math.floor(127 + p.sz * 128);
        const b = 255;
        const opacity = Math.max(0.2, (p.depth + 15) / 30);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.shadowBlur = Math.abs(p.sz) > 0.9 ? 10 : 0;
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;

        // Draw the Lattice Point
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Optional: Draw connecting grid lines to neighbor points
        // (Expensive, so we skip for 60fps on mobile unless requested)
      });

      requestRef.current = requestAnimationFrame(render);
    };

    // Interaction logic
    const handleDown = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
    };

    const handleMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.clientX || e.touches[0].clientX;
      const cy = e.clientY || e.touches[0].clientY;
      const dx = cx - lastMousePos.current.x;
      const dy = cy - lastMousePos.current.y;
      setRotation(prev => ({ x: prev.x + dx * 0.01, y: prev.y + dy * 0.01 }));
      lastMousePos.current = { x: cx, y: cy };
    };

    const handleUp = () => isDragging.current = false;

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvasElem.addEventListener('touchstart', handleDown);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const hH = hudRef.current?.offsetHeight || 0;
        const cH = controlsRef.current?.offsetHeight || 0;
        canvasRef.current.width = rect.width;
        canvasRef.current.height = Math.max(250, rect.height - hH - cH);
      }
    };

    const obs = new ResizeObserver(handleResize);
    obs.observe(containerRef.current);
    handleResize();

    requestRef.current = requestAnimationFrame(render);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(requestRef.current);
      canvasElem.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dmi, rotation]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '500px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: '#050505', padding: '0', overflow: 'hidden' }}>
      <div ref={hudRef} style={{ padding: '20px 20px 10px 20px', userSelect: 'none' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>3D SKYRMION TOPOLOGY</div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          Height = Out-of-Plane Component (S<sub>z</sub>)
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'grab' }} />

      <div ref={controlsRef} style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 150px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>DMI / RADIUS</label>
          <input type="range" min="0.4" max="1.5" step="0.05" value={dmi} onChange={(e) => setDmi(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
        <div style={{ color: '#888', fontSize: '9px', fontFamily: 'monospace', alignSelf: 'center' }}>
          DRAG TO ROTATE LANDSCAPE
        </div>
      </div>
    </div>
  );
};

export default SkyrmionTile;
