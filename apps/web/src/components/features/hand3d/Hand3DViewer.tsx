"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

function HandModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { camera, invalidate } = useThree();

  useEffect(() => {
    // Simplify materials to reduce GPU load
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Downgrade to basic material if PBR is too heavy
        const oldMat = child.material as THREE.MeshStandardMaterial;
        if (oldMat.map) {
          // Keep diffuse texture but reduce resolution
          oldMat.map.minFilter = THREE.LinearFilter;
          oldMat.map.generateMipmaps = false;
        }
        // Disable expensive PBR features
        oldMat.envMapIntensity = 0;
        oldMat.roughness = 0.8;
        oldMat.metalness = 0.1;
        if (oldMat.normalMap) oldMat.normalMap = null;
        if (oldMat.aoMap) oldMat.aoMap = null;
        if (oldMat.roughnessMap) oldMat.roughnessMap = null;
        if (oldMat.metalnessMap) oldMat.metalnessMap = null;
        oldMat.needsUpdate = true;
      }
    });

    // Auto-fit camera
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    camera.position.set(center.x, center.y + maxDim * 0.2, center.z + maxDim * 2.2);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    invalidate();
  }, [scene, camera, invalidate]);

  return <primitive object={scene} />;
}

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

interface Hand3DViewerProps {
  modelUrl: string;
  height?: string;
}

export default function Hand3DViewer({ modelUrl, height = "h-72" }: Hand3DViewerProps) {
  const [crashed, setCrashed] = useState(false);

  if (crashed) {
    return (
      <div className={`relative w-full ${height} rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center`}>
        <p className="text-white/50 text-sm mb-2">⚠️ GPU quá tải</p>
        <button
          onClick={() => setCrashed(false)}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary/80 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        dpr={1}
        gl={{
          antialias: false,
          powerPreference: "low-power",
          depth: true,
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.getContext().canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setCrashed(true);
          });
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[3, 4, 5]} intensity={0.8} />

        <Suspense fallback={<LoadingSpinner />}>
          <Center>
            <HandModel url={modelUrl} />
          </Center>
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={0.3}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] text-white/60 backdrop-blur-sm">
        🖱️ Kéo để xoay • Cuộn để zoom
      </div>
    </div>
  );
}
