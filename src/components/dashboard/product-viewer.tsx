"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { AlertTriangle, Globe, Activity } from "lucide-react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  MeshPhysicalMaterial,
  TorusKnotGeometry,
  TorusGeometry,
  SphereGeometry,
  RingGeometry,
  Mesh,
  Group,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  SpotLight,
  PointLight,
  PlaneGeometry,
  ShadowMaterial,
  PCFShadowMap,
  ACESFilmicToneMapping,
  DoubleSide,
  Material,
  Color,
} from "three";

// ───────────────────────────────────────────────────────────────
//  View Presets
// ───────────────────────────────────────────────────────────────

export type ViewId = "overview" | "returns" | "distribution";

interface ViewPreset {
  label: string;
  icon: typeof Activity;
  camera: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  product: {
    rotationSpeed: number;
    bodyColor: [number, number, number];
    ringColor: [number, number, number];
    coreEmissiveIntensity: number;
    particleAmp: number;
  };
}

export const VIEW_PRESETS: Record<ViewId, ViewPreset> = {
  overview: {
    label: "Overview Analysis",
    icon: Activity,
    camera: { x: 0, y: 0.5, z: 4.5 },
    target: { x: 0, y: 0, z: 0 },
    product: {
      rotationSpeed: 0.3,
      bodyColor: [0.165, 0.165, 0.243],
      ringColor: [0.4, 0.467, 0.8],
      coreEmissiveIntensity: 0.15,
      particleAmp: 0.08,
    },
  },
  returns: {
    label: "Returns & Defect Logs",
    icon: AlertTriangle,
    camera: { x: 2.8, y: 0.8, z: 2.8 },
    target: { x: 0, y: -0.15, z: 0 },
    product: {
      rotationSpeed: 0.6,
      bodyColor: [0.31, 0.125, 0.125],
      ringColor: [0.8, 0.267, 0.267],
      coreEmissiveIntensity: 0.5,
      particleAmp: 0.15,
    },
  },
  distribution: {
    label: "Global Distribution Maps",
    icon: Globe,
    camera: { x: 0, y: 3.0, z: 6.5 },
    target: { x: 0, y: 0, z: 0 },
    product: {
      rotationSpeed: 0.15,
      bodyColor: [0.125, 0.243, 0.31],
      ringColor: [0.267, 0.667, 0.8],
      coreEmissiveIntensity: 0.4,
      particleAmp: 0.2,
    },
  },
};

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

interface SceneAssets {
  scene: Scene;
  product: Group;
  ringMesh: Mesh;
  bodyMat: MeshPhysicalMaterial;
  ringMat: MeshPhysicalMaterial;
  coreMat: MeshPhysicalMaterial;
  particles: Mesh[];
}

// ───────────────────────────────────────────────────────────────
//  Scene Builder
// ───────────────────────────────────────────────────────────────

