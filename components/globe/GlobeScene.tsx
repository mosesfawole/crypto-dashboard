"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useMarketStore } from "@/store/useMarketStore";
import { formatCurrency } from "@/lib/utils";
import type { ExchangeMarker } from "@/types/market";

const EXCHANGES: ExchangeMarker[] = [
  { label: "Binance", lat: 1.35, lng: 103.82, volume: 95, color: "#f0c040" },
  { label: "Coinbase", lat: 37.77, lng: -122.42, volume: 70, color: "#4d9fff" },
  { label: "Kraken", lat: 47.61, lng: -122.33, volume: 45, color: "#a78bfa" },
  { label: "Bybit", lat: 22.32, lng: 114.17, volume: 65, color: "#00d4aa" },
  { label: "OKX", lat: 39.9, lng: 116.41, volume: 60, color: "#00eacc" },
  { label: "Upbit", lat: 37.57, lng: 126.98, volume: 40, color: "#ff4d6d" },
  { label: "Bitfinex", lat: 51.51, lng: -0.13, volume: 30, color: "#a78bfa" },
];

const EXCHANGE_PAIRS: Record<string, string[]> = {
  Binance: ["BTC", "ETH", "SOL", "BNB", "XRP"],
  Coinbase: ["BTC", "ETH", "SOL", "DOGE", "AVAX"],
  Kraken: ["BTC", "ETH", "ADA", "DOT", "XRP"],
  Bybit: ["BTC", "ETH", "SOL", "DOGE", "LINK"],
  OKX: ["BTC", "ETH", "BNB", "SOL", "ATOM"],
  Upbit: ["BTC", "ETH", "XRP", "ADA", "DOGE"],
  Bitfinex: ["BTC", "ETH", "XRP", "LTC", "DOT"],
};

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

interface PopupState {
  exchange: ExchangeMarker;
  x: number;
  y: number;
}

