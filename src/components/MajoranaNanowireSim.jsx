import React, { useState, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import Plot from "react-plotly.js"
import numeric from "numeric"

const N = 10
const t = 1

function buildHamiltonian(mu, delta){

  const dim = 2*N
  const H = numeric.rep([dim,dim],0)

  for(let i=0;i<N;i++){

    H[i][i] = -mu
    H[i+N][i+N] = mu

    if(i < N-1){

      H[i][i+1] = -t
      H[i+1][i] = -t

      H[i+N][i+1+N] = t
      H[i+1+N][i+N] = t

      H[i][i+1+N] = delta
      H[i+1][i+N] = -delta

      H[i+1+N][i] = delta
      H[i+N][i+1] = -delta
    }
  }

  return H
}

function computeMajorana(mu, delta){

  const H = buildHamiltonian(mu,delta)

  const eig = numeric.eig(H)

  const values = eig.lambda.x
  const vecs = eig.E.x

  const idx =
    values
    .map((v,i)=>[Math.abs(v),i])
    .sort((a,b)=>a[0]-b[0])[0][1]

  const psi = []

  for(let i=0;i<N;i++){

    const u = vecs[i][idx]
    const v = vecs[i+N][idx]

    psi.push(Math.sqrt(u*u + v*v))
  }

  return psi
}

function Chain({psi}){

  const spacing = 0.8

  return(

    <group>

      {psi.map((amp,i)=>{

        const x = (i - N/2)*spacing

        return(

          <group key={i} position={[x,0,0]}>

            <mesh>
              <sphereGeometry args={[0.08,32,32]}/>
              <meshStandardMaterial color="#22d3ee"/>
            </mesh>

            <mesh position={[0,amp*1.5,0]}>
              <sphereGeometry args={[0.15,32,32]}/>
              <meshStandardMaterial
                color="#a855f7"
                emissive="#a855f7"
                emissiveIntensity={4}
              />
            </mesh>

          </group>

        )
      })}

      {Array.from({length:N-1}).map((_,i)=>{

        const x1 = (i - N/2)*spacing
        const x2 = (i+1 - N/2)*spacing

        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1,0,0),
          new THREE.Vector3(x2,0,0)
        ])

        return(
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#334155"/>
          </line>
        )
      })}

    </group>
  )
}

export default function MajoranaNanowireSim(){

  const [mu,setMu] = useState(0)
  const [delta,setDelta] = useState(1)

  const psi =
    useMemo(()=>computeMajorana(mu,delta),[mu,delta])

  const topo = Math.abs(mu) < 2

  const k = Array.from({length:200},(_,i)=>
    -Math.PI + (2*Math.PI*i)/199
  )

  const band = k.map(kv =>
    Math.sqrt((mu+2*Math.cos(kv))**2 +
    (2*delta*Math.sin(kv))**2)
  )

  return(

  <div className="simulation-card">

    <h3 className="text-2xl font-bold mb-4">
      Kitaev Chain Majorana Simulator
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="md:col-span-2 h-[420px]">

        <Canvas camera={{position:[0,2,6]}}>

          <color attach="background" args={["black"]}/>

          <ambientLight intensity={1.5}/>

          <pointLight position={[0,3,5]} intensity={3}/>

          <Chain psi={psi}/>

          <OrbitControls/>

          <EffectComposer>
            <Bloom intensity={2.5}/>
          </EffectComposer>

        </Canvas>

      </div>

      <div className="space-y-4">

        <div>

          <label>μ: {mu.toFixed(2)}</label>

          <input
          type="range"
          min="-3"
          max="3"
          step="0.05"
          value={mu}
          onChange={e=>setMu(parseFloat(e.target.value))}
          className="w-full"
          />

        </div>

        <div>

          <label>Δ: {delta.toFixed(2)}</label>

          <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={delta}
          onChange={e=>setDelta(parseFloat(e.target.value))}
          className="w-full"
          />

        </div>

        <div className={`p-4 rounded-lg ${
          topo ? "bg-purple-900/40":"bg-red-900/40"
        }`}>

          <b>Phase:</b> {topo ? "Topological (Majorana)" : "Trivial"}

        </div>

      </div>

    </div>

    <div className="mt-8 h-[350px]">

      <Plot

      data={[
        {
          x:k,
          y:band,
          mode:"lines",
          line:{color:"#22d3ee",width:3}
        },
        {
          x:k,
          y:band.map(v=>-v),
          mode:"lines",
          line:{color:"#a855f7",width:3}
        }
      ]}

      layout={{
        title:"BdG Spectrum",
        paper_bgcolor:"rgba(0,0,0,0)",
        plot_bgcolor:"rgba(0,0,0,0)",
        font:{color:"#cbd5e1"},
        xaxis:{title:"k"},
        yaxis:{title:"Energy"}
      }}

      style={{width:"100%",height:"100%"}}

      config={{responsive:true}}

      />

    </div>

  </div>

  )
}
