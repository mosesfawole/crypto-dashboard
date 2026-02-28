"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ExchangeMarker } from "@/types/market";

const EXCHANGES: ExchangeMarker[] = [
  { label: "Binance", lat: 1.35, lng: 103.82, volume: 95, color: "#f0c040" },
  { label: "Coinbase", lat: 37.77, lng: -122.42, volume: 70, color: "#4d9fff" },
  { label: "Kraken", lat: 47.61, lng: -122.33, volume: 45, color: "#a78bfa" },
  { label: "Bybit", lat: 22.32, lng: 114.17, volume: 65, color: "#00d4aa" },
  { label: "OKX", lat: 39.9, lng: 116.41, volume: 60, color: "#00d4aa" },
  { label: "Upbit", lat: 37.57, lng: 126.98, volume: 40, color: "#ff4d6d" },
  { label: "Bitfinex", lat: 51.51, lng: -0.13, volume: 30, color: "#a78bfa" },
];

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export default function GlobeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // ── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 2.8;

    // ── Globe sphere ─────────────────────────────────────────────────────────
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x050514,
      shininess: 5,
      specular: 0x222244,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Latitude grid lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let lng = 0; lng <= 360; lng += 3) {
        const rad = (lng * Math.PI) / 180;
        pts.push(new THREE.Vector3(r * Math.cos(rad), y, r * Math.sin(rad)));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: 0x1a1a3a,
            transparent: true,
            opacity: 0.6,
          }),
        ),
      );
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 3) {
        pts.push(latLngToVec3(lat, lng, 1.001));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: 0x1a1a3a,
            transparent: true,
            opacity: 0.4,
          }),
        ),
      );
    }

    // ── Exchange markers ─────────────────────────────────────────────────────
    const pulseRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];

    EXCHANGES.forEach(({ lat, lng, volume, color }) => {
      const pos = latLngToVec3(lat, lng, 1.02);
      const dotSize = (volume / 100) * 0.022 + 0.007;
      const col = new THREE.Color(color);

      // Dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(dotSize, 10, 10),
        new THREE.MeshBasicMaterial({ color: col }),
      );
      dot.position.copy(pos);
      scene.add(dot);

      // Pulse ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(dotSize * 1.4, dotSize * 2.2, 20),
        ringMat,
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(ring);
      pulseRings.push({ mesh: ring, mat: ringMat });
    });

    // ── Glow halo ─────────────────────────────────────────────────────────────
    const halMat = new THREE.MeshBasicMaterial({
      color: 0x0a2040,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 32, 32), halMat));

    // ── Lighting ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x223355, 3));
    const sun = new THREE.DirectionalLight(0x4488ff, 2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x00d4aa, 0.4);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // ── Mouse drag ────────────────────────────────────────────────────────────
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotX = 0;
    let rotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.005;
      rotX += (e.clientY - prevY) * 0.003;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let frame: number;
    let t = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.016;

      // Auto-rotate if not dragging
      if (!isDragging) rotY += 0.003;

      globe.rotation.y = rotY;
      globe.rotation.x = rotX;

      // Sync all children (markers) with globe rotation
      scene.children.forEach((child) => {
        if (child !== globe) {
          child.rotation.y = rotY;
          child.rotation.x = rotX;
        }
      });

      // Pulse rings
      pulseRings.forEach(({ mat }, i) => {
        mat.opacity = 0.3 + 0.3 * Math.sin(t * 2 + i * 1.5);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-border shrink-0">
        <p className="text-xs tracking-widest uppercase text-brand-muted font-display">
          Global Activity
        </p>
        <p className="text-sm text-white mt-0.5 font-semibold">
          Exchange Volume Map
        </p>
      </div>

      {/* Canvas */}
      <div
        ref={mountRef}
        className="flex-1 cursor-grab active:cursor-grabbing"
        style={{ minHeight: 0 }}
      />

      {/* Exchange list */}
      <div className="p-4 border-t border-surface-border space-y-2 shrink-0">
        {EXCHANGES.map((ex) => (
          <div
            key={ex.label}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ex.color }}
              />
              <span className="text-brand-muted">{ex.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs text-brand-green">Live</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