export default function GlobeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const { coins, livePrices } = useMarketStore();

  const getExchangeData = (exchange: ExchangeMarker) => {
    return (EXCHANGE_PAIRS[exchange.label] ?? []).map((symbol) => {
      const coin = coins.find(
        (c) => c.symbol.toLowerCase() === symbol.toLowerCase(),
      );
      const live = livePrices[`${symbol.toUpperCase()}USDT`];
      const price = live?.price ?? coin?.current_price ?? 0;
      const change =
        live?.priceChangePercent ?? coin?.price_change_percentage_24h ?? 0;
      return { symbol, price, change };
    });
  };

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 2.8;

    // ── Globe ─────────────────────────────────────────────────────────────
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x0a0a3f,
        shininess: 20,
        specular: 0x4444aa,
      }),
    );
    scene.add(globe);

    // Grid lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const rr = Math.cos((lat * Math.PI) / 180);
      const yy = Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let lng2 = 0; lng2 <= 360; lng2 += 3) {
        const rad = (lng2 * Math.PI) / 180;
        pts.push(new THREE.Vector3(rr * Math.cos(rad), yy, rr * Math.sin(rad)));
      }
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: 0x1a1a5a,
            transparent: true,
            opacity: 0.5,
          }),
        ),
      );
    }
    for (let lng2 = 0; lng2 < 360; lng2 += 30) {
      const pts: THREE.Vector3[] = [];
      for (let lat2 = -90; lat2 <= 90; lat2 += 3)
        pts.push(latLngToVec3(lat2, lng2, 1.001));
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: 0x1a1a5a,
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
    }

    // ── Exchange dots ─────────────────────────────────────────────────────
    const dotMeshes: THREE.Mesh[] = [];
    const pulseRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];

    EXCHANGES.forEach((ex, idx) => {
      const pos = latLngToVec3(ex.lat, ex.lng, 1.02);
      const dotSize = (ex.volume / 100) * 0.022 + 0.01;
      const col = new THREE.Color(ex.color);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(dotSize, 12, 12),
        new THREE.MeshBasicMaterial({ color: col }),
      );
      dot.position.copy(pos);
      dot.userData = { exchangeIndex: idx };
      scene.add(dot);
      dotMeshes.push(dot);

      const ringMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(dotSize * 1.5, dotSize * 2.5, 20),
        ringMat,
      );
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(ring);
      pulseRings.push({ mesh: ring, mat: ringMat });
    });

    // Glow halo
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.12, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x0a1540,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        }),
      ),
    );

    // ── Lighting ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x4466bb, 4));
    const sun = new THREE.DirectionalLight(0x6699ff, 3);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // ── Input state ───────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevX = 0,
      prevY = 0,
      rotX = 0,
      rotY = 0;

    const getNDC = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      setPopup(null);
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        rotY += (e.clientX - prevX) * 0.005;
        rotX = Math.max(
          -1.2,
          Math.min(1.2, rotX + (e.clientY - prevY) * 0.003),
        );
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        getNDC(e);
        raycaster.setFromCamera(mouse, camera);
        el.style.cursor =
          raycaster.intersectObjects(dotMeshes).length > 0 ? "pointer" : "grab";
      }
    };

    const onClick = (e: MouseEvent) => {
      getNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(dotMeshes);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.exchangeIndex as number;
        const rect = el.getBoundingClientRect();
        setPopup({
          exchange: EXCHANGES[idx],
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setPopup(null);
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("click", onClick);
    window.addEventListener("mouseup", onMouseUp);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      setContainerWidth(el.clientWidth);
    };
    window.addEventListener("resize", onResize);
    setContainerWidth(el.clientWidth);

    // ── Animation loop ────────────────────────────────────────────────────
    let frame = 0;
    let t = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.016;
      if (!isDragging) rotY += 0.003;

      const euler = new THREE.Euler(rotX, rotY, 0);
      globe.rotation.copy(euler);
      dotMeshes.forEach((d) => d.rotation.copy(euler));
      pulseRings.forEach(({ mesh, mat }, i) => {
        mesh.rotation.copy(euler);
        mat.opacity = 0.3 + 0.3 * Math.sin(t * 2 + i * 1.2);
      });
      scene.children.forEach((c) => {
        if (c instanceof THREE.Line) c.rotation.copy(euler);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("click", onClick);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-brand-blue" />
          <h2 className="text-xs font-display font-bold tracking-widest uppercase text-white">
            Global Exchange Activity
          </h2>
        </div>
        <p className="text-xs text-brand-muted">Click a dot to explore</p>
      </div>

      {/* Canvas + popup */}
      <div className="relative">
        <div ref={mountRef} className="w-full" style={{ height: "320px" }} />

        {popup && (
          <div
            className="absolute z-20 rounded-xl overflow-hidden animate-fade-in pointer-events-none"
            style={{
              left: Math.min(popup.x + 12, containerWidth - 240),
              top: Math.max(popup.y - 20, 8),
              minWidth: "220px",
              background: "#0e0e1c",
              border: `1px solid ${popup.exchange.color}44`,
              boxShadow: `0 0 24px ${popup.exchange.color}22`,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{
                borderBottom: `1px solid ${popup.exchange.color}33`,
                background: `${popup.exchange.color}0d`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: popup.exchange.color }}
                />
                <span className="text-xs font-display font-bold text-white">
                  {popup.exchange.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] text-brand-green font-mono">
                  LIVE
                </span>
              </div>
            </div>

            {/* Volume bar */}
            <div className="px-4 py-2 border-b border-surface-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-brand-muted">
                  Relative Volume
                </span>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: popup.exchange.color }}
                >
                  {popup.exchange.volume}%
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "#1e1e38" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${popup.exchange.volume}%`,
                    background: popup.exchange.color,
                  }}
                />
              </div>
            </div>

            {/* Top pairs */}
            <div className="px-4 py-3">
              <p className="text-[10px] text-brand-muted mb-2 tracking-wider uppercase">
                Top Pairs
              </p>
              <div className="space-y-2">
                {getExchangeData(popup.exchange).map(
                  ({ symbol, price, change }) => {
                    const isUp = change >= 0;
                    return (
                      <div
                        key={symbol}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] font-mono font-bold text-white">
                          {symbol}/USDT
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-white">
                            {price > 0 ? formatCurrency(price) : "—"}
                          </span>
                          <span
                            className="text-[10px] font-mono px-1 rounded"
                            style={{
                              color: isUp ? "#00d4aa" : "#ff4d6d",
                              background: isUp
                                ? "rgba(0,212,170,0.1)"
                                : "rgba(255,77,109,0.1)",
                            }}
                          >
                            {change !== 0
                              ? `${isUp ? "+" : ""}${change.toFixed(2)}%`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap px-4 py-3 border-t border-surface-border"
        style={{ background: "#0a0a18", gap: "16px" }}
      >
        {EXCHANGES.map((ex) => (
          <div
            key={ex.label}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span
              className="animate-pulse"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: ex.color,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#5a5a8a",
                fontFamily: "monospace",
              }}
            >
              {ex.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
