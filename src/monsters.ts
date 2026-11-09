import * as THREE from 'three';
import { Monster, MonsterType, Item } from './types';
import { sound } from './audio';

export interface MonsterManager {
  monsters: Monster[];
  update: (delta: number, playerPos: THREE.Vector3, onDamagePlayer: (dmg: number) => void) => void;
  damageMonster: (monsterId: string, dmg: number, knockDir: THREE.Vector3) => { isDead: boolean; monster: Monster } | null;
  resetAll: () => void;
}

export function createMonsterManager(scene: THREE.Scene, onMonsterKilled: (m: Monster, pos: THREE.Vector3) => void): MonsterManager {
  const monsters: Monster[] = [];

  const slimeGeo = new THREE.SphereGeometry(0.9, 12, 10);
  slimeGeo.scale(1, 0.75, 1);
  const slimeMat = new THREE.MeshStandardMaterial({
    color: 0x4cd137,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
    emissive: 0x104e10,
    emissiveIntensity: 0.2
  });

  const stalkerGeo = new THREE.ConeGeometry(0.8, 1.8, 5);
  stalkerGeo.rotateX(Math.PI / 2);
  const stalkerMat = new THREE.MeshStandardMaterial({
    color: 0x00a8ff,
    roughness: 0.4,
    metalness: 0.6,
    emissive: 0x0055aa,
    emissiveIntensity: 0.4
  });

  const skeletonGeo = new THREE.CylinderGeometry(0.35, 0.3, 1.5, 6);
  const skeletonMat = new THREE.MeshStandardMaterial({
    color: 0xdedede,
    roughness: 0.8,
    metalness: 0.2
  });

  // Boss Geometry
  const bossTorsoGeo = new THREE.BoxGeometry(4.2, 5, 2.5);
  const bossMat = new THREE.MeshStandardMaterial({
    color: 0x2f3640,
    roughness: 0.7,
    metalness: 0.4,
    flatShading: true
  });
  const bossCoreMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.5
  });

  // Telegraph ring geometry
  const telegraphGeo = new THREE.RingGeometry(0.1, 2.5, 24);
  telegraphGeo.rotateX(-Math.PI / 2);
  const telegraphMat = new THREE.MeshBasicMaterial({
    color: 0xff3838,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });

  const spawnMonster = (type: MonsterType, x: number, z: number, id: string): Monster => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);

    let maxHp = 80;
    let attack = 12;
    let defense = 4;
    let speed = 4;
    let range = 2.2;
    let aggroRadius = 14;
    let name = '綠晶史萊姆 (Forest Slime)';

    if (type === 'slime') {
      const mesh = new THREE.Mesh(slimeGeo, slimeMat.clone());
      mesh.position.y = 0.6;
      mesh.castShadow = true;
      group.add(mesh);

      // Cute black eye dots
      const eyeGeo = new THREE.SphereGeometry(0.1, 4, 4);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.25, 0.7, 0.7);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.25, 0.7, 0.7);
      group.add(leftEye, rightEye);

      maxHp = 60;
      attack = 8;
      speed = 3.2;
      range = 1.8;
      aggroRadius = 12;
      name = '綠晶史萊姆 (Forest Slime)';
    } else if (type === 'stalker') {
      const mesh = new THREE.Mesh(stalkerGeo, stalkerMat.clone());
      mesh.position.y = 1.0;
      mesh.castShadow = true;
      group.add(mesh);

      // Glowing Horn
      const hornGeo = new THREE.ConeGeometry(0.2, 0.8, 4);
      const hornMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, 1.6, 0.5);
      horn.rotation.x = 0.5;
      group.add(horn);

      maxHp = 120;
      attack = 18;
      speed = 5.8;
      range = 2.4;
      aggroRadius = 16;
      name = '蒼空獵手 (Crystal Stalker)';
    } else if (type === 'skeleton') {
      const mesh = new THREE.Mesh(skeletonGeo, skeletonMat.clone());
      mesh.position.y = 1.2;
      mesh.castShadow = true;
      group.add(mesh);

      // Skull
      const skullGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const skull = new THREE.Mesh(skullGeo, skeletonMat.clone());
      skull.position.y = 2.1;
      skull.castShadow = true;
      group.add(skull);

      // Sword
      const swordGeo = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      const sword = new THREE.Mesh(swordGeo, skeletonMat.clone());
      sword.position.set(0.6, 1.2, 0.3);
      group.add(sword);

      maxHp = 180;
      attack = 24;
      defense = 8;
      speed = 3.8;
      range = 2.5;
      aggroRadius = 15;
      name = '遠古骸骨守衛 (Skeleton Guardian)';
    } else if (type === 'boss') {
      // BOSS: Ancient Aether Titan
      const mesh = new THREE.Mesh(bossTorsoGeo, bossMat.clone());
      mesh.position.y = 4;
      mesh.castShadow = true;
      group.add(mesh);

      // Glowing Aether Core in chest
      const coreGeo = new THREE.OctahedronGeometry(1.2, 1);
      const core = new THREE.Mesh(coreGeo, bossCoreMat);
      core.position.set(0, 4, 1.3);
      group.add(core);

      // Giant Stone Shoulder Pads
      const shoulderGeo = new THREE.BoxGeometry(2, 2, 2);
      const leftShoulder = new THREE.Mesh(shoulderGeo, bossMat.clone());
      leftShoulder.position.set(-3.2, 5.5, 0);
      const rightShoulder = new THREE.Mesh(shoulderGeo, bossMat.clone());
      rightShoulder.position.set(3.2, 5.5, 0);
      group.add(leftShoulder, rightShoulder);

      // Boss Head
      const headGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
      const head = new THREE.Mesh(headGeo, bossMat.clone());
      head.position.set(0, 6.8, 0);
      group.add(head);

      // Glowing eyes
      const eyeLight = new THREE.PointLight(0x00f0ff, 3, 10);
      eyeLight.position.set(0, 6.8, 1.2);
      group.add(eyeLight);

      maxHp = 1200;
      attack = 45;
      defense = 18;
      speed = 2.5;
      range = 5.0;
      aggroRadius = 24;
      name = '【太古以太巨像・泰坦】(Aether Titan)';
    }

    // Telegraph indicator mesh
    const tMesh = new THREE.Mesh(telegraphGeo, telegraphMat.clone());
    tMesh.position.y = 0.05;
    tMesh.scale.set(type === 'boss' ? 2.5 : 1, type === 'boss' ? 2.5 : 1, 1);
    group.add(tMesh);

    return {
      id,
      name,
      type,
      meshGroup: group,
      x,
      y: 0,
      z,
      hp: maxHp,
      maxHp,
      attack,
      defense,
      speed,
      range,
      aggroRadius,
      state: 'idle',
      timer: 0,
      targetId: null,
      targetPos: { x, z },
      telegraphMesh: tMesh,
      lootTable: []
    };
  };

  const initAllMonsters = () => {
    // Clean existing
    monsters.forEach(m => scene.remove(m.meshGroup));
    monsters.length = 0;

    // Slimes in grasslands
    const slimeCoords = [
      [-10, 8], [-14, 15], [10, 10], [15, 18], [-6, -14], [8, -15], [-20, 2]
    ];
    slimeCoords.forEach(([sx, sz], i) => {
      monsters.push(spawnMonster('slime', sx, sz, `slime_${i}`));
    });

    // Stalkers roaming edge
    const stalkerCoords = [
      [-26, -18], [26, -18], [-28, 14], [28, 14]
    ];
    stalkerCoords.forEach(([sx, sz], i) => {
      monsters.push(spawnMonster('stalker', sx, sz, `stalker_${i}`));
    });

    // Skeleton Guardians near ancient ruins
    const skelCoords = [
      [-12, -24], [12, -24], [0, -22]
    ];
    skelCoords.forEach(([sx, sz], i) => {
      monsters.push(spawnMonster('skeleton', sx, sz, `skel_${i}`));
    });

    // Boss on North Dais
    monsters.push(spawnMonster('boss', 0, -34, 'boss_titan'));
  };

  initAllMonsters();

  const update = (delta: number, playerPos: THREE.Vector3, onDamagePlayer: (dmg: number) => void) => {
    const elapsed = performance.now() * 0.003;

    monsters.forEach(m => {
      if (m.state === 'dead') return;

      const group = m.meshGroup;
      const dx = playerPos.x - group.position.x;
      const dz = playerPos.z - group.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Slime squish idle animation
      if (m.type === 'slime') {
        const squish = 1 + Math.sin(elapsed * 4 + group.position.x) * 0.15;
        group.scale.set(squish, 2 - squish, squish);
      } else if (m.type === 'boss') {
        // Floating boss breathing
        group.position.y = Math.sin(elapsed * 1.5) * 0.2;
      }

      // State Machine
      if (m.state === 'idle') {
        m.telegraphMesh.material.opacity = 0;
        if (dist < m.aggroRadius) {
          m.state = 'chase';
        }
      } else if (m.state === 'chase') {
        m.telegraphMesh.material.opacity = 0;
        // Look at player
        group.rotation.y = Math.atan2(dx, dz);

        if (dist <= m.range) {
          // Enter Windup / Telegraph
          m.state = 'windup';
          m.timer = 0;
        } else {
          // Move towards player
          const moveDist = m.speed * delta;
          group.position.x += (dx / dist) * moveDist;
          group.position.z += (dz / dist) * moveDist;
        }
      } else if (m.state === 'windup') {
        m.timer += delta;
        const windupDuration = m.type === 'boss' ? 1.2 : 0.6;
        const progress = Math.min(1, m.timer / windupDuration);

        // Flash telegraph circle on ground
        m.telegraphMesh.material.opacity = 0.2 + progress * 0.6;
        m.telegraphMesh.scale.setScalar((m.type === 'boss' ? 2.5 : 1) * (0.8 + progress * 0.4));

        if (m.timer >= windupDuration) {
          // Execute Attack
          m.state = 'attack';
          m.timer = 0;
          m.telegraphMesh.material.opacity = 0;

          if (dist <= m.range * 1.3) {
            sound.monsterHit();
            onDamagePlayer(m.attack);
          }
        }
      } else if (m.state === 'attack') {
        m.timer += delta;
        if (m.timer >= 0.4) {
          m.state = 'cooldown';
          m.timer = 0;
        }
      } else if (m.state === 'cooldown') {
        m.timer += delta;
        const cd = m.type === 'boss' ? 1.5 : 0.8;
        if (m.timer >= cd) {
          m.state = dist < m.aggroRadius ? 'chase' : 'idle';
        }
      }

      m.x = group.position.x;
      m.z = group.position.z;
    });
  };

  const damageMonster = (monsterId: string, dmg: number, knockDir: THREE.Vector3) => {
    const m = monsters.find(mon => mon.id === monsterId);
    if (!m || m.state === 'dead') return null;

    const actualDmg = Math.max(1, dmg - Math.floor(m.defense * 0.5));
    m.hp -= actualDmg;

    // Knockback
    m.meshGroup.position.addScaledVector(knockDir.normalize(), m.type === 'boss' ? 0.3 : 1.2);

    // Hit flash
    const mainChild = m.meshGroup.children[0] as THREE.Mesh;
    if (mainChild && (mainChild.material as any).emissive) {
      const origEmissive = (mainChild.material as any).emissive.getHex();
      (mainChild.material as any).emissive.setHex(0xffffff);
      setTimeout(() => {
        if (mainChild && (mainChild.material as any).emissive) {
          (mainChild.material as any).emissive.setHex(origEmissive);
        }
      }, 100);
    }

    if (m.hp <= 0) {
      m.state = 'dead';
      m.hp = 0;
      const deathPos = m.meshGroup.position.clone();
      scene.remove(m.meshGroup);
      onMonsterKilled(m, deathPos);
      return { isDead: true, monster: m };
    }

    return { isDead: false, monster: m };
  };

  return {
    monsters,
    update,
    damageMonster,
    resetAll: initAllMonsters
  };
}
