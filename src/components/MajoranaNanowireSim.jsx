import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Plot from "react-plotly.js";

const N = 80;

function computeWavefunction(mu) {
  const psi = [];
  const topo = Math.abs(mu) < 2;

  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);

    if (topo) {
      const left = Math.exp(-12 * x);
      const right = Math.exp(-12 * (1 - x));
      psi.push(left + right);
    } else {
      psi.push(0.1 * Math.sin(10 * x));
    }
  }

  return { psi, topo };
}

function Nanowire({ psi, topo }) {
  const ref = useRef();

  const geometry = useMemo(() => {
    const positions = [];
    const colors = [];

    for (let i = 0; i < N; i++) {
      const x = (i / N - 0.5) * 8;
      const y = psi[i] * 1.5;

      positions.push(x, y, 0);

      const glow = topo ? psi[i] * 3 : psi[i];
      colors.push(0.0, glow, glow + 0.4);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    return geo;
  }, [psi, topo]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,

      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          gl_PointSize = 6.0;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec3 vColor;

        void main() {

          float r = length(gl_PointCoord - vec2(0.5));
          float glow = 1.0 - r * 2.0;

          gl_FragColor = vec4(vColor * glow, 1.0);

        }
      `,
    });
  }, []);

  return <points ref={ref} geometry={geometry} material={material} />;
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

          <Canvas camera={{ position: [0, 2, 7] }}>

            <color attach="background" args={["black"]} />

            <ambientLight intensity={0.8} />

            <Nanowire psi={psi} topo={topo} />

            <OrbitControls />

            <EffectComposer>
              <Bloom intensity={2} />
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

          <div
            className={`p-4 rounded-lg ${
              topo ? "bg-cyan-900/40" : "bg-red-900/40"
            }`}
          >
            <b>Phase:</b>{" "}
            {topo ? "Topological (Majorana modes)" : "Trivial"}
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
              name: "E(k)",
            },
            {
              x: k,
              y: spectrum.map((v) => -v),
              mode: "lines",
              line: { color: "#f43f5e", width: 3 },
              name: "-E(k)",
            },
          ]}

          layout={{
            title: "BdG Spectrum",
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#cbd5e1" },
            xaxis: { title: "k" },
            yaxis: { title: "Energy" },
          }}

          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </div>

    </div>
  );
}
