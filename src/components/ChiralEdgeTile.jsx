import React, { useEffect, useRef, useState } from 'react';

const ChiralEdgeTile = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(2);
  const [particleCount, setParticleCount] = useState(40);

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

    // Particle logic for edge states
    let particles = [];
    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          progress: Math.random() * 1, // 0 to 1 around the perimeter
          size: Math.random() * 2 + 1,
          offset: (Math.random() - 0.5) * 10 // width of the edge channel
        });
      }
    };

    createParticles();

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // Trailing effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const margin = 40;
      const w = canvas.width - margin * 2;
      const h = canvas.height - margin * 2;
      const perimeter = 2 * (w + h);

      particles.forEach(p => {
        p.progress += (speed * 0.001);
        if (p.progress > 1) p.progress -= 1;

        let x, y;
        let currentPos = p.progress * perimeter;

        // Map linear progress to rectangle perimeter
        if (currentPos < w) {
          x = margin + currentPos;
          y = margin + p.offset;
        } else if (currentPos < w + h) {
          x = margin + w + p.offset;
          y = margin + (currentPos - w);
        } else if (currentPos < 2 * w + h) {
          x = margin + w - (currentPos - (w + h));
          y = margin + h + p.offset;
        } else {
          x = margin + p.offset;
          y = margin + h - (currentPos - (2 * w + h));
        }

        // Draw Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2ff';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw the "Bulk" (The insulator center)
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
      ctx.strokeRect(margin, margin, w, h);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [speed, particleCount]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        background: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid #222',
        overflow: 'hidden',
        display: 'flex'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '20px',
        color: '#00f2ff',
        fontFamily: 'monospace',
        fontSize: '11px',
        letterSpacing: '2px',
        pointerEvents: 'none'
      }}>
        CHIRAL EDGE MODES // TOPOLOGICAL INSULATOR
      </div>

      <canvas ref={canvasRef} style={{ flex: 1 }} />

      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        padding: '10px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(5px)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <label style={{ color: '#888', fontSize: '9px', fontFamily: 'monospace' }}>
          DRIFT VELOCITY
          <input type="range" min="0.5" max="10" step="0.5" value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))} 
            style={{ width: '80px', display: 'block', accentColor: '#00f2ff' }} />
        </label>
      </div>
    </div>
  );
};

export default ChiralEdgeTile;
