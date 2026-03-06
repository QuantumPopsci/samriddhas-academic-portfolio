import React, { useEffect, useRef, useState } from 'react';

const MajoranaNanowireSim = () => {
  const canvasRef = useRef(null);
  const [isTopological, setIsTopological] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.015; // Animation speed
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = Math.min(canvas.width * 0.7, 800);
      const height = canvas.height;
      const centerY = height / 2;
      const startX = (canvas.width - width) / 2;
      
      // --- 1. THE NANOWIRE "CORE" ---
      // We draw a subtle, glowing background line for the wire itself
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 15]); // Dotted look for the lattice
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + width, centerY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // --- 2. THE MAJORANA WAVEFUNCTIONS ---
      const points = 250;
      
      // Layered Glow Effect (Drawing the line multiple times)
      const drawWave = (color, blur, opacity, thickness) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.lineWidth = thickness;

        for (let i = 0; i <= points; i++) {
          const x = startX + (i / points) * width;
          const relativeX = i / points;
          
          let amplitude = 0;
          if (isTopological) {
            // Physics: Two Majorana modes at the ends
            // Exponential decay: e^(-x/L)
            const decay = 7.5; 
            const leftMode = Math.exp(-relativeX * decay);
            const rightMode = Math.exp(-(1 - relativeX) * decay);
            
            // Oscillate with a slight phase shift for a "breathing" effect
            const wave = Math.sin(time * 3 + i * 0.15);
            amplitude = (leftMode + rightMode) * wave;
          } else {
            // Bulk state: Spread across the wire but low amplitude
            amplitude = Math.sin(time * 2 + i * 0.05) * 0.1;
          }

          const y = centerY + amplitude * 80;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // Apply the layers (Inner core -> Mid glow -> Outer bloom)
      drawWave('#ffffff', 0, 0.8, 1.5);    // Bright center
      drawWave('#00f2ff', 10, 0.5, 3);    // Cyan glow
      drawWave('#00f2ff', 30, 0.2, 8);    // Outer bloom

      // --- 3. MAJORANA "ZERO MODE" HEADS ---
      if (isTopological) {
        drawMZMHead(ctx, startX, centerY, time);
        drawMZMHead(ctx, startX + width, centerY, time + Math.PI);
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(draw);
    };

    const drawMZMHead = (ctx, x, y, t) => {
      const pulse = 8 + Math.sin(t * 4) * 4;
      
      // Create a radial gradient for a "soft star" look
      const grad = ctx.createRadialGradient(x, y, 0, x, y, pulse * 3);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(0, 242, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 242, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, pulse * 3, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isTopological]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050505',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      
      {/* HUD UI Elements */}
      <div style={{
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        fontFamily: 'monospace',
        color: '#00f2ff'
      }}>
        <h2 style={{ fontSize: '12px', letterSpacing: '4px', opacity: 0.6, textTransform: 'uppercase' }}>
          Topological Superconductor Simulation
        </h2>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px #00f2ff' }}>
          {isTopological ? "MAJORANA ZERO MODES DETECTED" : "TRIVIAL PHASE"}
        </h1>
      </div>

      <button 
        onClick={() => setIsTopological(!isTopological)}
        style={{
          position: 'absolute',
          bottom: '50px',
          zIndex: 20,
          background: 'transparent',
          border: '1px solid #00f2ff',
          color: '#00f2ff',
          padding: '12px 24px',
          cursor: 'pointer',
          borderRadius: '2px',
          fontFamily: 'monospace',
          transition: 'all 0.3s ease',
          backgroundColor: 'rgba(0, 242, 255, 0.05)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 242, 255, 0.2)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 242, 255, 0.05)'}
      >
        TOGGLE PHASE
      </button>
    </div>
  );
};

export default MajoranaNanowireSim;
