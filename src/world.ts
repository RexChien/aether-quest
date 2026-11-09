import * as THREE from 'three';

export interface WorldEnvironment {
  scene: THREE.Scene;
  terrainGroup: THREE.Group;
  waterMesh: THREE.Mesh;
  crystals: THREE.Mesh[];
  lightPillars: THREE.Mesh[];
  update: (delta: number, elapsed: number) => void;
  isWalkable: (x: number, z: number) => boolean;
}

export function createWorld(scene: THREE.Scene): WorldEnvironment {
  scene.background = new THREE.Color(0xa0d8ef); // Sky cyan
  scene.fog = new THREE.FogExp2(0xa0d8ef, 0.012);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xfff7e6, 0x446655, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  dirLight.position.set(40, 60, 30);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 150;
  const d = 55;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  const terrainGroup = new THREE.Group();
  scene.add(terrainGroup);

  // 1. Main Island Ground
  const groundGeo = new THREE.CylinderGeometry(50, 46, 6, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x567d46, // Lush Grass green
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -3;
  groundMesh.receiveShadow = true;
  terrainGroup.add(groundMesh);

  // Cobblestone Central Plaza
  const plazaGeo = new THREE.CylinderGeometry(14, 14, 0.2, 16);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0x8a9597, // Stone grey
    roughness: 0.9,
    flatShading: true
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.05, 0);
  plaza.receiveShadow = true;
  terrainGroup.add(plaza);

  // Pathways radiating out
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x9e8a6d, roughness: 0.95 });
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach(angle => {
    const pathGeo = new THREE.BoxGeometry(4, 0.15, 30);
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.y = angle;
    path.position.set(Math.sin(angle) * 18, 0.03, Math.cos(angle) * 18);
    path.receiveShadow = true;
    terrainGroup.add(path);
  });

  // 2. Water Stream / Moat section
  const waterGeo = new THREE.PlaneGeometry(120, 120, 24, 24);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2b82c9,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = -5.8;
  scene.add(waterMesh);

  // 3. Ancient Stone Pillars & Ruins
  const pillarGeo = new THREE.CylinderGeometry(1.2, 1.4, 7, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xa5a58d,
    roughness: 0.85,
    flatShading: true
  });

  const pillarPositions = [
    [-12, -12], [12, -12], [-12, 12], [12, 12],
    [-24, -5], [-24, 5], [24, -5], [24, 5],
    [0, -28], [0, 28]
  ];

  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, 3.5, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    terrainGroup.add(pillar);

    // Add broken stone top or ivy
    const capGeo = new THREE.BoxGeometry(3, 0.8, 3);
    const cap = new THREE.Mesh(capGeo, pillarMat);
    cap.position.set(px, 7.2, pz);
    cap.castShadow = true;
    terrainGroup.add(cap);
  });

  // 4. Glowing Aether Crystals (floating and pulsing)
  const crystals: THREE.Mesh[] = [];
  const crystalGeo = new THREE.OctahedronGeometry(1.6, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x0088cc,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.9,
    transparent: true,
    opacity: 0.9
  });

  const crystalSpots = [
    [0, 3, 0], // Center sanctuary crystal
    [-18, 2.5, -18],
    [18, 2.5, -18],
    [-18, 2.5, 18],
    [18, 2.5, 18],
    [0, 3, -34] // Boss altar crystal
  ];

  crystalSpots.forEach(([cx, cy, cz], idx) => {
    const cMesh = new THREE.Mesh(crystalGeo, crystalMat);
    cMesh.position.set(cx, cy, cz);
    cMesh.castShadow = true;
    terrainGroup.add(cMesh);
    crystals.push(cMesh);

    // Add point light
    const pLight = new THREE.PointLight(0x00f0ff, idx === 0 ? 2.5 : 1.2, 14);
    pLight.position.set(cx, cy, cz);
    terrainGroup.add(pLight);
  });

  // 5. Stylized Low-Poly Fantasy Trees & Rocks
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
  const foliageGeo1 = new THREE.ConeGeometry(3.2, 5, 6);
  const foliageGeo2 = new THREE.ConeGeometry(2.4, 4, 6);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.8, flatShading: true });
  const foliageMatAutumn = new THREE.MeshStandardMaterial({ color: 0xc45c26, roughness: 0.8, flatShading: true });

  const treeCoords = [
    [-8, -20], [-15, -28], [-30, -15], [-35, 0], [-28, 22],
    [8, -22], [22, -26], [32, -10], [36, 12], [26, 26],
    [-10, 32], [14, 30], [-25, -32], [28, -30]
  ];

  treeCoords.forEach(([tx, tz], i) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const fMat = i % 3 === 0 ? foliageMatAutumn : foliageMat;
    const f1 = new THREE.Mesh(foliageGeo1, fMat);
    f1.position.y = 5;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(foliageGeo2, fMat);
    f2.position.y = 7.2;
    f2.castShadow = true;
    treeGroup.add(f2);

    terrainGroup.add(treeGroup);
  });

  // Rocks
  const rockGeo = new THREE.DodecahedronGeometry(1.5, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e706e, roughness: 0.9, flatShading: true });
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 32 + (i % 5) * 2;
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(Math.cos(angle) * dist, 0.7, Math.sin(angle) * dist);
    rock.scale.set(1 + (i % 3) * 0.4, 0.8 + (i % 2) * 0.5, 1.2);
    rock.rotation.set(i, i * 2, 0);
    rock.castShadow = true;
    terrainGroup.add(rock);
  }

  // Boss Arena Dais (North side)
  const bossDaisGeo = new THREE.CylinderGeometry(12, 13, 1, 16);
  const bossDaisMat = new THREE.MeshStandardMaterial({
    color: 0x403d39,
    roughness: 0.7,
    flatShading: true
  });
  const bossDais = new THREE.Mesh(bossDaisGeo, bossDaisMat);
  bossDais.position.set(0, 0.5, -34);
  bossDais.receiveShadow = true;
  terrainGroup.add(bossDais);

  return {
    scene,
    terrainGroup,
    waterMesh,
    crystals,
    lightPillars: [],
    update: (_delta: number, elapsed: number) => {
      // Floating crystals animation
      crystals.forEach((c, idx) => {
        c.rotation.y = elapsed * 0.8 + idx;
        c.position.y = (idx === 0 ? 3 : 2.5) + Math.sin(elapsed * 2 + idx) * 0.4;
      });
      // Water gentle wave
      waterMesh.position.y = -5.8 + Math.sin(elapsed * 1.5) * 0.15;
    },
    isWalkable: (x: number, z: number) => {
      // Circular island boundary with radius 47
      const distSq = x * x + z * z;
      if (distSq > 47 * 47) return false;

      // Obstacle collision with pillars
      for (const [px, pz] of pillarPositions) {
        const dx = x - px;
        const dz = z - pz;
        if (dx * dx + dz * dz < 2.5 * 2.5) return false;
      }
      return true;
    }
  };
}
