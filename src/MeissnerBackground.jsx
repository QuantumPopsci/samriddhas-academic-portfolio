import { useEffect, useRef } from "react";

const MeissnerBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const cx = width / 2;
    const cy = height / 2;
    const radius = 140;

    const mouse = { x: width/2, y: height/2 };

    window.addEventListener("mousemove", e=>{
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const lines = [];

    const lineCount = 60;

    for(let i=0;i<lineCount;i++){
      lines.push({
        baseY: (i/(lineCount-1))*height,
        phase: Math.random()*Math.PI*2
      });
    }

    function draw(){

      ctx.clearRect(0,0,width,height);

      // draw superconducting disk
      ctx.beginPath();
      ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.fillStyle="rgba(15,23,42,0.9)";
      ctx.fill();

      lines.forEach(line=>{

        ctx.beginPath();

        for(let x=0;x<width;x+=6){

          let y=line.baseY;

          const dx=x-cx;
          const dy=y-cy;

          const dist=Math.sqrt(dx*dx+dy*dy);

          // ---------- Meissner exclusion ----------
          if(dist < radius*2){

            const angle=Math.atan2(dy,dx);

            const strength=(radius*2-dist)/(radius*2);

            const tangentX=-Math.sin(angle);
            const tangentY=Math.cos(angle);

            y += tangentY * strength * 120;

          }

          // ---------- cursor perturbation ----------
          const mdx=x-mouse.x;
          const mdy=y-mouse.y;

          const md=Math.sqrt(mdx*mdx+mdy*mdy);

          const cursorRadius=40;

          if(md<cursorRadius){

            const f=(cursorRadius-md)/cursorRadius;

            y += mdy * f * 0.3;

          }

          // ---------- smooth oscillation ----------
          y += Math.sin(x*0.01 + line.phase)*2;

          if(x===0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);

        }

        ctx.strokeStyle="rgba(56,189,248,0.45)";
        ctx.lineWidth=2;
        ctx.stroke();

        line.phase += 0.01;

      });

      requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener("resize",()=>{

      width=window.innerWidth;
      height=window.innerHeight;

      canvas.width=width;
      canvas.height=height;

    });

  },[]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

export default MeissnerBackground;
