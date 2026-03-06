import React, { useEffect, useRef, useState } from 'react';

const JosephsonJunctionTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [voltage, setVoltage] = useState(0.5);
  const [ic, setIc] = useState(1.0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Physics: dPhi/dt = 2eV/hbar
      phaseRef.current += voltage * 0.15;
      const current = ic * Math.sin(phaseRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Draw the Junction (Two Leads)
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
      
      // Lead Left
      ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(centerX - 20, centerY); ctx.stroke();
      // Lead Right
      ctx.beginPath(); ctx.moveTo(centerX + 20, centerY); ctx.lineTo(w, centerY); ctx.stroke();

      // 2. Draw the Rotating Phase Vector (The "Hidden" Physics)
      const vecR = 40;
      const vx = centerX + vecR * Math.cos(phaseRef.current);
      const vy = centerY + vecR * Math.sin(phaseRef.current);
      
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.arc(centerX, centerY, vecR, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.strokeStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(vx, vy); ctx.stroke();

      // 3. Draw Cooper Pair Tunneling (Glowing particles)
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const offset = (Math.sin(phaseRef.current + i * 1.5) * 30);
        const xPos = centerX + offset;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(xPos, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = Math.max(250, containerRef.current.clientHeight - 120);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    handleResize();
    render();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [voltage, ic]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ height: '400px', display: 'flex', flexDirection: 'column', background: '#050505' }}>
      <div style={{ padding: '15px 20px 0 20px' }}>
        <div style={{ color: '#00f2ff', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px' }}>JOSEPHSON JUNCTION // AC EFFECT</div>
        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>I(φ) = I<sub>c</sub> sin(φ)</div>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1 }} />
      <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ color: '#888', fontSize: '9px', display: 'block' }}>VOLTAGE (V)</label>
          <input type="range" min="0" max="2" step="0.05" value={voltage} onChange={(e) => setVoltage(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ color: '#888', fontSize: '9px', display: 'block' }}>CRITICAL CURRENT (Ic)</label>
          <input type="range" min="0.1" max="2" step="0.1" value={ic} onChange={(e) => setIc(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
      </div>
    </div>
  );
};

export default JosephsonJunctionTile;
