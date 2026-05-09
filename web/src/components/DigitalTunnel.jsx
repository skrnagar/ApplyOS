"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useScroll, useTransform } from "motion/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function DigitalTunnel() {
  const containerRef = useRef();
  const sectionRef = useRef();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const tunnelScale = useTransform(scrollYProgress, [0, 1], [1, 2]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Tunnel geometry
    const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 32, 10, true);
    const tunnelMaterial = new THREE.MeshPhongMaterial({
      color: "#4ade80",
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    // Floating Resumes (Planes)
    const resumeCount = 20;
    const resumes = [];
    for (let i = 0; i < resumeCount; i++) {
      const geometry = new THREE.PlaneGeometry(0.5, 0.7);
      const material = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        Math.random() * -50,
      );
      mesh.rotation.z = Math.random() * Math.PI;
      scene.add(mesh);
      resumes.push({ mesh, speed: Math.random() * 0.1 + 0.05 });
    }

    const light = new THREE.PointLight(0x4ade80, 5, 100);
    light.position.set(0, 0, 5);
    scene.add(light);

    camera.position.z = 5;
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    timeline.to(camera.position, { z: 1.2, duration: 1 });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      tunnel.rotation.y += 0.005;

      resumes.forEach((r) => {
        r.mesh.position.z += r.speed;
        if (r.mesh.position.z > 5) {
          r.mesh.position.z = -50;
        }
        r.mesh.rotation.y += 0.01;
      });

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
      renderer.dispose();
      timeline.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="h-[200vh] bg-black relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          ref={containerRef}
          style={{ scale: tunnelScale }}
          className="w-full h-full"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-bold text-white text-center mb-8 max-w-4xl"
          >
            Unstoppable <br />
            <span className="text-green-400">Application Momentum</span>
          </motion.h2>
          <p className="text-xl text-neutral-500 max-w-xl text-center">
            Our AI engine never sleeps, sending optimized applications while you
            dream about your first day.
          </p>
        </div>
      </div>
    </section>
  );
}
