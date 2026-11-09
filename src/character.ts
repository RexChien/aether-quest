import * as THREE from 'three';

export interface CharacterController {
  mesh: THREE.Group;
  swordMesh: THREE.Mesh;
  shieldMesh: THREE.Mesh;
  trailMesh: THREE.Mesh;
  animState: 'idle' | 'run' | 'attack' | 'whirlwind' | 'beam' | 'dash' | 'hit';
  animTimer: number;
  comboStep: number;
  isDashing: boolean;
  dashDuration: number;
  dashTimer: number;
  dashDir: THREE.Vector3;
  update: (delta: number, isMoving: boolean) => void;
  triggerAttack: (combo: number) => void;
  triggerDash: (dir: THREE.Vector3) => void;
  triggerWhirlwind: () => void;
  triggerBeam: () => void;
  setNameTag: (name: string, hp: number, maxHp: number) => void;
  setColor: (colorHex: number | string) => void;
}

export function createCharacter(tunicColorHex: number = 0x2e86de, isLocalPlayer: boolean = false): CharacterController {
  const group = new THREE.Group();

  // Root anchor
  const root = new THREE.Group();
  group.add(root);

  // Materials
  const tunicMat = new THREE.MeshStandardMaterial({
    color: tunicColorHex,
    roughness: 0.6,
    metalness: 0.2
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffdfba, // Warm skin
    roughness: 0.8
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0xc83e2a, // Fiery red (Adol style) or customizable
    roughness: 0.7
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.85,
    roughness: 0.25
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf1c40f,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x443300
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.9
  });

  // Body / Torso
  const torsoGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.2, 8);
  const torso = new THREE.Mesh(torsoGeo, tunicMat);
  torso.position.y = 1.3;
  torso.castShadow = true;
  root.add(torso);

  // Belt & Gold buckle
  const beltGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.2, 8);
  const belt = new THREE.Mesh(beltGeo, leatherMat);
  belt.position.y = 0.9;
  root.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, goldMat);
  buckle.position.set(0, 0.9, 0.52);
  root.add(buckle);

  // Head
  const headGeo = new THREE.SphereGeometry(0.48, 12, 12);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 2.2;
  head.castShadow = true;
  root.add(head);

  // Hair (Stylized anime spiky top)
  const hairGroup = new THREE.Group();
  head.add(hairGroup);
  const hairBaseGeo = new THREE.SphereGeometry(0.52, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
  hairBase.position.y = 0.1;
  hairGroup.add(hairBase);

  // Front bangs / tufts
  for (let i = -2; i <= 2; i++) {
    const tuftGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    const tuft = new THREE.Mesh(tuftGeo, hairMat);
    tuft.position.set(i * 0.15, 0.2, 0.45);
    tuft.rotation.x = 0.6;
    tuft.rotation.z = -i * 0.2;
    hairGroup.add(tuft);
  }

  // Cape
  const capeGeo = new THREE.PlaneGeometry(0.9, 1.4, 4, 4);
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x1b1b2f,
    side: THREE.DoubleSide,
    roughness: 0.8
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.4, -0.45);
  cape.rotation.x = 0.1;
  cape.castShadow = true;
  root.add(cape);

  // Left Leg & Right Leg
  const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.9, 6);
  const leftLeg = new THREE.Mesh(legGeo, leatherMat);
  leftLeg.position.set(-0.25, 0.45, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, leatherMat);
  rightLeg.position.set(0.25, 0.45, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // Left Arm (Shield arm)
  const armGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.8, 6);
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.65, 1.7, 0);
  root.add(leftArmGroup);

  const leftArm = new THREE.Mesh(armGeo, tunicMat);
  leftArm.position.y = -0.4;
  leftArm.castShadow = true;
  leftArmGroup.add(leftArm);

  // Round Shield
  const shieldGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16);
  shieldGeo.rotateX(Math.PI / 2);
  const shieldMesh = new THREE.Mesh(shieldGeo, goldMat);
  shieldMesh.position.set(-0.2, -0.4, 0.2);
  shieldMesh.castShadow = true;
  leftArmGroup.add(shieldMesh);

  // Right Arm (Sword arm)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.65, 1.7, 0);
  root.add(rightArmGroup);

  const rightArm = new THREE.Mesh(armGeo, tunicMat);
  rightArm.position.y = -0.4;
  rightArm.castShadow = true;
  rightArmGroup.add(rightArm);

  // Sword Hand Node
  const swordHandNode = new THREE.Group();
  swordHandNode.position.set(0, -0.7, 0.2);
  rightArmGroup.add(swordHandNode);

  // Sword Blade & Crossguard
  const swordGeo = new THREE.BoxGeometry(0.15, 1.4, 0.04);
  swordGeo.translate(0, 0.7, 0);
  const swordMat = new THREE.MeshStandardMaterial({
    color: 0xebf3f5,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x00d4ff,
    emissiveIntensity: 0.4
  });
  const swordMesh = new THREE.Mesh(swordGeo, swordMat);
  swordMesh.castShadow = true;

  const crossguardGeo = new THREE.BoxGeometry(0.55, 0.1, 0.1);
  const crossguard = new THREE.Mesh(crossguardGeo, goldMat);
  swordMesh.add(crossguard);

  const pommelGeo = new THREE.SphereGeometry(0.1, 6, 6);
  const pommel = new THREE.Mesh(pommelGeo, goldMat);
  pommel.position.y = -0.2;
  swordMesh.add(pommel);

  swordHandNode.add(swordMesh);

  // Sword Slash Trail Ribbon
  const trailGeo = new THREE.RingGeometry(0.8, 1.8, 16, 1, 0, Math.PI * 0.75);
  trailGeo.rotateX(-Math.PI / 2);
  const trailMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const trailMesh = new THREE.Mesh(trailGeo, trailMat);
  trailMesh.position.set(0, 1.1, 0.6);
  group.add(trailMesh);

  // Overhead Name & HP Canvas Tag
  const tagCanvas = document.createElement('canvas');
  tagCanvas.width = 256;
  tagCanvas.height = 64;
  const tagCtx = tagCanvas.getContext('2d')!;
  const tagTexture = new THREE.CanvasTexture(tagCanvas);
  const tagMat = new THREE.SpriteMaterial({ map: tagTexture, depthTest: false });
  const tagSprite = new THREE.Sprite(tagMat);
  tagSprite.position.set(0, 3.2, 0);
  tagSprite.scale.set(3.2, 0.8, 1);
  group.add(tagSprite);

  const drawNameTag = (name: string, hp: number, maxHp: number) => {
    tagCtx.clearRect(0, 0, 256, 64);
    // Background pill
    tagCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    tagCtx.roundRect(10, 4, 236, 56, 10);
    tagCtx.fill();

    // Player Name
    tagCtx.fillStyle = isLocalPlayer ? '#f1c40f' : '#ffffff';
    tagCtx.font = 'bold 20px sans-serif';
    tagCtx.textAlign = 'center';
    tagCtx.fillText(name, 128, 28);

    // HP Bar
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    tagCtx.fillStyle = '#333333';
    tagCtx.fillRect(30, 38, 196, 12);
    tagCtx.fillStyle = pct > 0.5 ? '#2ecc71' : pct > 0.25 ? '#f39c12' : '#e74c3c';
    tagCtx.fillRect(30, 38, 196 * pct, 12);

    tagTexture.needsUpdate = true;
  };

  drawNameTag(isLocalPlayer ? 'Hero (You)' : 'Adventurer', 100, 100);

  // Controller State
  const controller: CharacterController = {
    mesh: group,
    swordMesh,
    shieldMesh,
    trailMesh,
    animState: 'idle',
    animTimer: 0,
    comboStep: 0,
    isDashing: false,
    dashDuration: 0.25,
    dashTimer: 0,
    dashDir: new THREE.Vector3(),

    setNameTag: (name: string, hp: number, maxHp: number) => {
      drawNameTag(name, hp, maxHp);
    },

    setColor: (colorHex: number | string) => {
      tunicMat.color.set(colorHex as any);
    },

    triggerAttack: (combo: number) => {
      controller.animState = 'attack';
      controller.comboStep = combo;
      controller.animTimer = 0;
      trailMat.opacity = 0.85;
    },

    triggerDash: (dir: THREE.Vector3) => {
      controller.isDashing = true;
      controller.animState = 'dash';
      controller.dashTimer = 0;
      controller.dashDir.copy(dir).normalize();
    },

    triggerWhirlwind: () => {
      controller.animState = 'whirlwind';
      controller.animTimer = 0;
      trailMat.opacity = 0.95;
    },

    triggerBeam: () => {
      controller.animState = 'beam';
      controller.animTimer = 0;
    },

    update: (delta: number, isMoving: boolean) => {
      // Cape animation
      const elapsed = performance.now() * 0.005;
      cape.rotation.x = 0.15 + (isMoving ? 0.35 : 0.08) + Math.sin(elapsed * 2) * 0.1;

      // Fade out trail mesh
      if (trailMat.opacity > 0) {
        trailMat.opacity = Math.max(0, trailMat.opacity - delta * 4);
      }

      // Handle Dashing
      if (controller.isDashing) {
        controller.dashTimer += delta;
        root.rotation.x = (controller.dashTimer / controller.dashDuration) * Math.PI * 2;
        group.position.addScaledVector(controller.dashDir, delta * 24);
        if (controller.dashTimer >= controller.dashDuration) {
          controller.isDashing = false;
          root.rotation.x = 0;
          controller.animState = isMoving ? 'run' : 'idle';
        }
        return;
      }

      // Handle Attack Animation
      if (controller.animState === 'attack') {
        controller.animTimer += delta;
        const duration = 0.28;
        const t = Math.min(1, controller.animTimer / duration);

        if (controller.comboStep === 1) {
          // Horizontal Slash from right to left
          rightArmGroup.rotation.z = Math.sin(t * Math.PI) * -1.8;
          rightArmGroup.rotation.y = Math.sin(t * Math.PI) * 1.5;
          swordMesh.rotation.z = 0.5 + Math.sin(t * Math.PI) * 1.2;
        } else if (controller.comboStep === 2) {
          // Reverse Slash from left upwards
          rightArmGroup.rotation.z = Math.sin(t * Math.PI) * 1.6;
          rightArmGroup.rotation.x = Math.sin(t * Math.PI) * -1.2;
          swordMesh.rotation.z = -0.5 - Math.sin(t * Math.PI) * 1.0;
        } else {
          // Overhead Jump Slam
          rightArmGroup.rotation.x = Math.sin(t * Math.PI) * 2.8;
          root.position.y = Math.sin(t * Math.PI) * 0.6;
          swordMesh.rotation.x = Math.sin(t * Math.PI) * 1.5;
        }

        if (t >= 1) {
          controller.animState = isMoving ? 'run' : 'idle';
          rightArmGroup.rotation.set(0, 0, 0);
          root.position.y = 0;
        }
        return;
      }

      // Handle Whirlwind Spin
      if (controller.animState === 'whirlwind') {
        controller.animTimer += delta;
        const totalDuration = 0.8;
        root.rotation.y += delta * 25;
        rightArmGroup.rotation.z = -1.5; // Arms out
        leftArmGroup.rotation.z = 1.5;
        trailMesh.rotation.z += delta * 20;

        if (controller.animTimer >= totalDuration) {
          controller.animState = isMoving ? 'run' : 'idle';
          root.rotation.y = 0;
          rightArmGroup.rotation.set(0, 0, 0);
          leftArmGroup.rotation.set(0, 0, 0);
        }
        return;
      }

      // Handle Sky Beam Cast
      if (controller.animState === 'beam') {
        controller.animTimer += delta;
        rightArmGroup.rotation.x = 2.9; // Sword raised high to heavens
        swordMat.emissiveIntensity = 2.0;

        if (controller.animTimer >= 0.5) {
          controller.animState = isMoving ? 'run' : 'idle';
          rightArmGroup.rotation.set(0, 0, 0);
          swordMat.emissiveIntensity = 0.4;
        }
        return;
      }

      // Running animation
      if (isMoving) {
        controller.animState = 'run';
        const walkCycle = performance.now() * 0.012;
        leftLeg.rotation.x = Math.sin(walkCycle) * 0.7;
        rightLeg.rotation.x = -Math.sin(walkCycle) * 0.7;
        leftArmGroup.rotation.x = -Math.sin(walkCycle) * 0.5;
        rightArmGroup.rotation.x = Math.sin(walkCycle) * 0.5;
        root.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.12;
      } else {
        // Idle breathing
        controller.animState = 'idle';
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArmGroup.rotation.set(0, 0, 0);
        rightArmGroup.rotation.set(0, 0, 0);
        const breath = Math.sin(performance.now() * 0.003) * 0.04;
        root.position.y = breath;
        torso.scale.y = 1 + breath * 0.5;
      }
    }
  };

  return controller;
}
