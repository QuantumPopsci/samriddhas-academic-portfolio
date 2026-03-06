import React, { useEffect, useRef, useState } from 'react';

const MajoranaSimulation = () => {
  const canvasRef = useRef(null);
  const [isTopological, setIsTopological] = useState(true);
  const [mu, setMu] = useState(0); // Chemical potential

  useEffect(() => {
    const canvas = canvasRef.current;
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
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width * 0.8;
      const height = canvas.height;
      const centerY = height / 2;
      const startX = (canvas.width - width) / 2;
      
      // 1. Draw the Nanowire Base (The "Tube")
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 4;
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + width, centerY);
      ctx.stroke();

      // 2. Calculate and Draw Wavefunctions
      const points = 200;
      ctx.beginPath();
      
      // Neon Glow Settings
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';

      for (let i = 0; i <= points; i++) {
        const x = startX + (i / points) * width;
        const relativeX = i / points;
        
        // Physics logic: MZMs are localized at ends: exp(-x/xi)
        // We add a sine oscillation to represent the quantum phase
        let amplitude = 0;
        if (isTopological) {
          const decay = 8;
          const leftMZM = Math.exp(-relativeX * decay);
          const rightMZM = Math.exp(-(1 - relativeX) * decay);
          amplitude = (leftMZM + rightMZM) * Math.sin(time + i * 0.1);
        }

        const y = centerY + amplitude * 60;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // 3. Draw "End Particles" (The Majorana localized states)
      if (isTopological) {
        drawMajoranaHead(ctx, startX, centerY, time);
        drawMajoranaHead(ctx, startX + width, centerY, time + Math.PI);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const drawMajoranaHead = (ctx, x, y, t) => {
      const pulse = 10 + Math.sin(t * 2) * 5;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, pulse * 2);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.4, 'rgba(0, 242, 255, 0.8)');
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, pulse * 2, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isTopological]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <button 
          onClick={() => setIsTopological(!isTopological)}
          className="px-6 py-2 border border-cyan-500 text-cyan-500 rounded-full hover:bg-cyan-500/10 transition-colors backdrop-blur-md"
        >
          {isTopological ? "Break Topological Phase" : "Enter Topological Phase"}
        </button>
        <p className="text-cyan-900 text-xs uppercase tracking-widest">
          Majorana Zero Mode Simulation // GPU Accelerated
        </p>
      </div>
    </div>
  );
};

export default MajoranaNanowireSim;