function buildScene(): SceneAssets {
  const scene = new Scene();

  // Lighting (6‑source studio rig)
  scene.add(new AmbientLight(0x404060, 0.4));
  scene.add(new HemisphereLight(0x8ba8ff, 0x362d59, 0.6));

  const key = new DirectionalLight(0xffeedd, 2.2);
  key.position.set(5, 6, 4);
  key.castShadow = true;
  scene.add(key);

  const fill = new DirectionalLight(0xbbddff, 1.0);
  fill.position.set(-4, 1, 3);
  scene.add(fill);

  const rim = new SpotLight(0xffffff, 1.8);
  rim.position.set(-3, 4, -6);
  rim.angle = 0.5;
  rim.penumbra = 0.8;
  rim.decay = 1;
  rim.distance = 20;
  scene.add(rim);

  const accent = new PointLight(0x4488ff, 0.6);
  accent.position.set(0, -3, 1);
  scene.add(accent);

  // Product model
  const product = new Group();
  const particles: Mesh[] = [];

  // Main body
  const bodyGeo = new TorusKnotGeometry(1.0, 0.35, 140, 20);
  const bodyMat = new MeshPhysicalMaterial({
    color: 0x2a2a3e,
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    reflectivity: 1.0,
    envMapIntensity: 1.2,
  });
  const body = new Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  product.add(body);

  // Outer ring
  const ringGeo = new TorusGeometry(1.55, 0.045, 64, 80);
  const ringMat = new MeshPhysicalMaterial({
    color: 0x6677cc,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 0.5,
    transparent: true,
    opacity: 0.7,
  });
  const ringMesh = new Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.rotation.z = 0.3;
  product.add(ringMesh);

  // Inner core
  const coreGeo = new SphereGeometry(0.3, 32, 32);
  const coreMat = new MeshPhysicalMaterial({
    color: 0x4488ff,
    metalness: 0.1,
    roughness: 0.2,
    clearcoat: 0.8,
    emissive: 0x2244aa,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.9,
  });
  const core = new Mesh(coreGeo, coreMat);
  core.position.z = 0.4;
  product.add(core);

  // Accent ringlets
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const ringletGeo = new RingGeometry(0.04, 0.08, 24);
    const ringletMat = new MeshPhysicalMaterial({
      color: 0x88aaff,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.3,
      side: DoubleSide,
    });
    const ringlet = new Mesh(ringletGeo, ringletMat);
    ringlet.position.set(
      Math.cos(angle) * 1.25,
      Math.sin(angle) * 1.25 * 0.6,
      0
    );
    ringlet.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const s = 0.15 + Math.random() * 0.2;
    ringlet.scale.set(s, s, s);
    product.add(ringlet);
  }

  // Ambient particles
  const dotMat = new MeshPhysicalMaterial({
    color: 0x88aaff,
    emissive: 0x4466cc,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.1,
  });
  for (let i = 0; i < 40; i++) {
    const dotGeo = new SphereGeometry(0.025 + Math.random() * 0.03, 8, 8);
    const dot = new Mesh(dotGeo, dotMat.clone());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 1.8 + Math.random() * 0.6;
    dot.position.set(
      Math.sin(phi) * Math.cos(theta) * r,
      Math.sin(phi) * Math.sin(theta) * r,
      Math.cos(phi) * r
    );
    dot.userData.originY = dot.position.y;
    dot.userData.floatSpeed = 0.3 + Math.random() * 0.5;
    dot.userData.floatPhase = Math.random() * Math.PI * 2;
    product.add(dot);
    particles.push(dot);
  }

  scene.add(product);

  // Ground
  const groundGeo = new PlaneGeometry(8, 8);
  const groundMat = new ShadowMaterial({ opacity: 0.25, color: 0x222244 });
  const ground = new Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.6;
  ground.receiveShadow = true;
  scene.add(ground);

  return { scene, product, ringMesh, bodyMat, ringMat, coreMat, particles };
}

// ───────────────────────────────────────────────────────────────
//  View Nav Sub-Component
// ───────────────────────────────────────────────────────────────

interface ViewNavProps {
  activeView: ViewId;
  onViewChange: (id: ViewId) => void;
}

const VIEW_ENTRIES: { id: ViewId; label: string; Icon: typeof Activity }[] = [
  { id: "overview", label: "Overview Analysis", Icon: Activity },
  { id: "returns", label: "Returns & Defect Logs", Icon: AlertTriangle },
  { id: "distribution", label: "Global Distribution Maps", Icon: Globe },
];

