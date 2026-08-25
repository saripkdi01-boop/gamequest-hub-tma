import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4, Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import type { GameHandle, ExploreRouteState } from "./types";

type SceneOptions = { onGateFocus: (gateIndex: number) => void };

type NexusGate = Mesh & { gateIndex?: number };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, options: SceneOptions): Promise<GameHandle> {
  const device = navigator as Navigator & { deviceMemory?: number };
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const lowPower = (device.deviceMemory ?? 4) <= 2 || (device.hardwareConcurrency ?? 4) <= 4;
  if (lowPower) engine.setHardwareScalingLevel(Math.max(engine.getHardwareScalingLevel(), 1.35));
  const scene = new Scene(engine);
  scene.skipPointerMovePicking = true;
  scene.clearColor = new Color4(0.025, 0.02, 0.075, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.014;
  scene.fogColor = Color3.FromHexString("#16153b");

  const camera = new ArcRotateCamera("nexus-camera", -Math.PI / 2.15, 1.1, 18.5, new Vector3(0, 1.2, 1.4), scene);
  camera.lowerRadiusLimit = 14;
  camera.upperRadiusLimit = 23;
  camera.lowerBetaLimit = 0.78;
  camera.upperBetaLimit = 1.32;
  camera.wheelPrecision = 120;
  camera.panningSensibility = 0;
  camera.attachControl(canvas, true);

  const sky = new HemisphericLight("nexus-sky", new Vector3(0, 1, 0), scene);
  sky.intensity = 0.78;
  sky.diffuse = Color3.FromHexString("#9da7ff");
  sky.groundColor = Color3.FromHexString("#09071c");
  const portalLight = new PointLight("portal-light", new Vector3(0, 3.4, 3.5), scene);
  portalLight.diffuse = Color3.FromHexString("#4ce0c4");
  portalLight.specular = Color3.FromHexString("#8de4ff");
  portalLight.intensity = 3.6;
  portalLight.range = 17;
  const questLight = new PointLight("quest-light", new Vector3(1.4, 2.2, -3.2), scene);
  questLight.diffuse = Color3.FromHexString("#f5b942");
  questLight.intensity = 1.7;
  questLight.range = 11;

  const glow = new GlowLayer("nexus-glow", scene, { blurKernelSize: lowPower ? 16 : 32 });
  glow.intensity = lowPower ? 0.46 : 0.72;

  const voidMat = material("void", "#09071d", scene);
  const rockMat = material("ancient-rock", "#1c2045", scene);
  const rockEdgeMat = material("rock-edge", "#33356e", scene);
  const routeMat = material("route-stone", "#3c3e79", scene);
  const cyan = material("portal-cyan", "#4ce0c4", scene, true, 0.72);
  const cyanSoft = material("portal-soft", "#68d8ff", scene, true, 0.45);
  const violet = material("nexus-violet", "#9a7bff", scene, true, 0.5);
  const gold = material("quest-gold", "#f5b942", scene, true, 0.55);
  const ivory = material("companion-ivory", "#f3efff", scene);
  const hair = material("companion-hair", "#91a7ff", scene, true, 0.18);
  const cape = material("companion-cape", "#34316e", scene);
  const dark = material("companion-dark", "#171431", scene);
  const locked = material("locked-gate", "#3a3c58", scene);
  const focused = material("focused-gate", "#fff0a1", scene, true, 0.8);

  const abyss = MeshBuilder.CreateGround("nexus-abyss", { width: 42, height: 48 }, scene);
  abyss.position.y = -2.15;
  abyss.material = voidMat;

  const islands = buildFloatingIsland(scene, rockMat, rockEdgeMat, routeMat);
  const starDust = buildStarDust(scene, cyanSoft, violet, gold, lowPower ? 10 : 18);
  const portal = buildPortal(scene, cyan, cyanSoft, rockEdgeMat, gold);
  const gates: NexusGate[] = [
    buildBeaconGate(scene, new Vector3(0, 0.25, -0.3), cyan) as NexusGate,
    buildBridgeGate(scene, new Vector3(0, 0.25, 5.15), violet) as NexusGate,
    buildRelicGate(scene, new Vector3(0, 0.25, 10.55), gold) as NexusGate,
  ];
  gates.forEach((gate, index) => {
    gate.gateIndex = index;
    gate.getChildMeshes().concat(gate).forEach(mesh => {
      mesh.isPickable = true;
      mesh.metadata = { gateIndex: index };
    });
  });

  const companion = buildCompanion(scene, ivory, hair, cape, dark, cyan);
  const crystals = buildCrystals(scene, cyan, violet, gold, lowPower ? 4 : 6);
  const orbitRunes = buildOrbitRunes(scene, gold, cyanSoft, lowPower ? 2 : 4);

  let routeState: ExploreRouteState = { checkpointIndex: 0, focusedGate: null };
  const applyRouteState = (state: ExploreRouteState) => {
    routeState = state;
    gates.forEach((gate, index) => {
      const gateMaterial = index < state.checkpointIndex ? gold : index === state.focusedGate ? focused : index === state.checkpointIndex ? cyan : locked;
      gate.getChildMeshes().concat(gate).forEach(mesh => { mesh.material = gateMaterial; });
      gate.scaling.setAll(index === state.focusedGate ? 1.1 : 1);
    });
    const targetZ = Math.min(state.checkpointIndex, 3) * 5.45 - 5.25;
    companion.root.position.z = targetZ - 0.2;
  };
  applyRouteState(routeState);

  const pointerObserver = scene.onPointerObservable.add(pointer => {
    if (pointer.type !== PointerEventTypes.POINTERDOWN || !pointer.pickInfo?.hit) return;
    const index = pointer.pickInfo.pickedMesh?.metadata?.gateIndex;
    if (typeof index === "number" && index === routeState.checkpointIndex) options.onGateFocus(index);
  });
  const tickObserver = scene.onBeforeRenderObservable.add(() => {
    if (reducedMotion) return;
    const time = performance.now() / 1000;
    const pulse = 1 + Math.sin(time * 2.1) * 0.055;
    portal.core.scaling.setAll(pulse);
    portal.ring.rotation.z += 0.006;
    portal.inner.rotation.z -= 0.004;
    crystals.forEach((crystal, index) => {
      crystal.rotation.y += 0.008 + index * 0.0008;
      crystal.position.y = crystal.metadata.baseY + Math.sin(time * 1.55 + index) * 0.12;
    });
    orbitRunes.forEach((rune, index) => {
      rune.rotation.y += index % 2 ? -0.009 : 0.007;
      rune.position.y = rune.metadata.baseY + Math.sin(time * 1.1 + index * 0.7) * 0.1;
    });
    companion.root.position.y = 0.62 + Math.sin(time * 2.05) * 0.08;
    companion.body.rotation.z = Math.sin(time * 1.25) * 0.025;
    companion.orb.scaling.setAll(0.93 + Math.sin(time * 3.1) * 0.08);
    islands.forEach((island, index) => { island.rotation.y += index === 0 ? 0.0007 : -0.00035; });
    portalLight.intensity = 3.15 + Math.sin(time * 2.4) * 0.35;
  });

  return {
    updateRoute: applyRouteState,
    dispose: () => {
      scene.onPointerObservable.remove(pointerObserver);
      scene.onBeforeRenderObservable.remove(tickObserver);
      scene.dispose();
    },
  };
}

function material(name: string, hex: string, scene: Scene, emissive = false, strength = 0.35) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.specularColor = Color3.FromHexString("#171633");
  value.roughness = 0.62;
  if (emissive) value.emissiveColor = Color3.FromHexString(hex).scale(strength);
  return value;
}

