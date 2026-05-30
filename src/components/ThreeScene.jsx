"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeScene({ type = "hero" }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesCount = type === "hero" ? 2000 : 1000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: type === "hero" ? "#4ade80" : "#3b82f6",
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Hero Object (Laptop Placeholder / Abstract Cube)
    let mainObject;
    if (type === "hero") {
      const geometry = new THREE.BoxGeometry(2, 1.2, 0.1);
      const material = new THREE.MeshPhysicalMaterial({
        color: "#1a1a1a",
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        emissive: "#4ade80",
        emissiveIntensity: 0.2,
      });
      mainObject = new THREE.Mesh(geometry, material);

      // Screen
      const screenGeometry = new THREE.PlaneGeometry(1.9, 1.1);
      const screenMaterial = new THREE.MeshBasicMaterial({ color: "#111" });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.051;
      mainObject.add(screen);

      scene.add(mainObject);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x4ade80, 2);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    camera.position.z = 5;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      if (mainObject) {
        mainObject.rotation.y += 0.005;
        mainObject.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [type]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 -z-10" />
  );
}