function ViewNav({ activeView, onViewChange }: ViewNavProps) {
  return (
    <nav className="flex flex-wrap gap-1" role="tablist">
      {VIEW_ENTRIES.map(({ id, label, Icon }) => {
        const isActive = id === activeView;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              "transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
              isActive
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(/\s+/)[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ───────────────────────────────────────────────────────────────
//  ProductViewer Component
// ───────────────────────────────────────────────────────────────

interface ProductViewerProps {
  className?: string;
  activeView?: ViewId;
  onViewChange?: (id: ViewId) => void;
}

/**
 * High-end 3D product rendering workspace with GSAP-powered
 * camera view transitions.
 *
 * On view change:
 *  1. GSAP interpolates camera position + look‑at over 1.2s
 *     with power4.inOut easing
 *  2. Simultaneously tweens product materials (body/ring colour,
 *     core emissive, rotation speed, particle amplitude)
 *  3. RAF loop applies interpolated values every frame
 */
export function ProductViewer({
  className,
  activeView: activeViewProp = "overview",
  onViewChange,
}: ProductViewerProps) {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<ViewId>(activeViewProp);
  const transitionRef = useRef<((viewId: ViewId) => void) | null>(null);

  const handleViewChange = useCallback(
    (id: ViewId) => {
      setActiveView(id);
      onViewChange?.(id);
      // Trigger GSAP transition via the imperative engine ref
      transitionRef.current?.(id);
    },
    [onViewChange]
  );

  // ── Imperative Three.js engine ─────────────────────────────
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const { scene, product, ringMesh, bodyMat, ringMat, coreMat, particles } =
      buildScene();
    let lastTime = performance.now();
    let elapsed = 0;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 320;
    const height = rect.height || 280;

    const camera = new PerspectiveCamera(40, width / height, 0.1, 100);
    const initPreset = VIEW_PRESETS.overview;
    camera.position.set(
      initPreset.camera.x,
      initPreset.camera.y,
      initPreset.camera.z
    );
    camera.lookAt(initPreset.target.x, initPreset.target.y, initPreset.target.z);

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Resize Observer ────────────────────────────────────
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const w =
          entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        const h =
          entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    // ── Camera + Motion State (GSAP‑tweenable objects) ─────
    const camPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const camTarget = { x: 0, y: 0, z: 0 };
    const mState = {
      rotationSpeed: initPreset.product.rotationSpeed,
      bodyR: initPreset.product.bodyColor[0],
      bodyG: initPreset.product.bodyColor[1],
      bodyB: initPreset.product.bodyColor[2],
      ringR: initPreset.product.ringColor[0],
      ringG: initPreset.product.ringColor[1],
      ringB: initPreset.product.ringColor[2],
      coreEmissive: initPreset.product.coreEmissiveIntensity,
      particleAmp: initPreset.product.particleAmp,
    };

    const bodyColor = new Color(...initPreset.product.bodyColor);
    const ringColor = new Color(...initPreset.product.ringColor);
    bodyMat.color.copy(bodyColor);
    ringMat.color.copy(ringColor);

    // ── View Transition Engine ─────────────────────────────
    let gsapTween: gsap.core.Tween | null = null;

    function transitionToView(viewId: ViewId) {
      if (gsapTween) {
        gsapTween.kill();
        gsapTween = null;
      }
      gsap.killTweensOf(mState);

      const preset = VIEW_PRESETS[viewId];

      // Camera tween
      const camTargetObj = {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        tx: camTarget.x,
        ty: camTarget.y,
        tz: camTarget.z,
      };

      gsapTween = gsap.to(camTargetObj, {
        x: preset.camera.x,
        y: preset.camera.y,
        z: preset.camera.z,
        tx: preset.target.x,
        ty: preset.target.y,
        tz: preset.target.z,
        duration: 1.2,
        ease: "power4.inOut",
        onUpdate: () => {
          camPos.x = camTargetObj.x;
          camPos.y = camTargetObj.y;
          camPos.z = camTargetObj.z;
          camTarget.x = camTargetObj.tx;
          camTarget.y = camTargetObj.ty;
          camTarget.z = camTargetObj.tz;
        },
      });

      // Material + motion tween
      gsap.to(mState, {
        rotationSpeed: preset.product.rotationSpeed,
        bodyR: preset.product.bodyColor[0],
        bodyG: preset.product.bodyColor[1],
        bodyB: preset.product.bodyColor[2],
        ringR: preset.product.ringColor[0],
        ringG: preset.product.ringColor[1],
        ringB: preset.product.ringColor[2],
        coreEmissive: preset.product.coreEmissiveIntensity,
        particleAmp: preset.product.particleAmp,
        duration: 1.4,
        ease: "power4.inOut",
        onUpdate: () => {
          bodyColor.setRGB(mState.bodyR, mState.bodyG, mState.bodyB);
          bodyMat.color.copy(bodyColor);
          ringColor.setRGB(mState.ringR, mState.ringG, mState.ringB);
          ringMat.color.copy(ringColor);
          coreMat.emissiveIntensity = mState.coreEmissive;
        },
      });
    }

    // Expose transition function so React can call it
    transitionRef.current = transitionToView;

    // ── Apply initial view if not overview ─────────────────
    if (activeViewProp !== "overview") {
      const vp = VIEW_PRESETS[activeViewProp];
      camera.position.set(vp.camera.x, vp.camera.y, vp.camera.z);
      camera.lookAt(vp.target.x, vp.target.y, vp.target.z);
      camPos.x = vp.camera.x;
      camPos.y = vp.camera.y;
      camPos.z = vp.camera.z;
      camTarget.x = vp.target.x;
      camTarget.y = vp.target.y;
      camTarget.z = vp.target.z;
      mState.rotationSpeed = vp.product.rotationSpeed;
      mState.bodyR = vp.product.bodyColor[0];
      mState.bodyG = vp.product.bodyColor[1];
      mState.bodyB = vp.product.bodyColor[2];
      mState.ringR = vp.product.ringColor[0];
      mState.ringG = vp.product.ringColor[1];
      mState.ringB = vp.product.ringColor[2];
      mState.coreEmissive = vp.product.coreEmissiveIntensity;
      mState.particleAmp = vp.product.particleAmp;
      bodyColor.setRGB(vp.product.bodyColor[0], vp.product.bodyColor[1], vp.product.bodyColor[2]);
      bodyMat.color.copy(bodyColor);
      ringColor.setRGB(vp.product.ringColor[0], vp.product.ringColor[1], vp.product.ringColor[2]);
      ringMat.color.copy(ringColor);
      coreMat.emissiveIntensity = vp.product.coreEmissiveIntensity;
    }

    // ── Animation Loop ──────────────────────────────────────
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      elapsed += (now - lastTime) / 1000;
      lastTime = now;

      camera.position.set(camPos.x, camPos.y, camPos.z);
      camera.lookAt(camTarget.x, camTarget.y, camTarget.z);

      product.rotation.y = elapsed * mState.rotationSpeed;

      ringMesh.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.5) * 0.05;
      ringMesh.rotation.z = 0.3 + Math.sin(elapsed * 0.4) * 0.1;

      for (const ptcl of particles) {
        const originY = (ptcl.userData.originY as number) ?? 0;
        const speed = (ptcl.userData.floatSpeed as number) ?? 0.3;
        const phase = (ptcl.userData.floatPhase as number) ?? 0;
        ptcl.position.y = originY + Math.sin(elapsed * speed + phase) * mState.particleAmp;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      if (gsapTween) gsapTween.kill();
      gsap.killTweensOf(mState);
      ro.disconnect();
      transitionRef.current = null;

      scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.geometry?.dispose();
          const materials: Material[] = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          for (const mat of materials) {
            for (const key of Object.keys(mat)) {
              const value = (mat as unknown as Record<string, unknown>)[key];
              if (
                value &&
                typeof value === "object" &&
                "dispose" in (value as Record<string, unknown>)
              ) {
                const maybeDispose = (value as Record<string, unknown>).dispose;
                if (typeof maybeDispose === "function") {
                  maybeDispose();
                }
              }
            }
            mat.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      const gl = renderer.getContext();
      if (gl && typeof gl.getExtension === "function") {
        const loseCtxExt = gl.getExtension("WEBGL_lose_context");
        if (loseCtxExt) loseCtxExt.loseContext();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-h-[360px] overflow-hidden rounded-xl",
        className
      )}
      aria-label="3D Product Visualization"
    >
      {/* ── Top bar: nav + indicator ─────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <ViewNav activeView={activeView} onViewChange={handleViewChange} />

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "text-[10px] font-medium tracking-wide uppercase",
            "bg-white/60 backdrop-blur-sm dark:bg-zinc-800/60",
            "ring-1 ring-zinc-200/30 dark:ring-zinc-700/30",
            "text-zinc-500 dark:text-zinc-400"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
          {VIEW_PRESETS[activeView].label}
        </span>
      </div>

      {/* ── Three.js canvas mount point ──────────────────── */}
      <div
        ref={canvasMountRef}
        className="flex-1 w-full relative"
      />
    </div>
  );
}
