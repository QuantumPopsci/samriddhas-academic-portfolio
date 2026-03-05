import { useEffect, useRef, useState } from "react";

const MeissnerField = () => {

  const canvasRef = useRef(null);
  const [enabled,setEnabled] = useState(true);

  useEffect(() => {

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

    function dipoleField(x,y,px,py,radius){

      const dx = x-px;
      const dy = y-py;

      const r = Math.sqrt(dx*dx+dy*dy);

      if(r < radius) return {Bx:0,By:0,inside:true};

      const r5 = Math.pow(r,5);

      const mx = -B0*Math.pow(radius,3);

      const Bx = (3*dx*dx*mx - r*r*mx)/r5;
      const By = (3*dx*dy*mx)/r5;

      return {Bx,By,inside:false};

    }

    function field(x,y){

      let Bx = B0;
      let By = 0;

      const main = dipoleField(x,y,cx,cy,radius);

      if(!main.inside){

        Bx += main.Bx;
        By += main.By;

      }

      // cursor Meissner region
      const cursor = dipoleField(x,y,mouse.x,mouse.y,40);

      if(!cursor.inside){

        Bx += cursor.Bx*0.6;
        By += cursor.By*0.6;

      }

      return {Bx,By};

    }

    function drawStreamline(x0,y0){

      let x = x0;
      let y = y0;

      ctx.beginPath();
      ctx.moveTo(x,y);

      for(let i=0;i<900;i++){

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

      ctx.strokeStyle="rgba(56,189,248,0.55)";
      ctx.lineWidth=2;

      const spacing = 40;

      for(let y=spacing;y<height;y+=spacing){

        drawStreamline(0,y);

      }

      // main superconductor
      ctx.beginPath();
      ctx.arc(cx,cy,radius,0,Math.PI*2);

      const grad = ctx.createRadialGradient(cx,cy,20,cx,cy,radius);

      grad.addColorStop(0,"rgba(30,41,59,0.95)");
      grad.addColorStop(1,"rgba(15,23,42,0.95)");

      ctx.fillStyle = grad;
      ctx.fill();

      // cursor superconductor
      ctx.beginPath();
      ctx.arc(mouse.x,mouse.y,40,0,Math.PI*2);

      ctx.strokeStyle="rgba(250,204,21,0.9)";
      ctx.lineWidth=1.5;
      ctx.stroke();

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
