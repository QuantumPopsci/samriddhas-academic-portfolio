import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const N = 8;
const spacing = 0.9;

/* --- simple Majorana-like localization profile --- */
function computeWavefunction(mu) {
const psi = [];

for (let i = 0; i < N; i++) {
const x = i / (N - 1);

```
if (Math.abs(mu) < 2) {
  const left = Math.exp(-5 * x);
  const right = Math.exp(-5 * (1 - x));
  psi.push(left + right);
} else {
  psi.push(0.3 * Math.sin(Math.PI * x));
}
```

}

return psi;
}

/* --- chain visualization --- */
function Chain({ psi }) {
const curvePoints = [];
const areaVerts = [];

psi.forEach((amp, i) => {
const x = (i - N / 2) * spacing;
const y = amp * 1.6;

```
curvePoints.push(new THREE.Vector3(x, y, 0));

areaVerts.push(x, 0, 0);
areaVerts.push(x, y, 0);
```

});

const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);

const areaGeom = new THREE.BufferGeometry();
areaGeom.setAttribute(
"position",
new THREE.Float32BufferAttribute(areaVerts, 3)
);

return ( <group>
{/* lattice sites */}
{psi.map((_, i) => {
const x = (i - N / 2) * spacing;

```
    return (
      <mesh key={i} position={[x, 0, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.6}
        />
      </mesh>
    );
  })}

  {/* bonds */}
  {Array.from({ length: N - 1 }).map((_, i) => {
    const x1 = (i - N / 2) * spacing;
    const x2 = (i + 1 - N / 2) * spacing;

    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, 0, 0),
      new THREE.Vector3(x2, 0, 0),
    ]);

    return (
      <line key={i} geometry={geo}>
        <lineBasicMaterial color="#334155" />
      </line>
    );
  })}

  {/* probability density fill */}
  <mesh geometry={areaGeom}>
    <meshBasicMaterial
      color="#c084fc"
      transparent
      opacity={0.45}
      side={THREE.DoubleSide}
    />
  </mesh>

  {/* wavefunction curve */}
  <line geometry={curveGeom}>
    <lineBasicMaterial color="#d946ef" />
  </line>
</group>
```

);
}

/* --- main component --- */
export default function MajoranaNanowireSim() {
const [mu, setMu] = useState(0);

const psi = useMemo(() => computeWavefunction(mu), [mu]);

const topo = Math.abs(mu) < 2;

return ( <div className="simulation-card">

```
  <h3 className="text-2xl font-bold mb-4">
    Kitaev Chain Majorana Simulator
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* 3D visualization */}
    <div className="md:col-span-2 h-[420px] rounded-lg overflow-hidden">

      <Canvas camera={{ position: [0, 2, 6] }}>

        <color attach="background" args={["black"]} />

        <ambientLight intensity={1.5} />
        <pointLight position={[0, 3, 5]} intensity={3} />

        <Chain psi={psi} />

        <OrbitControls enablePan={false} />

        <EffectComposer>
          <Bloom
            intensity={4}
            luminanceThreshold={0}
            luminanceSmoothing={0.8}
          />
        </EffectComposer>

      </Canvas>

    </div>

    {/* controls */}
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

      <div
        className={`p-4 rounded-lg ${
          topo ? "bg-purple-900/40" : "bg-red-900/40"
        }`}
      >
        <b>Phase:</b> {topo ? "Topological (Majorana)" : "Trivial"}
      </div>

    </div>

  </div>

</div>
```

);
}
