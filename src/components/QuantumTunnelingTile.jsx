import React, { useEffect, useRef, useState } from 'react';

const QuantumTunnelingTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [energy, setEnergy] = useState(0.6);
  const [barrierH, setBarrierH] = useState(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      const barrierX = w / 2;
      const bWidth = 30;

      // 1. Draw Potential Barrier
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(barrierX - bWidth/2, centerY - (barrierH * 60), bWidth, barrierH * 120);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(barrierX - bWidth/2, centerY - (barrierH * 60), bWidth, barrierH * 120);

      // 2. Wavefunction Physics
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#00f2ff';
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        let amp = 0;
        const k = Math.sqrt(energy) * 0.2;
        
        if (x < barrierX - bWidth/2) {
          // Incident + Reflected
          amp = Math.sin(k * x - time) * 30;
        } else if (x > barrierX + bWidth/2) {
          // Transmitted (Lower amplitude based on tunneling probability)
          const kappa = Math.sqrt(Math.max(0.01, barrierH - energy)) * 0.15;
          const T = Math.exp(-kappa * bWidth);
          amp = Math.sin(k * x - time) * 30 * T;
        } else {
          // Evanescent Decay
          const kappa = Math.sqrt(Math.max(0.01, barrierH - energy)) * 0.15;
          const localX = x - (barrierX - bWidth/2);
          amp = Math.sin(-time) * 30 * Math.exp(-kappa * localX);
        }

        const y = centerY + amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = 350;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [energy, barrierH]);

  return (
    <div ref={containerRef} className="simulation-card" style={{ background: '#050505' }}>
      <div style={{ padding: '15px' }}>
        <div style={{ color: '#00f2ff', fontSize: '10px', fontFamily: 'monospace' }}>QUANTUM MECHANICS // TUNNELING</div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%' }} />
      <div style={{ padding: '15px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#888', fontSize: '9px', display: 'block' }}>PARTICLE ENERGY (E)</label>
          <input type="range" min="0.1" max="1.5" step="0.05" value={energy} onChange={(e) => setEnergy(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#888', fontSize: '9px', display: 'block' }}>BARRIER HEIGHT (V₀)</label>
          <input type="range" min="0.5" max="2" step="0.05" value={barrierH} onChange={(e) => setBarrierH(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#00f2ff' }} />
        </div>
      </div>
    </div>
  );
};

export default QuantumTunnelingTile;
