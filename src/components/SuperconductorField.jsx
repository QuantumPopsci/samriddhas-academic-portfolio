import { useEffect, useRef, useState } from "react";

const SuperconductorField = () => {

  const canvasRef = useRef(null);

  const [type,setType] = useState("type1");

  useEffect(()=>{

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

    let vortices = [];

    function generateVortices(){

      vortices = [];

      const rings = 3;

      for(let r=1;r<=rings;r++){

        const count = r*6;

        const dist = r*radius/3;

        for(let i=0;i<count;i++){

          const angle = (i/count)*Math.PI*2;

          vortices.push({

            x: cx + dist*Math.cos(angle),
            y: cy + dist*Math.sin(angle),
            phase: Math.random()*Math.PI*2

          });

        }

      }

    }

    generateVortices();

    function field(x,y){

      const dx = x-cx;
      const dy = y-cy;

      const r = Math.sqrt(dx*dx+dy*dy);

      let Bx = B0;
      let By = 0;

      if(type==="type1"){

        if(r>radius){

          const r5 = Math.pow(r,5);

          const mx = -B0*Math.pow(radius,3);

          Bx += (3*dx*dx*mx - r*r*mx)/r5;
          By += (3*dx*dy*mx)/r5;

        }

      }

      if(type==="type2"){

        vortices.forEach(v=>{

          const vx = x-v.x;
          const vy = y-v.y;

          const d = Math.sqrt(vx*vx+vy*vy)+0.01;

          const strength = 80/(d*d);

          Bx += -vy*strength;
          By += vx*strength;

        });

      }

      return {Bx,By,r};

    }

    function drawStreamline(x0,y0){

      let x = x0;
      let y = y0;

      ctx.beginPath();
      ctx.moveTo(x,y);

      for(let i=0;i<800;i++){

        const {Bx,By,r} = field(x,y);

        if(type==="type1" && r<radius) return;

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

      const spacing=40;

      for(let y=spacing;y<height;y+=spacing){

        drawStreamline(0,y);

      }

      if(type==="type1"){

        ctx.beginPath();
        ctx.arc(cx,cy,radius,0,Math.PI*2);

        const grad = ctx.createRadialGradient(cx,cy,20,cx,cy,radius);

        grad.addColorStop(0,"rgba(30,41,59,0.95)");
        grad.addColorStop(1,"rgba(15,23,42,0.95)");

        ctx.fillStyle = grad;
        ctx.fill();

      }

      if(type==="type2"){

        ctx.beginPath();
        ctx.arc(cx,cy,radius,0,Math.PI*2);

        ctx.fillStyle="rgba(30,41,59,0.7)";
        ctx.fill();

        vortices.forEach(v=>{

          ctx.beginPath();

          const pulse = 4 + Math.sin(Date.now()*0.005 + v.phase)*1.5;

          ctx.arc(v.x,v.y,pulse,0,Math.PI*2);

          ctx.fillStyle="rgba(250,204,21,0.9)";
          ctx.fill();

        });

      }

      requestAnimationFrame(draw);

    }

    draw();

    window.addEventListener("resize",()=>{

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

    });

  },[type]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-10"/>

      <div className="fixed bottom-6 right-6 z-50 flex gap-2">

        <button
          onClick={()=>setType("type1")}
          className={`px-3 py-2 rounded-lg text-sm backdrop-blur-md border
          ${type==="type1"
            ?"bg-blue-600 text-white border-blue-500"
            :"bg-white/10 text-white border-white/20"}`}
        >
          Type-I
        </button>

        <button
          onClick={()=>setType("type2")}
          className={`px-3 py-2 rounded-lg text-sm backdrop-blur-md border
          ${type==="type2"
            ?"bg-amber-500 text-black border-amber-400"
            :"bg-white/10 text-white border-white/20"}`}
        >
          Type-II
        </button>

      </div>
    </>
  );

};

export default SuperconductorField;