function buildFloatingIsland(scene: Scene, rock: StandardMaterial, edge: StandardMaterial, route: StandardMaterial) {
  const islandTop = MeshBuilder.CreateCylinder("nexus-island-top", { diameter: 8.1, height: 0.85, tessellation: 8 }, scene);
  islandTop.position = new Vector3(0, -0.25, 1.5);
  islandTop.rotation.y = Math.PI / 8;
  islandTop.material = rock;
  const islandMid = MeshBuilder.CreateCylinder("nexus-island-mid", { diameterTop: 6.9, diameterBottom: 5.2, height: 2.6, tessellation: 8 }, scene);
  islandMid.position = new Vector3(0, -1.8, 1.5);
  islandMid.rotation.y = Math.PI / 8;
  islandMid.material = edge;
  const islandCore = MeshBuilder.CreateCylinder("nexus-island-core", { diameterTop: 4.2, diameterBottom: 1.3, height: 3.2, tessellation: 7 }, scene);
  islandCore.position = new Vector3(0, -4.25, 1.5);
  islandCore.material = rock;
  const path = MeshBuilder.CreateCylinder("nexus-path", { diameter: 5.3, height: 0.1, tessellation: 8 }, scene);
  path.position = new Vector3(0, 0.22, 1.5);
  path.rotation.y = Math.PI / 8;
  path.material = route;
  return [islandTop, islandMid, islandCore];
}

