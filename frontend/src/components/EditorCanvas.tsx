import { useCallback, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import type { Mesh } from 'three'

function GaussianSplat({ position }: { position: [number, number, number] }) {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    if (!mesh.current) return
    mesh.current.rotation.y += 0.003
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <meshStandardMaterial
        color="#8B5CF6"
        emissive="#7C3AED"
        emissiveIntensity={0.7}
        roughness={0.15}
        metalness={0.45}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}> 
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial color="#111827" wireframe opacity={0.16} transparent />
    </mesh>
  )
}

export default function EditorCanvas() {
  const [position, setPosition] = useState<[number, number, number]>([0, 1, 0])

  const moveAxis = useCallback((axis: 'x' | 'y' | 'z', delta: number) => {
    setPosition((current) => {
      const next = [...current] as [number, number, number]
      const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
      next[index] += delta
      return next
    })
  }, [])

  return (
    <div className="h-[720px] rounded-[32px] border border-slate-800 bg-slate-950/90 shadow-2xl shadow-slate-950/20">
      <Canvas camera={{ position: [8, 6, 12], fov: 42 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 10, 5]} intensity={1.1} />
        <GaussianSplat position={position} />
        <GridPlane />
        <OrbitControls enablePan enableZoom enableRotate />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} labelColor="#f8fafc" />
        </GizmoHelper>
      </Canvas>
      <div className="border-t border-slate-800 bg-slate-950/90 p-4 text-slate-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gaussian splat controls</p>
            <p className="mt-2 text-sm text-white">Position: x {position[0].toFixed(1)}, y {position[1].toFixed(1)}, z {position[2].toFixed(1)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['x', 'y', 'z'].map((axis) => (
              <button
                key={axis}
                type="button"
                className="rounded-2xl bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-slate-700"
                onClick={() => moveAxis(axis as 'x' | 'y' | 'z', 0.5)}
              >
                Move {axis.toUpperCase()}+
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
