import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
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

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, options: SceneOptions): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.06, 0.12, 1);
  const camera = new ArcRotateCamera("route-camera", -Math.PI / 2.7, 1.12, 20, new Vector3(0, 0, 2.5), scene);
  camera.lowerRadiusLimit = 16;
  camera.upperRadiusLimit = 23;
  camera.lowerBetaLimit = 0.8;
  camera.upperBetaLimit = 1.25;
  camera.wheelDeltaPercentage = 0.01;
  camera.panningSensibility = 0;
  camera.attachControl(canvas, true);

  const sky = new HemisphericLight("sky", new Vector3(0, 1, 0), scene);
  sky.intensity = 0.8;
  sky.diffuse = Color3.FromHexString("#9fc9dc");
  sky.groundColor = Color3.FromHexString("#071021");
  const beaconLight = new PointLight("beacon-light", new Vector3(0, 4, 8), scene);
  beaconLight.diffuse = Color3.FromHexString("#d7fb70");
  beaconLight.intensity = 2.2;
  beaconLight.range = 14;

  const slate = material("slate", "#182840", scene);
  const route = material("route", "#263f56", scene);
  const lime = material("lime", "#d7fb70", scene, true);
  const cyan = material("cyan", "#68d8ff", scene, true);
  const violet = material("violet", "#9a7bff", scene, true);
  const locked = material("locked", "#30445d", scene);
  const focused = material("focused", "#f6e18a", scene, true);

  const ground = MeshBuilder.CreateGround("void-plane", { width: 40, height: 44 }, scene);
  ground.position.y = -0.65;
  ground.material = material("void", "#091426", scene);

  const platforms: Mesh[] = [];
  for (let index = 0; index < 4; index += 1) {
    const platform = MeshBuilder.CreateCylinder(`platform-${index}`, { diameter: index === 0 ? 6 : 5.1, height: 0.7, tessellation: 6 }, scene);
    platform.position = new Vector3(0, 0, index * 5.4 - 5.2);
    platform.rotation.y = Math.PI / 6;
    platform.material = slate;
    platforms.push(platform);
    if (index < 3) {
      const bridge = MeshBuilder.CreateBox(`bridge-${index}`, { width: 1.8, depth: 3.3, height: 0.25 }, scene);
      bridge.position = new Vector3(0, -0.18, index * 5.4 - 2.5);
      bridge.material = route;
    }
  }

  const player = MeshBuilder.CreateCapsule("pathfinder", { height: 1.7, radius: 0.36 }, scene);
  player.position = new Vector3(0, 0.72, -5.2);
  player.material = cyan;
  const visor = MeshBuilder.CreateSphere("pathfinder-visor", { diameter: 0.5, segments: 12 }, scene);
  visor.position = new Vector3(0, 1.17, -5.48);
  visor.material = lime;

  const gates = [
    buildBeaconGate(scene, new Vector3(0, 0.4, 0.2), cyan),
    buildBridgeGate(scene, new Vector3(0, 0.4, 5.6), violet),
    buildRelicGate(scene, new Vector3(0, 0.4, 11), lime),
  ];
  gates.forEach((gate, index) => gate.getChildMeshes().concat(gate).forEach(mesh => { mesh.isPickable = true; mesh.metadata = { gateIndex: index }; }));

  const crystals: Mesh[] = [];
  [[-1.4, -2.5], [1.2, 1.8], [-1.1, 4.2], [1.25, 7.3], [0, 10]].forEach(([x, z], index) => {
    const crystal = MeshBuilder.CreatePolyhedron(`crystal-${index}`, { type: 1, size: 0.45 }, scene);
    crystal.position = new Vector3(x, 0.8, z);
    crystal.material = index % 2 ? cyan : lime;
    crystals.push(crystal);
  });

  let routeState: ExploreRouteState = { checkpointIndex: 0, focusedGate: null };
  const applyRouteState = (state: ExploreRouteState) => {
    routeState = state;
    gates.forEach((gate, index) => {
      const gateMaterial = index < state.checkpointIndex ? lime : index === state.focusedGate ? focused : index === state.checkpointIndex ? cyan : locked;
      gate.getChildMeshes().concat(gate).forEach(mesh => { mesh.material = gateMaterial; });
      gate.scaling.setAll(index === state.focusedGate ? 1.08 : 1);
    });
    const targetZ = Math.min(state.checkpointIndex, 3) * 5.4 - 5.2;
    player.position.z = targetZ;
    visor.position.z = targetZ - 0.28;
  };
  applyRouteState(routeState);

  const pointerObserver = scene.onPointerObservable.add(pointer => {
    if (pointer.type !== PointerEventTypes.POINTERDOWN || !pointer.pickInfo?.hit) return;
    const index = pointer.pickInfo.pickedMesh?.metadata?.gateIndex;
    if (typeof index === "number" && index === routeState.checkpointIndex) options.onGateFocus(index);
  });
  const tickObserver = scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() / 1000;
    crystals.forEach((crystal, index) => { crystal.rotation.y += 0.015; crystal.position.y = 0.8 + Math.sin(time * 1.7 + index) * 0.13; });
    player.position.y = 0.72 + Math.sin(time * 2.2) * 0.06;
    visor.position.y = 1.17 + Math.sin(time * 2.2) * 0.06;
    const activeGate = gates[routeState.checkpointIndex];
    if (activeGate) activeGate.rotation.y += 0.005;
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

function material(name: string, hex: string, scene: Scene, emissive = false) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.specularColor = Color3.Black();
  if (emissive) value.emissiveColor = Color3.FromHexString(hex).scale(0.45);
  return value;
}

function buildBeaconGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("signal-beacon", { size: 0.1 }, scene);
  root.isVisible = false; root.position = position;
  const tower = MeshBuilder.CreateCylinder("beacon-tower", { height: 2.5, diameterTop: 0.35, diameterBottom: 0.75, tessellation: 6 }, scene);
  tower.parent = root; tower.position.y = 1.2; tower.material = gateMaterial;
  const ring = MeshBuilder.CreateTorus("beacon-ring", { diameter: 1.5, thickness: 0.12, tessellation: 16 }, scene);
  ring.parent = root; ring.position.y = 2.2; ring.rotation.x = Math.PI / 2; ring.material = gateMaterial;
  return root;
}

function buildBridgeGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("glass-gate", { size: 0.1 }, scene);
  root.isVisible = false; root.position = position;
  for (let index = -1; index <= 1; index += 1) {
    const panel = MeshBuilder.CreateBox(`glass-panel-${index}`, { width: 0.75, height: 2.1, depth: 0.16 }, scene);
    panel.parent = root; panel.position = new Vector3(index * 0.85, 1.05, 0); panel.rotation.z = index * -0.12; panel.material = gateMaterial;
  }
  return root;
}

function buildRelicGate(scene: Scene, position: Vector3, gateMaterial: StandardMaterial) {
  const root = MeshBuilder.CreateBox("relic-arch", { size: 0.1 }, scene);
  root.isVisible = false; root.position = position;
  const arch = MeshBuilder.CreateTorus("relic-torus", { diameter: 2.7, thickness: 0.24, tessellation: 24 }, scene);
  arch.parent = root; arch.position.y = 1.5; arch.rotation.x = Math.PI / 2; arch.material = gateMaterial;
  const core = MeshBuilder.CreatePolyhedron("relic-core", { type: 1, size: 0.72 }, scene);
  core.parent = root; core.position.y = 1.5; core.material = gateMaterial;
  return root;
}
