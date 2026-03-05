import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

function Nanowire() {

  const mesh = useRef()

  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },

    vertexShader: `
      varying vec2 vUv;

      void main(){
        vUv = uv;
        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position,1.0);
      }
    `,

    fragmentShader: `

      uniform float time;
      varying vec2 vUv;

      float edge(float x){
        return exp(-40.0*x*x);
      }

      void main(){

        float x = vUv.x;

        float bulk =
          0.4 + 0.4*sin(12.0*x - time*3.0);

        float leftEdge = edge(x);
        float rightEdge = edge(1.0-x);

        float intensity =
          bulk + 2.0*(leftEdge + rightEdge);

        vec3 neon =
          vec3(0.0,0.9,1.0)*intensity;

        gl_FragColor =
          vec4(neon,1.0);

      }
    `
  })

  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={mesh} material={material}>
      <cylinderGeometry args={[0.2,0.2,8,128]} />
    </mesh>
  )
}

function MajoranaModes(){

  const left = useRef()
  const right = useRef()

  useFrame(({clock})=>{

    const pulse = 1 + 0.3*Math.sin(clock.elapsedTime*3)

    left.current.scale.setScalar(pulse)
    right.current.scale.setScalar(pulse)

  })

  return(
    <>
      <mesh ref={left} position={[-4,0,0]}>
        <sphereGeometry args={[0.35,64,64]} />
        <meshBasicMaterial color="#00ffff"/>
      </mesh>

      <mesh ref={right} position={[4,0,0]}>
        <sphereGeometry args={[0.35,64,64]} />
        <meshBasicMaterial color="#00ffff"/>
      </mesh>
    </>
  )
}

export default function MajoranaNanowireSim(){

  return(

    <div className="simulation-card h-[500px]">

      <h3 className="text-xl font-bold mb-4">
        Majorana Nanowire (Topological Superconductor)
      </h3>

      <Canvas camera={{ position:[0,2,8] }}>

        <color attach="background" args={["black"]} />

        <ambientLight intensity={0.6} />

        <Nanowire/>

        <MajoranaModes/>

        <OrbitControls/>

        <EffectComposer>
          <Bloom intensity={1.8} />
        </EffectComposer>

      </Canvas>

    </div>

  )
}
