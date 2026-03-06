import React, { useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Plot from "react-plotly.js";

const N = 100;

function computeWavefunction(mu) {
  const psi = [];
  const topo = Math.abs(mu) < 2;

  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);

    if (topo) {
      const left = Math.exp(-10 * x);
      const right = Math.exp(-10 * (1 - x));
      psi.push(left + right);
    } else {
      psi.push(0.2 * Math.sin(8 * x));
    }
  }

  return { psi, topo };
}

function Nanowire({ psi, topo }) {

  const lineGeom = useMemo(() => {

    const points = [];

    for (let i = 0; i < N; i++) {

      const x = (i / N - 0.5) * 8;
      const y = psi[i] * 1.2;

      points.push(new THREE.Vector3(x, y, 0));

    }

    return new THREE.BufferGeometry().setFromPoints(points);

  }, [psi]);

  return (

    <group>

      {/* Base wire */}
      <mesh position={[0,0,0]}>
        <cylinderGeometry args={[0.03,0.03,8,32]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.3}/>
      </mesh>

      {/* Wavefunction line */}
      <line geometry={lineGeom}>
        <lineBasicMaterial
          color={topo ? "#22d3ee" : "#f43f5e"}
          linewidth={3}
        />
      </line>

      {/* Edge Majorana glow */}
      {topo && (
        <>
          <mesh position={[-4,0,0]}>
            <sphereGeometry args={[0.2,32,32]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={4}
            />
          </mesh>

          <mesh position={[4,0,0]}>
            <sphereGeometry args={[0.2,32,32]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={4}
            />
          </mesh>
        </>
      )}

    </group>

  );
}

export default function MajoranaNanowireSim() {

  const [mu, setMu] = useState(0);
  const [delta, setDelta] = useState(1);
  const [B, setB] = useState(0.5);

  const { psi, topo } = useMemo(() => computeWavefunction(mu), [mu]);

  const k = Array.from({ length: 200 }, (_, i) =>
    -Math.PI + (2 * Math.PI * i) / 199
  );

  const spectrum = k.map((kv) =>
    Math.sqrt(
      (mu + 2 * Math.cos(kv)) ** 2 +
      (2 * delta * Math.sin(kv)) ** 2
    )
  );

  return (

    <div className="simulation-card">

      <h3 className="text-2xl font-bold mb-4">
        Majorana Nanowire Simulator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="md:col-span-2 h-[420px] rounded-lg overflow-hidden">

          <Canvas camera={{ position: [0, 1.5, 6] }}>

            <color attach="background" args={["black"]} />

            <ambientLight intensity={1.2} />
            <pointLight position={[0,3,5]} intensity={3}/>

            <Nanowire psi={psi} topo={topo} />

            <OrbitControls enablePan={false}/>

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
              onChange={(e) => setMu(parseFloat(e.target.value))}
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
              onChange={(e) => setDelta(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label>B: {B.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={B}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className={`p-4 rounded-lg ${topo ? "bg-cyan-900/40" : "bg-red-900/40"}`}>
            <b>Phase:</b> {topo ? "Topological (Majorana Modes)" : "Trivial"}
          </div>

        </div>

      </div>

      <div className="mt-8 h-[350px]">

        <Plot
          data={[
            {
              x: k,
              y: spectrum,
              mode: "lines",
              line: { color: "#22d3ee", width: 3 },
              name: "E(k)"
            },
            {
              x: k,
              y: spectrum.map((v) => -v),
              mode: "lines",
              line: { color: "#f43f5e", width: 3 },
              name: "-E(k)"
            }
          ]}
          layout={{
            title: "BdG Spectrum",
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#cbd5e1" },
            xaxis: { title: "k" },
            yaxis: { title: "Energy" }
          }}
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />

      </div>

    </div>

  );

}