function buildPortal(scene: Scene, glow: StandardMaterial, innerGlow: StandardMaterial, stone: StandardMaterial, gold: StandardMaterial) {
  const root = MeshBuilder.CreateBox("portal-root", { size: 0.1 }, scene);
  root.isVisible = false;
  root.position = new Vector3(0, 0.5, 2.65);
  const arch = MeshBuilder.CreateTorus("portal-arch", { diameter: 4.1, thickness: 0.34, tessellation: 32 }, scene);
  arch.parent = root;
  arch.rotation.x = Math.PI / 2;
  arch.material = stone;
  const ring = MeshBuilder.CreateTorus("portal-ring", { diameter: 3.45, thickness: 0.13, tessellation: 32 }, scene);
  ring.parent = root;
  ring.rotation.x = Math.PI / 2;
  ring.material = glow;
  const inner = MeshBuilder.CreateDisc("portal-inner", { radius: 1.68, tessellation: 48 }, scene);
  inner.parent = root;
  inner.rotation.x = Math.PI / 2;
  inner.position.z = 0.03;
  inner.material = innerGlow;
  const core = MeshBuilder.CreatePolyhedron("portal-core", { type: 1, size: 0.58 }, scene);
  core.parent = root;
  core.position = new Vector3(0, 0, -0.15);
  core.material = gold;
  return { root, ring, inner, core };
}

function buildBeaconGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("signal-beacon", { size: 0.1 }, scene);
  root.isVisible = false;
  root.position = position;
  const tower = MeshBuilder.CreateCylinder("beacon-tower", { height: 2.2, diameterTop: 0.28, diameterBottom: 0.72, tessellation: 6 }, scene);
  tower.parent = root;
  tower.position.y = 1.08;
  tower.material = gateMaterial;
  const ring = MeshBuilder.CreateTorus("beacon-ring", { diameter: 1.5, thickness: 0.1, tessellation: 20 }, scene);
  ring.parent = root;
  ring.position.y = 2.08;
  ring.rotation.x = Math.PI / 2;
  ring.material = gateMaterial;
  return root;
}

function buildBridgeGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("glass-gate", { size: 0.1 }, scene);
  root.isVisible = false;
  root.position = position;
  for (let index = -1; index <= 1; index += 1) {
    const panel = MeshBuilder.CreateBox(`glass-panel-${index}`, { width: 0.72, height: 2.05, depth: 0.15 }, scene);
    panel.parent = root;
    panel.position = new Vector3(index * 0.82, 1.02, 0);
    panel.rotation.z = index * -0.14;
    panel.material = gateMaterial;
  }
  return root;
}

function buildRelicGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("relic-arch", { size: 0.1 }, scene);
  root.isVisible = false;
  root.position = position;
  const arch = MeshBuilder.CreateTorus("relic-torus", { diameter: 2.55, thickness: 0.22, tessellation: 28 }, scene);
  arch.parent = root;
  arch.position.y = 1.35;
  arch.rotation.x = Math.PI / 2;
  arch.material = gateMaterial;
  const core = MeshBuilder.CreatePolyhedron("relic-core", { type: 1, size: 0.64 }, scene);
  core.parent = root;
  core.position.y = 1.35;
  core.material = gateMaterial;
  return root;
}

