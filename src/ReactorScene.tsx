import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { parts, type PartID } from "./content";
import type { State, Controls } from "./simulation";
export type View = "plant" | "core" | "fission";
type Props = {
  view: View;
  selected: PartID;
  onSelect: (id: PartID) => void;
  state: State;
  controls: Controls;
  cutaway: boolean;
  exploded: boolean;
  labels: boolean;
  layer: "flow" | "temperature" | "neutrons";
  reduced: boolean;
  focusTick: number;
  homeTick: number;
  zoomTick: number;
  onError: () => void;
};
const positions: Record<PartID, THREE.Vector3> = {
  fuel: new THREE.Vector3(-3.1, 1.6, 0),
  rods: new THREE.Vector3(-3.1, 3.5, 0),
  water: new THREE.Vector3(-2.1, 2.6, 0.8),
  vessel: new THREE.Vector3(-3.1, 1.8, 0),
  steam: new THREE.Vector3(0.2, 2.2, 0),
  pressuriser: new THREE.Vector3(-1.1, 3, -1.7),
  pump: new THREE.Vector3(-0.9, 0.5, 1.7),
  turbine: new THREE.Vector3(4.2, 1.65, 0),
  condenser: new THREE.Vector3(4.1, 0.65, 2.3),
  containment: new THREE.Vector3(-1.8, 2, 0),
};
export default function ReactorScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props);
  latest.current = props;
  const api = useRef<{
    focus: () => void;
    home: () => void;
    zoom: (d: number) => void;
  } | null>(null);
  useEffect(() => {
    api.current?.focus();
  }, [props.focusTick]);
  useEffect(() => {
    api.current?.home();
  }, [props.homeTick]);
  useEffect(() => {
    if (props.zoomTick) api.current?.zoom(props.zoomTick > 0 ? 1 : -1);
  }, [props.zoomTick]);
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      latest.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor("#edf0ec");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D reactor. Use the component list to select parts with a keyboard.",
    );
    renderer.domElement.setAttribute("role", "img");
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#edf0ec", 24, 48);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = !props.reduced;
    orbit.dampingFactor = 0.09;
    orbit.minDistance = 2;
    orbit.maxDistance = 24;
    orbit.maxPolarAngle = Math.PI * 0.49;
    orbit.target.set(0, 1, 0);
    scene.add(new THREE.HemisphereLight("#ffffff", "#8c9691", 3));
    const key = new THREE.DirectionalLight("#fff2d9", 5);
    key.position.set(2, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
    });
    key.shadow.bias = -0.001;
    scene.add(key);
    const fill = new THREE.DirectionalLight("#c0d7e1", 2);
    fill.position.set(-8, 5, -3);
    scene.add(fill);
    const plant = new THREE.Group(),
      atomic = new THREE.Group();
    scene.add(plant, atomic);
    plant.visible = props.view !== "fission";
    atomic.visible = !plant.visible;
    const pickables: THREE.Object3D[] = [];
    const materials: { mat: THREE.MeshStandardMaterial; id: PartID }[] = [];
    const mat = (color: string, metalness = 0.45, roughness = 0.35) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });
    const steel = mat("#a8b3b1", 0.72, 0.27),
      dark = mat("#405451", 0.65, 0.35),
      gold = mat("#c9944f", 0.55, 0.3),
      white = mat("#e5e9e4", 0.25, 0.6);
    function tag(mesh: THREE.Object3D, id?: PartID) {
      if (id) {
        mesh.userData.id = id;
        pickables.push(mesh);
        if (
          mesh instanceof THREE.Mesh &&
          mesh.material instanceof THREE.MeshStandardMaterial
        ) {
          mesh.material = mesh.material.clone();
          materials.push({ mat: mesh.material, id });
        }
      }
      return mesh;
    }
    function mesh(
      g: THREE.BufferGeometry,
      m: THREE.Material,
      p: THREE.Vector3 | number[],
      id?: PartID,
      parent: THREE.Object3D = plant,
    ) {
      const o = new THREE.Mesh(g, m);
      o.position.copy(p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p));
      o.castShadow = true;
      o.receiveShadow = true;
      tag(o, id);
      parent.add(o);
      return o;
    }
    const cyl = (
      r: number,
      h: number,
      p: number[],
      m: THREE.Material,
      id?: PartID,
      parent = plant,
    ) => mesh(new THREE.CylinderGeometry(r, r, h, 40), m, p, id, parent);
    const box = (
      w: number,
      h: number,
      d: number,
      p: number[],
      m: THREE.Material,
      id?: PartID,
      parent = plant,
    ) => mesh(new THREE.BoxGeometry(w, h, d), m, p, id, parent);
    const ring = (
      r: number,
      t: number,
      p: number[],
      m: THREE.Material,
      id?: PartID,
      parent = plant,
    ) => {
      const o = mesh(new THREE.TorusGeometry(r, t, 10, 64), m, p, id, parent);
      o.rotation.x = Math.PI / 2;
      return o;
    };
    const slab = box(12.6, 0.16, 7, [0, -0.3, 0.2], mat("#c9d0c9", 0.1, 0.7));
    slab.receiveShadow = true;
    for (let x = -5; x < 6; x += 1) {
      const line = box(
        0.012,
        0.005,
        6.6,
        [x, -0.212, 0.2],
        mat("#b9c3bc", 0, 0.9),
      );
      line.castShadow = false;
    }
    for (let z = -3; z < 4; z += 1) {
      const line = box(12, 0.005, 0.012, [0, -0.21, z], mat("#b9c3bc", 0, 0.9));
      line.castShadow = false;
    }
    const floor = mesh(
      new THREE.PlaneGeometry(200, 200),
      mat("#edf0ec", 0, 1),
      [0, -0.4, 0],
      undefined,
      scene,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    // Cutaway vessel: physical back wall, removable front segment, base and head.
    const rx = -3.1;
    cyl(1.17, 0.22, [rx, 0.05, 0], steel, "vessel");
    const wallMat = mat("#b5c0be", 0.7, 0.28);
    wallMat.side = THREE.DoubleSide;
    mesh(
      new THREE.CylinderGeometry(
        1.1,
        1.1,
        2.75,
        64,
        1,
        true,
        Math.PI * 0.38,
        Math.PI * 1.24,
      ),
      wallMat,
      [rx, 1.53, 0],
      "vessel",
    );
    const front = mesh(
      new THREE.CylinderGeometry(
        1.1,
        1.1,
        2.75,
        48,
        1,
        true,
        -Math.PI * 0.38,
        Math.PI * 0.76,
      ),
      wallMat,
      [rx, 1.53, 0],
      "vessel",
    );
    front.visible = !props.cutaway;
    ring(1.1, 0.09, [rx, 2.92, 0], steel, "vessel");
    ring(1.1, 0.1, [rx, 0.18, 0], steel, "vessel");
    const lidGroup = new THREE.Group();
    lidGroup.position.set(rx, props.exploded ? 4.5 : 3.02, 0);
    plant.add(lidGroup);
    mesh(
      new THREE.SphereGeometry(1.12, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      steel,
      [0, 0, 0],
      "vessel",
      lidGroup,
    );
    ring(1.15, 0.08, [0, 0, 0], steel, "vessel", lidGroup);
    if (props.cutaway && !props.exploded) lidGroup.visible = false;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      cyl(
        0.055,
        0.12,
        [rx + Math.sin(a) * 1.18, 2.94, Math.cos(a) * 1.18],
        dark,
        "vessel",
      );
    }
    const fuelGroup = new THREE.Group();
    fuelGroup.position.set(rx, props.exploded ? 0.5 : 0, 0);
    plant.add(fuelGroup);
    const fuelMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.043, 0.043, 1.95, 8),
      gold,
      144,
    );
    fuelMesh.userData.id = "fuel";
    pickables.push(fuelMesh);
    fuelMesh.castShadow = true;
    fuelGroup.add(fuelMesh);
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let x = 0; x < 12; x++)
      for (let z = 0; z < 12; z++) {
        dummy.position.set((x - 5.5) * 0.117, 1.37, (z - 5.5) * 0.117);
        dummy.updateMatrix();
        fuelMesh.setMatrixAt(n++, dummy.matrix);
      }
    for (let y of [0.52, 1.18, 1.85, 2.32])
      box(1.55, 0.075, 1.55, [0, y, 0], steel, "fuel", fuelGroup);
    const rodBank = new THREE.Group();
    rodBank.position.set(rx, 0, 0);
    plant.add(rodBank);
    for (let x = 0; x < 4; x++)
      for (let z = 0; z < 4; z++)
        cyl(
          0.071,
          2,
          [(x - 1.5) * 0.36, 1.48, (z - 1.5) * 0.36],
          dark,
          "rods",
          rodBank,
        );
    box(1.3, 0.1, 1.3, [0, 2.53, 0], dark, "rods", rodBank);
    cyl(0.11, 0.85, [0, 3, 0], steel, "rods", rodBank);
    // Steam generator shell and visible tube bundle.
    cyl(0.79, 0.2, [0.2, 0.06, 0], steel, "steam");
    const sgWall = new THREE.MeshStandardMaterial({
      color: "#d0d9d3",
      metalness: 0.45,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    mesh(
      new THREE.CylinderGeometry(
        0.67,
        0.67,
        3.55,
        48,
        1,
        true,
        Math.PI * 0.35,
        Math.PI * 1.3,
      ),
      sgWall,
      [0.2, 1.92, 0],
      "steam",
    );
    const sgFront = mesh(
      new THREE.CylinderGeometry(
        0.67,
        0.67,
        3.55,
        32,
        1,
        true,
        -Math.PI * 0.35,
        Math.PI * 0.7,
      ),
      sgWall,
      [0.2, 1.92, 0],
      "steam",
    );
    sgFront.visible = !props.cutaway;
    for (let y of [0.25, 1.9, 3.5])
      ring(0.69, 0.065, [0.2, y, 0], steel, "steam");
    mesh(
      new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      steel,
      [0.2, 3.66, 0],
      "steam",
    );
    for (let x = 0; x < 5; x++)
      for (let z = 0; z < 5; z++) {
        const xx = 0.2 + (x - 2) * 0.17,
          zz = (z - 2) * 0.17;
        cyl(0.031, 2.5, [xx, 1.75, zz], gold, "steam");
      }
    const flows: {
      curve: THREE.CatmullRomCurve3;
      particles: THREE.Mesh[];
      primary: boolean;
      offset: number;
    }[] = [];
    function pipe(
      points: number[][],
      color: string,
      id: PartID,
      r = 0.11,
      primary = true,
    ) {
      const curve = new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p)),
        false,
        "catmullrom",
        0.15,
      );
      mesh(
        new THREE.TubeGeometry(curve, 64, r, 10, false),
        mat(color, 0.3, 0.4),
        [0, 0, 0],
        id,
      );
      const particles: THREE.Mesh[] = [];
      for (let i = 0; i < 7; i++) {
        const o = mesh(
          new THREE.SphereGeometry(r * 0.57, 8, 8),
          new THREE.MeshBasicMaterial({ color: "#fff9db" }),
          [0, 0, 0],
        );
        o.castShadow = false;
        particles.push(o);
      }
      flows.push({ curve, particles, primary, offset: flows.length * 0.16 });
      return curve;
    }
    pipe(
      [
        [rx + 0.8, 2.35, 0],
        [-1.85, 2.35, 0],
        [-1.6, 2.55, 0],
        [-0.55, 2.55, 0],
        [0.05, 2.55, 0],
      ],
      "#ce7045",
      "water",
      0.15,
    );
    pipe(
      [
        [0.2, 0.6, 0.25],
        [0.2, 0.5, 1.7],
        [-0.9, 0.5, 1.7],
        [-2.5, 0.5, 1.7],
        [rx, 0.5, 0.8],
      ],
      "#6b9baa",
      "water",
      0.14,
    );
    const pump = cyl(0.37, 0.65, [-0.9, 0.52, 1.7], dark, "pump");
    pump.rotation.z = Math.PI / 2;
    ring(0.36, 0.07, [-0.9, 0.52, 1.7], steel, "pump");
    box(0.9, 0.18, 0.7, [-0.9, 0.04, 1.7], steel, "pump");
    cyl(0.38, 1.65, [-1.1, 2.8, -1.7], steel, "pressuriser");
    mesh(
      new THREE.SphereGeometry(0.38, 24, 16),
      steel,
      [-1.1, 3.6, -1.7],
      "pressuriser",
    );
    pipe(
      [
        [-1.1, 1.97, -1.7],
        [-1.1, 1.7, -1.1],
        [-1.6, 2.55, 0],
      ],
      "#ad966e",
      "pressuriser",
      0.065,
      false,
    );
    // A surge connection is not a continuously circulating coolant loop.
    flows.pop()?.particles.forEach((particle) => {
      particle.visible = false;
    });
    // Separate secondary steam, condensate, and external cooling paths.
    pipe(
      [
        [0.2, 3.95, 0],
        [1, 4, 0],
        [2, 3.3, 0],
        [3.3, 2.1, 0],
      ],
      "#4c9995",
      "steam",
      0.12,
      false,
    );
    for (let x of [3.4, 4.7]) box(0.5, 1.05, 1, [x, 0.36, 0], steel, "turbine");
    const turbine = mesh(
      new THREE.CylinderGeometry(0.63, 0.78, 1.75, 36, 1, true),
      steel,
      [4.1, 1.4, 0],
      "turbine",
    );
    turbine.rotation.z = Math.PI / 2;
    const rotor = new THREE.Group();
    rotor.position.set(4.1, 1.4, 0);
    plant.add(rotor);
    for (let x of [-0.6, -0.25, 0.1, 0.45]) {
      const disc = mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.07, 32),
        gold,
        [x, 0, 0],
        "turbine",
        rotor,
      );
      disc.rotation.z = Math.PI / 2;
      for (let i = 0; i < 8; i++) {
        const blade = box(0.1, 0.65, 0.045, [x, 0, 0], gold, "turbine", rotor);
        blade.rotation.x = (i * Math.PI) / 4;
      }
    }
    const generator = cyl(0.49, 1, [5.55, 1.4, 0], dark, "turbine");
    generator.rotation.z = Math.PI / 2;
    box(1.25, 0.14, 0.9, [5.35, 0.03, 0], steel, "turbine");
    pipe(
      [
        [4.1, 1.1, 0.35],
        [4.1, 1.1, 1.1],
        [4.1, 0.74, 1.85],
      ],
      "#4c9995",
      "condenser",
      0.14,
      false,
    );
    box(2, 0.8, 1, [4.1, 0.6, 2.3], steel, "condenser");
    for (let x = 3.3; x < 5; x += 0.18)
      box(0.035, 0.65, 1.02, [x, 0.6, 2.3], dark, "condenser");
    pipe(
      [
        [3.2, 0.5, 2.3],
        [2.5, 0.5, 2.3],
        [1.7, 0.5, 2],
        [1.4, 0.6, 0.5],
        [0.68, 0.6, 0],
      ],
      "#6aa8a2",
      "steam",
      0.085,
      false,
    );
    pipe(
      [
        [5.9, 0.2, 3.1],
        [5, 0.2, 3.1],
        [4.7, 0.4, 2.6],
      ],
      "#88b4bd",
      "condenser",
      0.08,
      false,
    );
    pipe(
      [
        [3.7, 0.4, 2.6],
        [3.3, 0.2, 3.1],
        [2.6, 0.2, 3.1],
      ],
      "#88b4bd",
      "condenser",
      0.08,
      false,
    );
    const envelope = new THREE.Group();
    plant.add(envelope);
    const envMat = new THREE.MeshBasicMaterial({
      color: "#8da7a0",
      transparent: true,
      opacity: 0.17,
      wireframe: true,
    });
    const env = mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 4.8, 28, 1, true),
      envMat,
      [-1.7, 2.2, -0.25],
      "containment",
      envelope,
    );
    env.castShadow = false;
    envelope.visible = false;
    // Schematic microscopic view. Deliberately not to scale; no particle-count claim.
    const nucleusMeshes: {
      mesh: THREE.Mesh;
      original: THREE.Vector3;
      side: number;
    }[] = [];
    const nuclei = [
      new THREE.Vector3(-2, 1.2, 0),
      new THREE.Vector3(1.2, 2, -0.4),
      new THREE.Vector3(2.3, 0.4, 0.4),
    ];
    nuclei.forEach((p, j) => {
      const group = new THREE.Group();
      group.position.copy(p);
      atomic.add(group);
      for (let i = 0; i < 24; i++) {
        const a = i * 2.399,
          r = 0.25 + 0.2 * ((i % 3) / 2);
        const nucleon = mesh(
          new THREE.SphereGeometry(0.14, 12, 10),
          mat(i % 2 ? "#aabaaf" : "#ca9357", 0.25, 0.6),
          [Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 1.7) * 0.3],
          "fuel",
          group,
        );
        if (j === 0)
          nucleusMeshes.push({
            mesh: nucleon,
            original: nucleon.position.clone(),
            side: i % 2 ? 1 : -1,
          });
      }
      if (j === 0) {
        const rod = cyl(0.18, 2.3, [0.3, 2.7, 0.7], dark, "rods", atomic);
        rod.rotation.z = 0.15;
      }
    });
    mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      mat("#8fbcbf", 0.1, 0.6),
      [0.9, 0.66, 0.27],
      "water",
      atomic,
    );
    mesh(
      new THREE.SphereGeometry(0.11, 12, 10),
      white,
      [0.7, 0.81, 0.27],
      "water",
      atomic,
    );
    mesh(
      new THREE.SphereGeometry(0.11, 12, 10),
      white,
      [1.1, 0.81, 0.27],
      "water",
      atomic,
    );
    for (let i = 0; i < 11; i++) {
      const a = i * 2.399;
      const mol = mesh(
        new THREE.SphereGeometry(0.13, 12, 10),
        mat("#8fbcbf", 0.1, 0.6),
        [Math.cos(a) * 3, Math.sin(a) * 1.5 + 1, Math.sin(i) * 1.8],
        "water",
        atomic,
      );
      mol.castShadow = false;
    }
    const neutrons: THREE.Mesh[] = [];
    for (let i = 0; i < 22; i++) {
      const o = mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshBasicMaterial({ color: "#eac262" }),
        [0, 0, 0],
        undefined,
        plant,
      );
      o.castShadow = false;
      neutrons.push(o);
    }
    const atomParticles: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const o = mesh(
        new THREE.SphereGeometry(0.075, 12, 10),
        new THREE.MeshBasicMaterial({ color: "#da9b30" }),
        [0, 0, 0],
        undefined,
        atomic,
      );
      atomParticles.push(o);
    }
    // Enlarged, sectioned fuel rod beside the core: ceramic pellets inside cladding.
    const fuelDetail = new THREE.Group();
    fuelDetail.position.set(-1.5, 0, 1.1);
    plant.add(fuelDetail);
    fuelDetail.visible = props.view === "core";
    mesh(
      new THREE.CylinderGeometry(
        0.17,
        0.17,
        2.5,
        32,
        1,
        true,
        Math.PI * 0.4,
        Math.PI * 1.2,
      ),
      wallMat,
      [0, 1.5, 0],
      "fuel",
      fuelDetail,
    );
    for (let i = 0; i < 12; i++)
      cyl(0.132, 0.17, [0, 0.43 + i * 0.19, 0], gold, "fuel", fuelDetail);
    ring(0.18, 0.025, [0, 2.75, 0], steel, "fuel", fuelDetail);
    ring(0.18, 0.025, [0, 0.25, 0], steel, "fuel", fuelDetail);
    const labelLayer = document.createElement("div");
    labelLayer.className = "scene-labels";
    el.appendChild(labelLayer);
    const labelItems =
      props.view === "fission"
        ? [
            { name: "FUEL · FISSION", p: new THREE.Vector3(-2, 0.5, 0) },
            { name: "WATER · MODERATION", p: new THREE.Vector3(0.7, 0.1, 1.3) },
            {
              name: "CONTROL ROD · ABSORPTION",
              p: new THREE.Vector3(0.3, 4.1, 0.7),
            },
          ]
        : parts
            .filter(
              (p) =>
                [
                  "vessel",
                  "steam",
                  "turbine",
                  "condenser",
                  "pressuriser",
                  "rods",
                ].includes(p.id) &&
                (props.view === "plant" || ["vessel", "rods"].includes(p.id)),
            )
            .map((p) => ({
              name: p.name.toUpperCase(),
              p: positions[p.id]
                .clone()
                .add(new THREE.Vector3(0, p.id === "vessel" ? -1.7 : 1.2, 0)),
            }));
    if (props.view === "core")
      labelItems.push({
        name: "FUEL ROD DETAIL · PELLETS & CLADDING",
        p: new THREE.Vector3(-1.5, 3.05, 1.1),
      });
    const labelNodes = labelItems.map((item) => {
      const e = document.createElement("span");
      e.className = "scene-label";
      e.textContent = item.name;
      labelLayer.appendChild(e);
      return e;
    });
    let desiredPosition: THREE.Vector3 | null = null,
      desiredTarget: THREE.Vector3 | null = null;
    const home = () => {
      desiredPosition =
        props.view === "plant"
          ? new THREE.Vector3(10.3, 8.8, 13.3)
          : props.view === "core"
            ? new THREE.Vector3(1.2, 5.1, 6.1)
            : new THREE.Vector3(6, 4, 9);
      desiredTarget =
        props.view === "plant"
          ? new THREE.Vector3(0.2, 1.5, 0.35)
          : props.view === "core"
            ? new THREE.Vector3(rx, 1.9, 0)
            : new THREE.Vector3(0.1, 1.25, 0);
      if (latest.current.reduced) {
        camera.position.copy(desiredPosition);
        orbit.target.copy(desiredTarget);
        desiredPosition = null;
        desiredTarget = null;
      }
    };
    home();
    if (desiredPosition && desiredTarget) {
      camera.position.copy(desiredPosition);
      orbit.target.copy(desiredTarget);
      desiredPosition = null;
      desiredTarget = null;
    }
    orbit.update();
    api.current = {
      home,
      focus: () => {
        if (props.view === "fission") return;
        const p = positions[latest.current.selected];
        desiredTarget = p.clone();
        desiredPosition = p.clone().add(new THREE.Vector3(3.3, 2.2, 4.7));
      },
      zoom: (d) => {
        camera.position
          .sub(orbit.target)
          .multiplyScalar(d > 0 ? 0.8 : 1.25)
          .add(orbit.target);
        orbit.update();
      },
    };
    orbit.addEventListener("start", () => {
      desiredPosition = null;
      desiredTarget = null;
    });
    const ray = new THREE.Raycaster(),
      mouse = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const r = renderer.domElement.getBoundingClientRect();
      mouse.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(mouse, camera);
      const visible = pickables.filter((o) => {
        let node: THREE.Object3D | null = o;
        while (node) {
          if (!node.visible) return false;
          node = node.parent;
        }
        return true;
      });
      const hits = ray.intersectObjects(visible, false);
      if (hits[0]) latest.current.onSelect(hits[0].object.userData.id);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    const resize = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    resize.observe(el);
    let raf = 0;
    const projection = new THREE.Vector3();
    function animate() {
      const p = latest.current,
        t = p.state.time;
      rodBank.position.y = (1 - p.controls.rods / 100) * 1.65;
      envelope.visible = p.selected === "containment";
      materials.forEach(({ mat, id }) => {
        mat.emissive.set(id === p.selected ? "#76602e" : "#000000");
        mat.emissiveIntensity = id === p.selected ? 0.16 : 0;
      });
      const fg = fuelMesh.material as THREE.MeshStandardMaterial;
      fg.color.set(
        p.layer === "temperature"
          ? new THREE.Color().setHSL(
              Math.max(0, 0.14 - ((p.state.fuel - 450) / 350) * 0.14),
              0.68,
              0.49,
            )
          : "#c9944f",
      );
      flows.forEach((f) =>
        f.particles.forEach((o, i) => {
          o.visible = p.layer === "flow";
          const speed = f.primary
            ? p.controls.flow / 100
            : Math.max(0.08, p.state.electric);
          const u =
            ((p.reduced ? 0 : t * 0.065 * speed) +
              i / f.particles.length +
              f.offset) %
            1;
          o.position.copy(f.curve.getPointAt(u));
        }),
      );
      neutrons.forEach((o, i) => {
        o.visible =
          p.layer === "neutrons" && i < Math.round(p.state.neutrons * 13);
        o.position.set(
          rx + Math.sin(i * 5.6 + (p.reduced ? 0 : t) * 1.2) * 0.68,
          0.5 + ((i * 0.231 + (p.reduced ? 0 : t) * 0.4) % 1) * 1.8,
          Math.cos(i * 3.6 + (p.reduced ? 0 : t) * 0.8) * 0.65,
        );
      });
      const cycle = p.reduced ? 6 : t % 12;
      const split = Math.max(0, Math.min(1, (cycle - 3) / 2));
      nucleusMeshes.forEach(({ mesh, original, side }) => {
        mesh.position.copy(original);
        mesh.position.y += side * split * 0.53;
        mesh.position.x -= split * 0.15;
      });
      atomParticles.forEach((o, i) => {
        const start = nuclei[0];
        o.visible = true;
        if (i === 0) {
          o.visible = cycle < 3;
          o.position.lerpVectors(
            new THREE.Vector3(-4.8, 1.2, 0),
            start,
            Math.min(1, cycle / 3),
          );
          return;
        }
        const u = Math.max(0, (cycle - 3) / 7);
        o.visible = cycle >= 3;
        if (i === 1) {
          o.position.lerpVectors(
            start,
            new THREE.Vector3(0.3, 2.7, 0.7),
            Math.min(1, u * 1.6),
          );
          o.visible = o.visible && u < 0.625;
        }
        if (i === 2) {
          const moderated = u < 0.45 ? u * 1.5 : 0.675 + (u - 0.45) * 0.38;
          o.position.lerpVectors(
            start,
            new THREE.Vector3(2.3, 0.4, 0.4),
            Math.min(1, moderated),
          );
        }
        if (i === 3) {
          o.position.lerpVectors(
            start,
            new THREE.Vector3(1.2, 2, -0.4),
            Math.min(1, u * 1.2),
          );
          o.visible = o.visible && u < 0.834;
        }
      });
      if (!p.reduced)
        rotor.rotation.x = t * 0.6 * Math.max(0.05, p.state.electric);
      if (desiredPosition && desiredTarget) {
        camera.position.lerp(desiredPosition, p.reduced ? 1 : 0.08);
        orbit.target.lerp(desiredTarget, p.reduced ? 1 : 0.08);
        if (camera.position.distanceTo(desiredPosition) < 0.02) {
          desiredPosition = null;
          desiredTarget = null;
        }
      }
      orbit.update();
      renderer.render(scene, camera);
      labelLayer.style.display = p.labels ? "block" : "none";
      labelItems.forEach((l, i) => {
        projection.copy(l.p).project(camera);
        labelNodes[i].style.transform =
          `translate(${(projection.x * 0.5 + 0.5) * el.clientWidth}px,${(-projection.y * 0.5 + 0.5) * el.clientHeight}px) translate(-50%,-50%)`;
        labelNodes[i].style.visibility =
          projection.z < 1 ? "visible" : "hidden";
      });
      raf = requestAnimationFrame(animate);
    }
    animate();
    const lost = (e: Event) => {
      e.preventDefault();
      latest.current.onError();
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      orbit.dispose();
      api.current = null;
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      el.replaceChildren();
    };
  }, [props.view, props.cutaway, props.exploded, props.reduced]);
  return <div ref={host} className="three-host" />;
}
