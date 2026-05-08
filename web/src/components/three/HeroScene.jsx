"use client";
import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  PerspectiveCamera,
  Stars,
  RoundedBox,
  Html,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

function Laptop({ scrollProgress }) {
  const laptopRef = useRef();
  const screenRef = useRef();
  const lidRef = useRef();

  useFrame((state) => {
    if (!laptopRef.current) return;
    const t = state.clock.getElapsedTime();
    laptopRef.current.rotation.y = Math.sin(t * 0.4) * 0.18;
    laptopRef.current.rotation.x = Math.cos(t * 0.3) * 0.04;
    laptopRef.current.position.y = Math.sin(t * 0.6) * 0.08;
    if (lidRef.current) {
      const sp = scrollProgress?.current ?? 0;
      lidRef.current.rotation.x = -Math.PI / 2.05 + sp * 0.25;
    }
  });

  return (
    <group ref={laptopRef} position={[0, -0.4, 0]} scale={1.15}>
      <RoundedBox args={[3.6, 0.12, 2.4]} radius={0.05} smoothness={6}>
        <meshPhysicalMaterial
          color="#0d0d10"
          metalness={0.95}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </RoundedBox>

      <mesh position={[0, 0.07, 0]}>
        <ringGeometry args={[0.18, 0.22, 64]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.35} />
      </mesh>

      <group ref={lidRef} position={[0, 0.06, -1.18]}>
        <RoundedBox
          args={[3.6, 2.2, 0.08]}
          radius={0.04}
          smoothness={6}
          position={[0, 1.1, 0]}
        >
          <meshPhysicalMaterial
            color="#0a0a0d"
            metalness={0.9}
            roughness={0.25}
            clearcoat={1}
          />
        </RoundedBox>

        <mesh position={[0, 1.1, 0.045]}>
          <planeGeometry args={[3.42, 2.02]} />
          <meshBasicMaterial color="#05070d" />
        </mesh>

        <mesh ref={screenRef} position={[0, 1.1, 0.046]}>
          <planeGeometry args={[3.42, 2.02]} />
          <ScreenMaterial />
        </mesh>

        <mesh position={[0, 1.1, 0.05]}>
          <planeGeometry args={[3.42, 2.02]} />
          <meshBasicMaterial transparent opacity={0.05} color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function ScreenMaterial() {
  const materialRef = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#0ea5e9") },
      uColorB: { value: new THREE.Color("#22c55e") },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;

        float grid(vec2 uv, float scale) {
          vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
          float line = min(g.x, g.y);
          return 1.0 - min(line, 1.0);
        }

        void main() {
          vec2 uv = vUv;
          float wave = sin((uv.x + uTime * 0.08) * 6.28) * 0.05;
          float gridA = grid(uv + vec2(uTime * 0.02, wave), 18.0) * 0.35;
          float gradient = smoothstep(0.0, 1.0, uv.y + sin(uTime * 0.4) * 0.1);
          vec3 base = mix(uColorA * 0.15, uColorB * 0.18, gradient);
          base += vec3(gridA) * mix(uColorA, uColorB, uv.y) * 0.6;

          // dashboard highlights
          float card = step(0.08, uv.x) * step(uv.x, 0.35) * step(0.62, uv.y) * step(uv.y, 0.88);
          base += card * vec3(0.04, 0.18, 0.10);

          float bar = step(0.55, uv.x) * step(uv.x, 0.92) * step(0.62, uv.y) * step(uv.y, 0.66);
          base += bar * vec3(0.06, 0.10, 0.22);

          float chart = step(0.55, uv.x) * step(uv.x, 0.92) * step(0.18, uv.y) * step(uv.y, 0.55);
          float wavey = sin(uv.x * 30.0 + uTime) * 0.5 + 0.5;
          base += chart * vec3(wavey * 0.05, wavey * 0.12, wavey * 0.06);

          gl_FragColor = vec4(base + 0.02, 1.0);
        }
      `}
    />
  );
}

function FloatingCard({ position, color = "#22c55e", label, value }) {
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={position}>
        <RoundedBox args={[1.4, 0.78, 0.08]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#0a0a0e"
            metalness={0.4}
            roughness={0.4}
            transparent
            opacity={0.92}
            emissive={color}
            emissiveIntensity={0.05}
          />
        </RoundedBox>
        <Html
          transform
          distanceFactor={4}
          position={[0, 0, 0.05]}
          style={{ pointerEvents: "none" }}
        >
          <div className="w-[260px] p-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 12px ${color}` }}
              />
              <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-medium">
                {label}
              </span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function CameraRig({ scrollProgress }) {
  const cameraRef = useRef();
  useFrame((state) => {
    if (!cameraRef.current) return;
    const sp = scrollProgress?.current ?? 0;
    const x = state.mouse.x * 0.4;
    const y = state.mouse.y * 0.2;
    cameraRef.current.position.x +=
      (x - cameraRef.current.position.x) * 0.04;
    cameraRef.current.position.y +=
      (y + 0.2 - cameraRef.current.position.y) * 0.04;
    const targetZ = 6 - sp * 1.2;
    cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.05;
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.2, 6]} fov={42} />
  );
}

export default function HeroScene({ scrollProgress }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <CameraRig scrollProgress={scrollProgress} />
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 6, 14]} />

        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-3, 2, 2]} intensity={20} color="#3b82f6" distance={10} />
        <pointLight position={[3, -2, 2]} intensity={20} color="#22c55e" distance={10} />
        <spotLight
          position={[0, 6, 4]}
          intensity={1.2}
          angle={0.6}
          penumbra={0.8}
          color="#ffffff"
        />

        <Stars
          radius={50}
          depth={30}
          count={1500}
          factor={3}
          saturation={0}
          fade
          speed={0.6}
        />

        <Sparkles
          count={80}
          size={2}
          speed={0.3}
          opacity={0.5}
          color="#4ade80"
          scale={[10, 6, 6]}
        />

        <Laptop scrollProgress={scrollProgress} />

        <FloatingCard
          position={[-3.2, 1.6, 0.6]}
          color="#22c55e"
          label="Applications Today"
          value="42"
        />
        <FloatingCard
          position={[3.2, 1.2, 0.4]}
          color="#3b82f6"
          label="Interview Rate"
          value="38%"
        />
        <FloatingCard
          position={[-3.6, -1.1, -0.2]}
          color="#a855f7"
          label="Active Assistants"
          value="3"
        />

        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