function buildCompanion(scene: Scene, ivory: StandardMaterial, hair: StandardMaterial, cape: StandardMaterial, dark: StandardMaterial, energy: StandardMaterial) {
  const root = MeshBuilder.CreateBox("companion-root", { size: 0.1 }, scene);
  root.isVisible = false;
  root.position = new Vector3(0, 0.62, -5.25);
  const body = MeshBuilder.CreateCapsule("yuki-body", { height: 1.25, radius: 0.42, tessellation: 12 }, scene);
  body.parent = root;
  body.position.y = 0.85;
  body.material = cape;
  const head = MeshBuilder.CreateSphere("yuki-head", { diameter: 1.08, segments: 16 }, scene);
  head.parent = root;
  head.position.y = 1.64;
  head.material = ivory;
  const hairCap = MeshBuilder.CreateSphere("yuki-hair", { diameter: 1.13, segments: 12 }, scene);
  hairCap.parent = root;
  hairCap.position = new Vector3(0, 1.82, -0.02);
  hairCap.scaling = new Vector3(1, 0.58, 1);
  hairCap.material = hair;
  const eyeL = MeshBuilder.CreateSphere("yuki-eye-l", { diameter: 0.13, segments: 8 }, scene);
  eyeL.parent = root;
  eyeL.position = new Vector3(-0.2, 1.65, -0.47);
  eyeL.material = dark;
  const eyeR = eyeL.clone("yuki-eye-r");
  if (eyeR) { eyeR.position.x = 0.2; eyeR.parent = root; }
  const orb = MeshBuilder.CreateIcoSphere("yuki-orb", { radius: 0.22, subdivisions: 2 }, scene);
  orb.parent = root;
  orb.position = new Vector3(0.72, 1.03, -0.08);
  orb.material = energy;
  const shoulder = MeshBuilder.CreateTorus("yuki-collar", { diameter: 0.78, thickness: 0.08, tessellation: 16 }, scene);
  shoulder.parent = root;
  shoulder.position.y = 1.27;
  shoulder.rotation.x = Math.PI / 2;
  shoulder.material = energy;
  return { root, body, orb };
}

function buildCrystals(scene: Scene, cyan: StandardMaterial, violet: StandardMaterial, gold: StandardMaterial, count = 6) {
  const points = ([[-2.5, 0.58, -2.2], [2.3, 0.7, -1.2], [-2.55, 0.55, 3.9], [2.55, 0.64, 5.3], [-1.9, 0.52, 8.5], [2.1, 0.58, 10.1]] as Array<[number, number, number]>).slice(0, count);
  return points.map(([x, y, z], index) => {
    const crystal = MeshBuilder.CreatePolyhedron(`nexus-crystal-${index}`, { type: 1, size: 0.48 + (index % 2) * 0.14 }, scene);
    crystal.position = new Vector3(x, y, z);
    crystal.rotation.z = index % 2 ? 0.18 : -0.14;
    crystal.material = index % 3 === 0 ? gold : index % 2 ? violet : cyan;
    crystal.metadata = { baseY: y };
    return crystal;
  });
}

function buildOrbitRunes(scene: Scene, gold: StandardMaterial, cyan: StandardMaterial, count = 4) {
  return [-1, 1, -1, 1].slice(0, count).map((side, index) => {
    const rune = MeshBuilder.CreateTorus(`orbit-rune-${index}`, { diameter: 0.78, thickness: 0.055, tessellation: 16 }, scene);
    rune.position = new Vector3(side * (3.5 + index * 0.25), 1.5 + (index % 2) * 0.75, index * 3.8 - 2.2);
    rune.rotation = new Vector3(Math.PI / 2, 0.3 * side, 0);
    rune.material = index % 2 ? cyan : gold;
    rune.metadata = { baseY: rune.position.y };
    return rune;
  });
}

function buildStarDust(scene: Scene, cyan: StandardMaterial, violet: StandardMaterial, gold: StandardMaterial, count = 18) {
  const dust: Mesh[] = [];
  for (let index = 0; index < count; index += 1) {
    const star = MeshBuilder.CreateIcoSphere(`star-dust-${index}`, { radius: 0.035 + (index % 3) * 0.018, subdivisions: 1 }, scene);
    const angle = index * 2.399;
    const radius = 4.7 + (index % 4) * 1.2;
    star.position = new Vector3(Math.cos(angle) * radius, -0.1 + (index % 5) * 0.62, Math.sin(angle) * radius + 1.5);
    star.material = index % 3 === 0 ? gold : index % 2 ? violet : cyan;
    dust.push(star);
  }
  return dust;
}
