"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── module-level helpers ─────────────────────────────────────────────────────

function canvasTex(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w: number,
  h: number,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

function srgb<T extends THREE.CanvasTexture>(tex: T): T {
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundedBoxGeo(w: number, h: number, d: number, r: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const [x, y] = [-w / 2, -h / 2];
  shape.moveTo(x, y + r);
  shape.lineTo(x, y + h - r);
  shape.quadraticCurveTo(x, y + h, x + r, y + h);
  shape.lineTo(x + w - r, y + h);
  shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  shape.lineTo(x + w, y + r);
  shape.quadraticCurveTo(x + w, y, x + w - r, y);
  shape.lineTo(x + r, y);
  shape.quadraticCurveTo(x, y, x, y + r);
  const bevel = Math.min(r * 0.35, d * 0.22);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

function latheGeo(pts: [number, number][], flatten?: number): THREE.LatheGeometry {
  const geo = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 14);
  geo.rotateZ(Math.PI / 2);
  if (flatten != null) geo.scale(1, 1, flatten);
  geo.computeVertexNormals();
  return geo;
}

function ridgeH(x: number, z: number, amp: number, fx: number, ph: number, ga = 0): number {
  const main =
    amp *
    (Math.sin(x * fx + ph) * 0.62 +
      Math.sin(x * fx * 0.5 + z * 2.6 + ph * 1.4) * 0.38);
  if (!ga) return main;
  return (
    main +
    ga *
      (Math.sin(x * 23 + z * 17.3 + ph * 3.1) * 0.5 +
        Math.sin(x * 16.7 - z * 24.4 - ph * 2.2) * 0.35 +
        Math.sin(x * 31.2 + z * 9.8 + ph * 1.6) * 0.15)
  );
}

function easeIO(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface SlabInfo {
  group: THREE.Group;
  heights: number[][];
  nx: number;
  nz: number;
  width: number;
  depth: number;
}

function buildRidgedSlab(
  width: number,
  depth: number,
  thickness: number,
  segX: number,
  segZ: number,
  amp: number,
  freqX: number,
  phase: number,
  mat: THREE.Material,
  grainAmp = 0,
): SlabInfo {
  const g = new THREE.Group();
  const nx = segX + 1, nz = segZ + 1;
  const heights: number[][] = [];
  for (let i = 0; i < nx; i++) {
    const xv = -width / 2 + width * (i / segX);
    const row: number[] = [];
    for (let j = 0; j < nz; j++) {
      row.push(ridgeH(xv, -depth / 2 + depth * (j / segZ), amp, freqX, phase, grainAmp));
    }
    heights.push(row);
  }

  function makeSurf(flip: boolean) {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i < nx; i++) {
      const xv = -width / 2 + width * (i / segX);
      for (let j = 0; j < nz; j++) {
        const y = flip ? heights[i][j] - thickness : heights[i][j];
        pos.push(xv, y, -depth / 2 + depth * (j / segZ));
        uv.push(i / segX, j / segZ);
      }
    }
    for (let i = 0; i < segX; i++) {
      for (let j = 0; j < segZ; j++) {
        const a = i * nz + j, b = (i + 1) * nz + j;
        const c = (i + 1) * nz + j + 1, d = i * nz + j + 1;
        if (!flip) idx.push(a, b, d, b, c, d);
        else idx.push(a, d, b, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setIndex(idx);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  g.add(makeSurf(false));
  g.add(makeSurf(true));

  function skirtX(zIdx: number, zVal: number, flip: boolean) {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i < nx; i++) {
      pos.push(-width / 2 + width * (i / segX), heights[i][zIdx], zVal);
      uv.push(i / segX, 0);
    }
    for (let i = 0; i < nx; i++) {
      pos.push(-width / 2 + width * (i / segX), heights[i][zIdx] - thickness, zVal);
      uv.push(i / segX, 1);
    }
    for (let i = 0; i < segX; i++) {
      const aT = i, bT = i + 1, aB = nx + i, bB = nx + i + 1;
      if (!flip) idx.push(aT, bT, aB, bT, bB, aB);
      else idx.push(aT, aB, bT, bT, aB, bB);
    }
    const geo = new THREE.BufferGeometry();
    geo.setIndex(idx);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function skirtZ(xIdx: number, xVal: number, flip: boolean) {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j < nz; j++) {
      pos.push(xVal, heights[xIdx][j], -depth / 2 + depth * (j / segZ));
      uv.push(j / segZ, 0);
    }
    for (let j = 0; j < nz; j++) {
      pos.push(xVal, heights[xIdx][j] - thickness, -depth / 2 + depth * (j / segZ));
      uv.push(j / segZ, 1);
    }
    for (let j = 0; j < segZ; j++) {
      const aT = j, bT = j + 1, aB = nz + j, bB = nz + j + 1;
      if (!flip) idx.push(aT, bT, aB, bT, bB, aB);
      else idx.push(aT, aB, bT, bT, aB, bB);
    }
    const geo = new THREE.BufferGeometry();
    geo.setIndex(idx);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  g.add(skirtX(0, -depth / 2, true));
  g.add(skirtX(segZ, depth / 2, false));
  g.add(skirtZ(0, -width / 2, false));
  g.add(skirtZ(segX, width / 2, true));

  return { group: g, heights, nx, nz, width, depth };
}

const DRIP_GEO = latheGeo(
  [[0.0, 0.05], [0.03, 0.045], [0.033, 0.0], [0.026, -0.04], [0.016, -0.075], [0.007, -0.1], [0.0, -0.11]],
  1.0,
);

function addDrips(
  mat: THREE.Material,
  slab: SlabInfo,
  count: number,
  thickness: number,
  scale: [number, number],
): THREE.Group {
  const g = new THREE.Group();
  for (let k = 0; k < count; k++) {
    const i = 1 + Math.floor(Math.random() * (slab.nx - 2));
    const zEdge = Math.random() < 0.5 ? 0 : slab.nz - 1;
    const x = -slab.width / 2 + slab.width * (i / (slab.nx - 1));
    const z = zEdge === 0 ? -slab.depth / 2 : slab.depth / 2;
    const m = new THREE.Mesh(DRIP_GEO, mat);
    m.castShadow = true;
    m.position.set(x, -thickness, z);
    const s = scale[0] + Math.random() * (scale[1] - scale[0]);
    m.scale.set(s * 0.8, s * 1.3, s * 0.8);
    m.rotation.y = Math.random() * Math.PI * 2;
    g.add(m);
  }
  return g;
}

// ─── component ────────────────────────────────────────────────────────────────

interface LayerInfo {
  name: string;
  container: THREE.Group;
  assembledY: number;
  explodedY: number;
  mat: THREE.MeshPhysicalMaterial;
  labelEl: HTMLElement | null;
}

export default function ProteinBarCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const labelsEl = labelsRef.current;
    if (!container || !labelsEl) return;

    let unmounted = false;
    let disposeScene: (() => void) | null = null;

    const run = () => {
    if (unmounted) return;

    const isMobile = window.innerWidth < 768;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:none;";
    container.appendChild(renderer.domElement);

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);

    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xfff6ee, 2.4);
    key.position.set(3, 7, 5);
    key.castShadow = !isMobile;
    if (!isMobile) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4; key.shadow.camera.right = 4;
      key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
      key.shadow.bias = -0.0015;
    }
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf2f4f8, 1.0);
    fill.position.set(-5, 3, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(-2, -3, -6);
    scene.add(rim);

    const top = new THREE.DirectionalLight(0xffffff, 0.7);
    top.position.set(0, 8, 0);
    scene.add(top);

    // ── Environment map ───────────────────────────────────────────────────────
    const envC = document.createElement("canvas");
    envC.width = 512; envC.height = 256;
    const eCtx = envC.getContext("2d")!;
    const eg = eCtx.createLinearGradient(0, 0, 0, 256);
    eg.addColorStop(0, "#ffffff"); eg.addColorStop(0.28, "#eef0f2");
    eg.addColorStop(0.5, "#d7d9dc"); eg.addColorStop(0.72, "#c7c8ca"); eg.addColorStop(1, "#e9e9e7");
    eCtx.fillStyle = eg; eCtx.fillRect(0, 0, 512, 256);
    eCtx.fillStyle = "rgba(255,255,255,0.9)";
    eCtx.fillRect(60, 40, 160, 60);
    eCtx.fillRect(300, 30, 150, 50);
    const envTex = new THREE.CanvasTexture(envC);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(envTex);
    envTex.dispose(); pmrem.dispose();
    const env = envRT.texture;
    scene.environment = env;

    // ── Textures ──────────────────────────────────────────────────────────────
    const almondTex = srgb(canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#664c2f"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = `rgba(${95 + Math.random() * 40|0},${60 + Math.random() * 30|0},${30 + Math.random() * 18|0},${(0.3 + Math.random() * 0.4).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(222,196,158,0.35)";
      ctx.beginPath(); ctx.ellipse(w * 0.35, h * 0.4, w * 0.22, h * 0.14, -0.4, 0, Math.PI * 2); ctx.fill();
    }, 128, 128));

    const oatTex = srgb(canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#87794f"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(160,130,80,0.4)"; ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        const y0 = (i / 10) * h + Math.random() * 4;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0 + Math.random() * 6 - 3); ctx.stroke();
      }
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(${170 + Math.random() * 40|0},${140 + Math.random() * 30|0},${90 + Math.random() * 20|0},0.4)`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }, 128, 128));

    const peanutTex = srgb(canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#7d6748"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = `rgba(${150 + Math.random() * 45|0},${90 + Math.random() * 35|0},${45 + Math.random() * 22|0},${(0.35 + Math.random() * 0.4).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "rgba(140,85,40,0.4)"; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h + 6); ctx.stroke(); }
    }, 128, 128));

    const honeyTex = srgb(canvasTex((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#a9862f"); g.addColorStop(0.4, "#9c7a1e"); g.addColorStop(0.7, "#8f6c14"); g.addColorStop(1, "#7d5d0f");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `rgba(255,240,190,${(0.25 + Math.random() * 0.25).toFixed(2)})`; ctx.lineWidth = 3 + Math.random() * 4;
        const y0 = Math.random() * h;
        ctx.beginPath(); ctx.moveTo(0, y0);
        ctx.bezierCurveTo(w * 0.3, y0 + Math.random() * 30 - 15, w * 0.7, y0 + Math.random() * 30 - 15, w, y0); ctx.stroke();
      }
    }, 512, 512));

    const pbTex = srgb(canvasTex((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#83603a"); g.addColorStop(0.5, "#75542f"); g.addColorStop(1, "#684827");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 10; i++) {
        ctx.strokeStyle = `rgba(140,95,50,${(0.2 + Math.random() * 0.2).toFixed(2)})`; ctx.lineWidth = 6 + Math.random() * 8;
        const y0 = Math.random() * h;
        ctx.beginPath(); ctx.moveTo(0, y0);
        ctx.bezierCurveTo(w * 0.3, y0 + Math.random() * 25 - 12, w * 0.7, y0 + Math.random() * 25 - 12, w, y0); ctx.stroke();
      }
      for (let i = 0; i < 250; i++) {
        ctx.fillStyle = `rgba(${170 + Math.random() * 30|0},${120 + Math.random() * 20|0},${70 + Math.random() * 15|0},0.3)`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }, 512, 512));

    // ── Geometries ────────────────────────────────────────────────────────────
    const almondGeo = latheGeo(
      [[0.0, -0.095], [0.018, -0.088], [0.032, -0.065], [0.040, -0.03],
       [0.041, 0.015], [0.036, 0.05], [0.026, 0.075], [0.012, 0.09], [0.0, 0.096]], 0.58);

    const peanutGeo = latheGeo(
      [[0.0, -0.078], [0.023, -0.073], [0.032, -0.052], [0.028, -0.028],
       [0.017, -0.006], [0.013, 0.0], [0.017, 0.006], [0.029, 0.03],
       [0.033, 0.055], [0.024, 0.074], [0.0, 0.08]], 0.68);

    const oatGeo = new THREE.SphereGeometry(0.05, 8, 6);
    oatGeo.scale(1.0, 0.28, 0.5);

    // ── Materials ─────────────────────────────────────────────────────────────
    function physMat(opts: ConstructorParameters<typeof THREE.MeshPhysicalMaterial>[0]): THREE.MeshPhysicalMaterial {
      return new THREE.MeshPhysicalMaterial({ envMap: env, transparent: true, opacity: 0, side: THREE.DoubleSide, ...opts });
    }

    const almondMat = physMat({ map: almondTex, roughness: 0.34, metalness: 0.02, envMapIntensity: 1.05 });
    const oatMat = physMat({ map: oatTex, roughness: 0.46, metalness: 0.0, envMapIntensity: 0.75 });
    const peanutMat = physMat({ map: peanutTex, roughness: 0.38, metalness: 0.02, envMapIntensity: 1.05 });
    const honeyMat = physMat({ map: honeyTex, roughness: 0.07, metalness: 0.0, envMapIntensity: 1.9, clearcoat: 1.0, clearcoatRoughness: 0.03 });
    const pbMat = physMat({ map: pbTex, roughness: 0.28, metalness: 0.0, envMapIntensity: 1.25, clearcoat: 0.45, clearcoatRoughness: 0.2 });

    // ── Scene group & layers ──────────────────────────────────────────────────
    const group = new THREE.Group();
    group.rotation.z = 0.42;
    scene.add(group);

    const barW = 2.7, barD = 1.0;

    function packLayer(
      geo: THREE.BufferGeometry,
      mat: THREE.MeshPhysicalMaterial,
      count: number,
      sizeRange: [number, number],
      rotVar: number,
    ): THREE.Group {
      const container = new THREE.Group();
      const cols = Math.ceil(Math.sqrt(count * (barW / barD)));
      const rows = Math.ceil(count / cols);
      let placed = 0;
      for (let r = 0; r < rows && placed < count; r++) {
        for (let c = 0; c < cols && placed < count; c++) {
          const m = new THREE.Mesh(geo, mat);
          m.castShadow = m.receiveShadow = true;
          const cW = barW / cols, cD = barD / rows;
          m.position.set(
            -barW / 2 + cW * (c + 0.5) + (Math.random() - 0.5) * cW * 0.5,
            (Math.random() - 0.5) * 0.02,
            -barD / 2 + cD * (r + 0.5) + (Math.random() - 0.5) * cD * 0.5,
          );
          m.rotation.set((Math.random() - 0.5) * rotVar, Math.random() * Math.PI * 2, (Math.random() - 0.5) * rotVar);
          const s = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
          m.scale.setScalar(s);
          container.add(m);
          placed++;
        }
      }
      return container;
    }

    const layers: LayerInfo[] = [];
    const gap = 0.68;
    const y0 = -gap * 2;

    function addLayer(
      name: string,
      layerContainer: THREE.Group,
      assembledY: number,
      explodedY: number,
      mat: THREE.MeshPhysicalMaterial,
    ) {
      layerContainer.position.y = assembledY;
      group.add(layerContainer);
      layers.push({ name, container: layerContainer, assembledY, explodedY, mat, labelEl: null });
    }

    addLayer("almonds", packLayer(almondGeo, almondMat, 30, [1.1, 1.5], 0.5), y0, y0, almondMat);
    addLayer("oats", packLayer(oatGeo, oatMat, 90, [0.8, 1.2], 0.9), y0 + gap, y0 + gap, oatMat);
    addLayer("peanuts", packLayer(peanutGeo, peanutMat, 30, [1.1, 1.4], 0.5), y0 + gap * 2, y0 + gap * 2, peanutMat);

    const honeyThickness = 0.05;
    const honeySlab = buildRidgedSlab(barW - 0.1, barD - 0.1, honeyThickness, 64, 16, 0.055, 15, 0.6, honeyMat);
    honeySlab.group.add(addDrips(honeyMat, honeySlab, 7, honeyThickness, [0.55, 0.95]));
    addLayer("honey", honeySlab.group, y0 + gap * 3, y0 + gap * 3, honeyMat);

    const pbThickness = 0.065;
    const pbSlab = buildRidgedSlab(barW - 0.06, barD - 0.06, pbThickness, 56, 14, 0.07, 12, 1.8, pbMat);
    pbSlab.group.add(addDrips(pbMat, pbSlab, 6, pbThickness, [0.6, 1.0]));
    addLayer("peanutbutter", pbSlab.group, y0 + gap * 4, y0 + gap * 4, pbMat);

    // Recalculate assembled positions as a tight stack
    const thicknesses = [0.14, 0.12, 0.14, 0.07, 0.09];
    let acc = -0.25;
    layers.forEach((L, i) => {
      const t = thicknesses[i];
      L.assembledY = acc + t / 2;
      acc += t;
      L.explodedY = y0 + gap * i;
      L.container.position.y = L.assembledY;
    });

    // ── Labels ────────────────────────────────────────────────────────────────
    const labelNames: Record<string, string> = {
      almonds: "Almonds",
      oats: "Rolled Oats",
      peanuts: "Peanuts",
      honey: "Honey",
      peanutbutter: "Peanut Butter",
    };
    layers.forEach((L) => {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;transform:translate(-50%,-50%);
        font-size:9px;color:#C8832A;font-weight:700;
        background:rgba(10,10,10,0.82);
        border:1px solid rgba(200,131,42,0.35);
        padding:4px 10px;border-radius:20px;
        letter-spacing:0.1em;text-transform:uppercase;
        white-space:nowrap;font-family:Montserrat,sans-serif;
        opacity:0;pointer-events:none;
        transition:opacity 0.15s linear;
      `;
      el.textContent = labelNames[L.name] ?? L.name;
      labelsEl.appendChild(el);
      L.labelEl = el;
    });

    // ── Assembled combined bar ────────────────────────────────────────────────
    const combinedBaseTex = srgb(canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#3a2414"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(${25 + Math.random() * 20|0},${16 + Math.random() * 14|0},${9 + Math.random() * 10|0},${(0.3 + Math.random() * 0.4).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${10 + Math.random() * 8|0},${6 + Math.random() * 6|0},${3 + Math.random() * 5|0},0.5)`;
        ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 14, 4 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 160; i++) {
        ctx.save(); ctx.translate(Math.random() * w, Math.random() * h); ctx.rotate(Math.random() * Math.PI);
        ctx.fillStyle = `rgba(${180 + Math.random() * 30|0},${155 + Math.random() * 25|0},${105 + Math.random() * 20|0},0.85)`;
        ctx.beginPath(); ctx.ellipse(0, 0, 7 + Math.random() * 5, 3 + Math.random() * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }, 512, 512));

    const bumpTex = canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#7a7a7a"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        const v = 55 + Math.random() * 70 | 0;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 2.8, 0, Math.PI * 2); ctx.fill();
      }
    }, 512, 512);

    const combinedGlazeTex = srgb(canvasTex((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#40291a"); g.addColorStop(0.5, "#362213"); g.addColorStop(1, "#2c1b0f");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(90,65,35,${(0.1 + Math.random() * 0.1).toFixed(2)})`; ctx.lineWidth = 5 + Math.random() * 6;
        const y0c = Math.random() * h;
        ctx.beginPath(); ctx.moveTo(0, y0c);
        ctx.bezierCurveTo(w * 0.3, y0c + Math.random() * 30 - 15, w * 0.7, y0c + Math.random() * 30 - 15, w, y0c); ctx.stroke();
      }
    }, 512, 512));

    const glazeBumpTex = canvasTex((ctx, w, h) => {
      ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) {
        const v = 50 + Math.random() * 90 | 0;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 0.6 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }, 512, 512);

    const combinedGroup = new THREE.Group();
    group.add(combinedGroup);

    const baseThickness = 0.34;
    const baseGeo = roundedBoxGeo(barW, barD, baseThickness, 0.08);
    baseGeo.rotateX(Math.PI / 2);
    const baseMat = new THREE.MeshPhysicalMaterial({
      map: combinedBaseTex, bumpMap: bumpTex, bumpScale: 0.022,
      roughness: 0.42, metalness: 0.0, envMap: env, envMapIntensity: 0.9,
      clearcoat: 0.25, clearcoatRoughness: 0.3, transparent: true, opacity: 1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = baseMesh.receiveShadow = true;
    const baseY = -0.05;
    baseMesh.position.y = baseY;
    combinedGroup.add(baseMesh);

    const glazeMat = new THREE.MeshPhysicalMaterial({
      map: combinedGlazeTex, bumpMap: glazeBumpTex, bumpScale: 0.02,
      roughness: 0.38, metalness: 0.0, envMap: env, envMapIntensity: 1.0,
      clearcoat: 0.35, clearcoatRoughness: 0.25, transparent: true, opacity: 1,
    });
    const glazeThickness = 0.035;
    const glazeAmp = 0, glazeFreqX = 13, glazePhase = 2.4;
    const glazeSlab = buildRidgedSlab(barW + 0.02, barD + 0.02, glazeThickness, isMobile ? 40 : 80, isMobile ? 12 : 22, glazeAmp, glazeFreqX, glazePhase, glazeMat, 0.012);
    const glazeGroup = glazeSlab.group;
    glazeGroup.position.y = baseY + baseThickness / 2 + glazeThickness / 2;
    combinedGroup.add(glazeGroup);

    const mixMats = [
      new THREE.MeshPhysicalMaterial({ map: almondTex, roughness: 0.38, envMap: env, envMapIntensity: 0.85, transparent: true, opacity: 1, side: THREE.DoubleSide }),
      new THREE.MeshPhysicalMaterial({ map: peanutTex, roughness: 0.42, envMap: env, envMapIntensity: 0.85, transparent: true, opacity: 1, side: THREE.DoubleSide }),
    ];
    const mixGeos = [almondGeo, peanutGeo];
    let mixIdx = 0;
    for (let c = 0; c < 16; c++) {
      for (let r = 0; r < 7; r++) {
        if (Math.random() < 0.12) continue;
        const gi = mixIdx % 2; mixIdx++;
        const m = new THREE.Mesh(mixGeos[gi], mixMats[gi]);
        m.castShadow = true;
        const cW = (barW - 0.2) / 16, cD = (barD - 0.15) / 7;
        const px = -barW / 2 + 0.1 + cW * (c + 0.5) + (Math.random() - 0.5) * cW * 0.6;
        const pz = -barD / 2 + 0.075 + cD * (r + 0.5) + (Math.random() - 0.5) * cD * 0.6;
        const surfY = glazeGroup.position.y + ridgeH(px, pz, glazeAmp, glazeFreqX, glazePhase, 0.012);
        m.position.set(px, surfY + 0.022 + (Math.random() - 0.5) * 0.008, pz);
        m.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
        m.scale.setScalar(0.8 + Math.random() * 0.3);
        combinedGroup.add(m);
      }
    }

    // Center the group
    const bbox = new THREE.Box3().setFromObject(group);
    group.position.sub(bbox.getCenter(new THREE.Vector3()));

    // ── Interaction ───────────────────────────────────────────────────────────
    let rotY = 0.3, targetRotY = 0.3;
    let rotX = 0.18, targetRotX = 0.18;
    const camDist = 3.7;
    let dragging = false, lastX = 0, lastY = 0;

    const canvas = renderer.domElement;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.008;
      targetRotX += (e.clientY - lastY) * 0.008;
      targetRotX = Math.max(-1.0, Math.min(1.0, targetRotX));
      lastX = e.clientX; lastY = e.clientY;
    };
    const onWheel = (e: WheelEvent) => e.preventDefault();

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // ── Animation ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animTime = 0;
    let explodeFactor = 0;
    const labelProj = new THREE.Vector3();
    let rafId = 0;
    let inView = true;

    const tryStart = () => {
      if (inView && !document.hidden && !rafId) rafId = requestAnimationFrame(animate);
    };
    const tryStop = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      inView ? tryStart() : tryStop();
    }, { threshold: 0.05 });
    io.observe(container);

    const onVisibility = () => document.hidden ? tryStop() : tryStart();
    document.addEventListener("visibilitychange", onVisibility);

    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      // Auto-rotate
      if (!dragging) targetRotY += delta * 0.32;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;

      camera.position.x = camDist * Math.sin(rotY) * Math.cos(rotX);
      camera.position.z = camDist * Math.cos(rotY) * Math.cos(rotX);
      camera.position.y = camDist * Math.sin(rotX) + 0.4;
      camera.lookAt(0, 0.12, 0);

      // Breathing explode cycle (12 s): 2.5s hold → 2.5s explode → 2.5s hold → 2.5s assemble
      animTime = (animTime + delta) % 12;
      const t = animTime / 12;
      let explodeTarget = 0;
      if (t < 0.208) {
        explodeTarget = 0;
      } else if (t < 0.417) {
        explodeTarget = easeIO((t - 0.208) / 0.209) * 0.60;
      } else if (t < 0.625) {
        explodeTarget = 0.60;
      } else if (t < 0.833) {
        explodeTarget = (1 - easeIO((t - 0.625) / 0.208)) * 0.60;
      } else {
        explodeTarget = 0;
      }
      explodeFactor += (explodeTarget - explodeFactor) * 0.045;

      const FADE_END = 0.25;
      const fadeIn = Math.min(1, explodeFactor / FADE_END);
      const fadeOut = Math.max(0, 1 - explodeFactor / FADE_END);

      const cw = container!.clientWidth;
      const ch = container!.clientHeight;

      layers.forEach((L, idx) => {
        L.container.position.y = L.assembledY + (L.explodedY - L.assembledY) * explodeFactor;
        L.mat.opacity = fadeIn;

        if (L.labelEl) {
          if (fadeIn < 0.02) {
            L.labelEl.style.opacity = "0";
          } else {
            labelProj.set(0, L.container.position.y, 0);
            group.localToWorld(labelProj);
            labelProj.project(camera);
            const sx = (labelProj.x * 0.5 + 0.5) * cw;
            const sy = (-labelProj.y * 0.5 + 0.5) * ch;
            const dir = idx % 2 === 0 ? -1 : 1;
            const offset = Math.min(cw * 0.18, 90);
            L.labelEl.style.left = sx + dir * offset + "px";
            L.labelEl.style.top = sy + "px";
            L.labelEl.style.opacity = String(Math.min(fadeIn, 1));
          }
        }
      });

      combinedGroup.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          (mesh.material as THREE.MeshPhysicalMaterial).opacity = fadeOut;
        }
      });
      combinedGroup.visible = fadeOut > 0.01;

      renderer.render(scene, camera);
    }
    tryStart();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    disposeScene = () => {
      tryStop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("wheel", onWheel);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else (mesh.material as THREE.Material)?.dispose();
        }
      });

      [almondTex, oatTex, peanutTex, honeyTex, pbTex,
       combinedBaseTex, bumpTex, combinedGlazeTex, glazeBumpTex, env,
      ].forEach((t) => t.dispose());

      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      labelsEl.innerHTML = "";
    };
    }; // end run()

    // Defer init off the critical rendering path
    const tid = (typeof requestIdleCallback !== "undefined")
      ? requestIdleCallback(run, { timeout: 1500 })
      : setTimeout(run, 50) as unknown as number;

    return () => {
      unmounted = true;
      if (typeof requestIdleCallback !== "undefined") cancelIdleCallback(tid as number);
      else clearTimeout(tid as unknown as ReturnType<typeof setTimeout>);
      disposeScene?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? "relative w-full h-full"}
    >
      <div ref={labelsRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
