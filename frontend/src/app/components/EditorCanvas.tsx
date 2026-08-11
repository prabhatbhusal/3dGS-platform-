import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport, Html } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'

function GaussianSplat({ position }: { position: [number, number, number] }) {
  const mesh = useRef<Mesh>(null)

  useFrame(() => {
    if (!mesh.current) return
    mesh.current.rotation.y += 0.002
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <meshStandardMaterial
        color="#8B5CF6"
        emissive="#7928CA"
        emissiveIntensity={0.65}
        roughness={0.15}
        metalness={0.4}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial color="#111827" wireframe opacity={0.18} transparent />
    </mesh>
  )
}

export default function EditorCanvas() {
  const [position, setPosition] = useState<[number, number, number]>([0, 1, 0])

  const handleMove = useCallback((axis: 'x' | 'y' | 'z', delta: number) => {
    setPosition((current) => {
      const next = [...current] as [number, number, number]
      const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
      next[idx] += delta
      return next
    })
  }, [])

  return (
    <div className="h-full rounded-3xl border border-border bg-black/80 text-white shadow-xl">
      <Canvas camera={{ position: [8, 6, 12], fov: 40 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 8, 8]} intensity={1.1} />
        <GaussianSplat position={position} />
        <GridPlane />
        <OrbitControls enablePan enableZoom enableRotate />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#f8fafc" />
        </GizmoHelper>
      </Canvas>
      <div className="p-4 space-y-3 bg-slate-950/80 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gaussian Splat position</p>
            <p className="mt-1 text-sm text-white">x {position[0].toFixed(1)} · y {position[1].toFixed(1)} · z {position[2].toFixed(1)}</p>
          </div>
          <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-900">
            live editor
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['x', 'y', 'z'].map((axis) => (
            <button
              key={axis}
              className="rounded-2xl bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 hover:bg-slate-700"
              onClick={() => handleMove(axis as 'x' | 'y' | 'z', 0.5)}
            >
              move {axis.toUpperCase()}+
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
