import { useEffect, useRef, useState } from "react";

const MeissnerField = () => {

  const canvasRef = useRef(null);
  const [enabled,setEnabled] = useState(true);

  useEffect(()=>{

    if(!enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const cx = width/2;
    const cy = height/2;

    const radius = 150;
    const B0 = 1;

    const mouse = {x:width/2,y:height/2};

    window.addEventListener("mousemove",e=>{
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function field(x,y){

      const dx = x-cx;
      const dy = y-cy;
      const r = Math.sqrt(dx*dx+dy*dy);

      let Bx = B0;
      let By = 0;

      // central Meissner disk
      if(r > radius){

        const r5 = Math.pow(r,5);
        const mx = -B0*Math.pow(radius,3);

        Bx += (3*dx*dx*mx - r*r*mx)/r5;
        By += (3*dx*dy*mx)/r5;

      }

      // cursor exclusion
      const mxp = x - mouse.x;
      const myp = y - mouse.y;
      const md = Math.sqrt(mxp*mxp + myp*myp);

      const cursorR = 55;

      if(md < cursorR){

        const angle = Math.atan2(myp,mxp);

        const radialX = Math.cos(angle);
        const radialY = Math.sin(angle);

        const tangentX = -Math.sin(angle);
        const tangentY = Math.cos(angle);

        const strength = (cursorR-md)/cursorR;

        // suppress radial field
        Bx -= radialX * strength * 2.0;
        By -= radialY * strength * 2.0;

        // redirect tangentially
        Bx += tangentX * strength * 1.5;
        By += tangentY * strength * 1.5;

      }

      return {Bx,By};

    }

    function drawStreamline(x0,y0){

      let x = x0;
      let y = y0;

      ctx.beginPath();
      ctx.moveTo(x,y);

      for(let i=0;i<800;i++){

        const {Bx,By} = field(x,y);

        const mag = Math.sqrt(Bx*Bx+By*By);

        const step = 3;

        x += (Bx/mag)*step;
        y += (By/mag)*step;

        if(x<0||x>width||y<0||y>height) break;

        ctx.lineTo(x,y);

      }

      ctx.stroke();

    }

    function draw(){

      ctx.clearRect(0,0,width,height);

      ctx.strokeStyle="rgba(56,189,248,0.65)";
      ctx.lineWidth=2;

      const spacing = 40;

      for(let y=spacing;y<height;y+=spacing){
        drawStreamline(0,y);
      }

      // central superconducting disk
      ctx.beginPath();
      ctx.arc(cx,cy,radius,0,Math.PI*2);

      const grad = ctx.createRadialGradient(cx,cy,20,cx,cy,radius);

      grad.addColorStop(0,"rgba(30,41,59,0.95)");
      grad.addColorStop(1,"rgba(15,23,42,0.95)");

      ctx.fillStyle = grad;
      ctx.fill();

      requestAnimationFrame(draw);

    }

    draw();

    window.addEventListener("resize",()=>{

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

    });

  },[enabled]);

  return (
    <>
      {enabled && <canvas ref={canvasRef} className="fixed inset-0 -z-10"/>}

      <button
        onClick={()=>setEnabled(!enabled)}
        className="fixed bottom-6 right-6 z-50 px-3 py-2 text-sm rounded-lg backdrop-blur-md border bg-white/10 text-white border-white/20 hover:bg-white/20"
      >
        {enabled ? "Disable Field" : "Enable Field"}
      </button>
    </>
  );

};

export default MeissnerField;
