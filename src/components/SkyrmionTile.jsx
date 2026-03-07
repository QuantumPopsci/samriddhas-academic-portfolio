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
      
      const gridSize = Math.min(w, h) * 0.07;
      const meshDensity = 14; // Slightly lower for thicker, clearer arrows
      const radiusScale = dmi * 5;

      const project = (px, py, pz) => {
        const rotY = rotation.x;
        const rotX = rotation.y;

        let x1 = px * Math.cos(rotY) + pz * Math.sin(rotY);
        let z1 = pz * Math.cos(rotY) - px * Math.sin(rotY);
        let y2 = py * Math.cos(rotX) + z1 * Math.sin(rotX);
        let z2 = z1 * Math.cos(rotX) - py * Math.sin(rotX);

        return { x: centerX + x1 * gridSize, y: centerY - y2 * gridSize, depth: z2 };
      };

      const points = [];
      for (let ix = -meshDensity/2; ix <= meshDensity/2; ix++) {
        for (let iy = -meshDensity/2; iy <= meshDensity/2; iy++) {
          const dist = Math.sqrt(ix * ix + iy * iy);
          const theta = Math.PI * Math.exp(-dist / radiusScale);
          
          const sz = Math.cos(theta);
          const s_inplane = Math.sin(theta);
          const angle = Math.atan2(iy, ix);
          
          // Néel Skyrmion: spins point radially
          const sx = s_inplane * Math.cos(angle);
          const sy = s_inplane * Math.sin(angle);
          
          const pz = sz * 2.5; 
          const p = project(ix, pz, iy);
          points.push({ ...p, sz, sx, sy, ix, iy });
        }
      }

      points.sort((a, b) => a.depth - b.depth);

      points.forEach(p => {
        const r = Math.floor(127 + p.sz * -128);
        const g = Math.floor(127 + p.sz * 128);
        const b = 255;
        const color = `rgb(${r}, ${g}, ${b})`;
        const opacity = Math.max(0.2, (p.depth + 15) / 30);
        
        // --- DRAW ARROW ---
        const arrowLen = 15;
        // Project the arrow tip based on spin components
        // We add the spin vector to the position in 3D then project
        const tip = project(p.ix + p.sx * 0.8, (p.sz * 2.5) + (p.sz * 0.8), p.iy + p.sy * 0.8);

        // 1. Neon Bloom (Thick & Blurred)
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity * 0.4;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        // 2. Bright Core (Thin & Sharp)
        ctx.shadowBlur = 0;
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        // 3. Arrow Head
        const headSize = 4;
        const angle = Math.atan2(tip.y - p.y, tip.x - p.x);
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x - headSize * Math.cos(angle - Math.PI/6), tip.y - headSize * Math.sin(angle - Math.PI/6));
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x - headSize * Math.cos(angle + Math.PI/6), tip.y - headSize * Math.sin(angle + Math.PI/6));
        ctx.stroke();
      });

      requestRef.current = requestAnimationFrame(render);
    };

    // --- INTERACTION ---
    const handleDown = (e) => {
      isDragging.current = true;
      const point = e.touches ? e.touches[0] : e;
      lastMousePos.current = { x: point.clientX, y: point.clientY };
    };

    const handleMove = (e) => {
      if (!isDragging.current) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - lastMousePos.current.x;
      const dy = point.clientY - lastMousePos.current.y;
      setRotation(prev => ({ x: prev.x + dx * 0.01, y: prev.y + dy * 0.01 }));
      lastMousePos.current = { x: point.clientX, y: point.clientY };
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', () => isDragging.current = false);
    canvasElem.addEventListener('touchstart', handleDown);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', () => isDragging.current = false);

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
    };
  }, [dmi, rotation]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#050505', padding: '0', overflow: 'hidden' }}>
      <div ref={hudRef} style={{ padding: '20px 20px 10px 20px', userSelect: 'none' }}>
        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px' }}>3D TOPOLOGICAL TEXTURE // NEON SPIN FIELD</div>
        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          Magnetic Skyrmion (Q = 1)
        </div>
      </div>

      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', cursor: 'grab' }} />

      <div ref={controlsRef} style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 150px' }}>
          <label style={{ color: '#00f2ff', fontSize: '9px', fontFamily: 'monospace' }}>DMI STRENGTH / RADIUS</label>
          <input type="range" min="0.4" max="1.5" step="0.05" value={dmi} onChange={(e) => setDmi(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
        <div style={{ color: '#888', fontSize: '9px', fontFamily: 'monospace', alignSelf: 'center' }}>
          DRAG TO ROTATE // NEON ARROWS INDICATE SPIN DIRECTION
        </div>
      </div>
    </div>
  );
};

export default SkyrmionTile;
