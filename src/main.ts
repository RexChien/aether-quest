import * as THREE from 'three';
import { createWorld } from './world';
import { createCharacter } from './character';
import { createMonsterManager } from './monsters';
import { LootManager } from './loot';
import { initNetwork, NetworkManager } from './network';
import { sound } from './audio';
import { PlayerStats, Item, Monster } from './types';

// Room ID from URL hash (#room=xyz) or default
const urlParams = new URLSearchParams(window.location.hash.replace('#', '?'));
const currentRoomId = urlParams.get('room') || 'aether-prime';

// Canvas & Scene setup
const container = document.getElementById('canvas-container')!;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 250);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// World & Environment
const world = createWorld(scene);

// Local Hero setup
const playerColor = 0x2e86de; // Blue tunic
const hero = createCharacter(playerColor, true);
scene.add(hero.mesh);
hero.mesh.position.set(0, 0, 8); // Start in front of central plaza

// Player RPG Stats
const stats: PlayerStats = {
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 120,
  maxHp: 120,
  mp: 80,
  maxMp: 80,
  stamina: 100,
  maxStamina: 100,
  baseAttack: 15,
  baseDefense: 6,
  gold: 0
};

// Loot Manager
const lootManager = new LootManager(scene);

// Floating Combat Text helper
const damageLayer = document.getElementById('damage-layer')!;
function spawnFloatingText(pos: THREE.Vector3, text: string, color: string = '#f1c40f') {
  const tempV = pos.clone();
  tempV.project(camera);
  const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;

  const el = document.createElement('div');
  el.className = 'f-text';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.innerText = text;
  damageLayer.appendChild(el);

  setTimeout(() => el.remove(), 750);
}

// Loot Toast
const lootToast = document.getElementById('loot-toast')!;
function showLootToast(item: Item) {
  lootToast.innerText = `✨ 獲得了裝備：[${item.name}] (${item.rarity.toUpperCase()})`;
  lootToast.style.display = 'block';
  setTimeout(() => {
    lootToast.style.display = 'none';
  }, 2400);
}

// Monsters Manager
const monsterManager = createMonsterManager(scene, (m: Monster, pos: THREE.Vector3) => {
  // Monster Killed Callback
  sound.monsterHit();
  spawnFloatingText(pos, '+EXP ' + (m.type === 'boss' ? '250' : '40'), '#00f0ff');

  // Give EXP
  stats.exp += m.type === 'boss' ? 250 : 40;
  if (stats.exp >= stats.maxExp) {
    stats.level++;
    stats.exp -= stats.maxExp;
    stats.maxExp = Math.floor(stats.maxExp * 1.5);
    stats.maxHp += 25;
    stats.hp = stats.maxHp;
    stats.maxMp += 15;
    stats.mp = stats.maxMp;
    stats.baseAttack += 5;
    stats.baseDefense += 2;
    sound.levelUp();
    spawnFloatingText(hero.mesh.position, 'LEVEL UP! Lv.' + stats.level, '#ffd700');
  }

  // Drop Loot
  const dropped = lootManager.generateRandomItem(stats.level, m.type === 'boss');
  lootManager.spawnLootOnGround(dropped, pos);
});

// Network Manager (Trystero P2P)
let network: NetworkManager | null = null;
try {
  network = initNetwork(
    scene,
    currentRoomId,
    (peerId) => {
      addChatMessage(`[系統] 冒險者 (${peerId.slice(0, 4)}) 加入了房間！`, '#2ed573');
      updatePeersBadge();
    },
    (peerId) => {
      addChatMessage(`[系統] 冒險者 (${peerId.slice(0, 4)}) 離開了房間。`, '#ff4757');
      updatePeersBadge();
    }
  );

  network.onMonsterHitReceived(({ monsterId, damage }) => {
    const targetMonster = monsterManager.monsters.find(m => m.id === monsterId);
    if (targetMonster) {
      monsterManager.damageMonster(monsterId, damage, new THREE.Vector3(0, 0, 0));
      spawnFloatingText(targetMonster.meshGroup.position, `-${damage}`, '#ff9f43');
    }
  });

  network.onChatReceived(({ text, senderName }) => {
    addChatMessage(`[${senderName}]: ${text}`, '#00d2d3');
  });
} catch (e) {
  console.warn('Network offline or WebRTC error:', e);
}

function updatePeersBadge() {
  const peersCount = network ? network.connectedPeersCount + 1 : 1;
  const countEl = document.getElementById('peers-count-text');
  if (countEl) countEl.innerText = `(${peersCount}人)`;
}

// Input state
const keys: Record<string, boolean> = {};
const moveVec = new THREE.Vector3();

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  sound.startBGM();

  if (e.code === 'Space') {
    e.preventDefault();
    triggerHeroAttack();
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    e.preventDefault();
    triggerHeroDash();
  } else if (e.code === 'Digit1') {
    triggerSkill1();
  } else if (e.code === 'Digit2') {
    triggerSkill2();
  } else if (e.code === 'Digit3') {
    triggerSkill3();
  } else if (e.code === 'KeyB') {
    toggleInventory();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Skill Cooldowns
const cooldowns = {
  dash: 0,
  skill1: 0, // Whirlwind
  skill2: 0, // Aether Beam
  skill3: 0  // Sanctuary Heal
};

// Attack Combo handling
let comboStep = 0;
let lastAttackTime = 0;

function triggerHeroAttack() {
  const now = performance.now();
  if (now - lastAttackTime > 800) {
    comboStep = 1;
  } else {
    comboStep = (comboStep % 3) + 1;
  }
  lastAttackTime = now;

  hero.triggerAttack(comboStep);
  sound.swordSwing();

  if (network) {
    network.broadcastAction({ type: 'attack', combo: comboStep });
  }

  // Check Hit detection against monsters
  const attackRadius = comboStep === 3 ? 3.5 : 2.6;
  const bonus = lootManager.getTotalBonus();
  const totalAtk = stats.baseAttack + bonus.attack;

  monsterManager.monsters.forEach(m => {
    if (m.state === 'dead') return;
    const dx = m.meshGroup.position.x - hero.mesh.position.x;
    const dz = m.meshGroup.position.z - hero.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= attackRadius) {
      const isCrit = Math.random() * 100 < bonus.crit;
      const dmg = Math.floor(totalAtk * (isCrit ? 1.8 : 1.0) * (comboStep === 3 ? 1.5 : 1.0));
      const knockDir = new THREE.Vector3(dx, 0, dz).normalize();

      sound.swordHit();
      monsterManager.damageMonster(m.id, dmg, knockDir);
      spawnFloatingText(m.meshGroup.position, (isCrit ? 'CRIT! ' : '') + dmg, isCrit ? '#ff3838' : '#f5af19');

      if (network) {
        network.broadcastMonsterHit({ monsterId: m.id, damage: dmg });
      }
    }
  });
}

function triggerHeroDash() {
  if (cooldowns.dash > 0 || stats.stamina < 20) return;
  cooldowns.dash = 1.0;
  stats.stamina -= 20;

  // Dash in current facing or movement direction
  const dir = moveVec.lengthSq() > 0.01
    ? moveVec.clone().normalize()
    : new THREE.Vector3(Math.sin(hero.mesh.rotation.y), 0, Math.cos(hero.mesh.rotation.y));

  hero.triggerDash(dir);
  sound.dodgeRoll();

  if (network) {
    network.broadcastAction({ type: 'dash', dirX: dir.x, dirZ: dir.z });
  }
}

// Skill 1: 疾風旋刃 (Whirlwind Slash)
function triggerSkill1() {
  if (cooldowns.skill1 > 0 || stats.mp < 25) return;
  cooldowns.skill1 = 3.5;
  stats.mp -= 25;

  hero.triggerWhirlwind();
  sound.whirlwind();

  if (network) {
    network.broadcastAction({ type: 'whirlwind' });
  }

  // 360 AoE Damage
  const bonus = lootManager.getTotalBonus();
  const dmg = Math.floor((stats.baseAttack + bonus.attack) * 2.2);

  monsterManager.monsters.forEach(m => {
    if (m.state === 'dead') return;
    const dx = m.meshGroup.position.x - hero.mesh.position.x;
    const dz = m.meshGroup.position.z - hero.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= 4.2) {
      sound.swordHit();
      monsterManager.damageMonster(m.id, dmg, new THREE.Vector3(dx, 0, dz));
      spawnFloatingText(m.meshGroup.position, `🌪️ ${dmg}`, '#00d2d3');

      if (network) {
        network.broadcastMonsterHit({ monsterId: m.id, damage: dmg });
      }
    }
  });
}

// Skill 2: 以太天衝 (Aether Beam)
function triggerSkill2() {
  if (cooldowns.skill2 > 0 || stats.mp < 35) return;
  cooldowns.skill2 = 5.0;
  stats.mp -= 35;

  hero.triggerBeam();
  sound.aetherBeam();

  if (network) {
    network.broadcastAction({ type: 'beam' });
  }

  // Line piercing damage in facing direction
  const fwd = new THREE.Vector3(Math.sin(hero.mesh.rotation.y), 0, Math.cos(hero.mesh.rotation.y));
  const bonus = lootManager.getTotalBonus();
  const dmg = Math.floor((stats.baseAttack + bonus.attack) * 3.5);

  monsterManager.monsters.forEach(m => {
    if (m.state === 'dead') return;
    const toMon = new THREE.Vector3().subVectors(m.meshGroup.position, hero.mesh.position);
    const dist = toMon.length();
    if (dist < 12) {
      toMon.normalize();
      const dot = fwd.dot(toMon);
      if (dot > 0.65) {
        sound.swordHit();
        monsterManager.damageMonster(m.id, dmg, fwd);
        spawnFloatingText(m.meshGroup.position, `⚡ ${dmg}`, '#54a0ff');

        if (network) {
          network.broadcastMonsterHit({ monsterId: m.id, damage: dmg });
        }
      }
    }
  });
}

// Skill 3: 聖樹祈願 (Sanctuary Heal)
function triggerSkill3() {
  if (cooldowns.skill3 > 0 || stats.mp < 40) return;
  cooldowns.skill3 = 8.0;
  stats.mp -= 40;

  const healAmount = Math.floor(stats.maxHp * 0.45);
  stats.hp = Math.min(stats.maxHp, stats.hp + healAmount);
  sound.heal();
  spawnFloatingText(hero.mesh.position, `+${healAmount} HP`, '#2ed573');
}

// Click to Attack / Buttons
document.getElementById('slot-attack')!.onclick = triggerHeroAttack;
document.getElementById('slot-skill1')!.onclick = triggerSkill1;
document.getElementById('slot-skill2')!.onclick = triggerSkill2;
document.getElementById('slot-skill3')!.onclick = triggerSkill3;
document.getElementById('slot-dash')!.onclick = triggerHeroDash;
document.getElementById('slot-inventory')!.onclick = toggleInventory;

// Audio toggle
const audioBtn = document.getElementById('audio-toggle-btn')!;
audioBtn.onclick = () => {
  const isEnabled = sound.toggle();
  audioBtn.innerText = isEnabled ? '🔊 音效: 開' : '🔇 音效: 關';
};

// Room badge click: copy link
const roomBadge = document.getElementById('room-badge')!;
roomBadge.onclick = () => {
  const fullUrl = `${window.location.origin}${window.location.pathname}#room=${currentRoomId}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    alert(`房間邀請網址已複製至剪貼簿！\n${fullUrl}\n\n將此連結傳給好友即可連線同遊！`);
  });
};

// Chat System
const chatMessagesEl = document.getElementById('chat-messages')!;
const chatInputEl = document.getElementById('chat-input') as HTMLInputElement;
const chatSendBtn = document.getElementById('chat-send-btn')!;

function addChatMessage(msg: string, color: string = '#fff') {
  const div = document.createElement('div');
  div.style.color = color;
  div.innerText = msg;
  chatMessagesEl.appendChild(div);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function sendLocalChat() {
  const txt = chatInputEl.value.trim();
  if (!txt) return;
  addChatMessage(`[You]: ${txt}`, '#f1c40f');
  if (network) {
    network.broadcastChat(txt, '蒼空劍士');
  }
  chatInputEl.value = '';
}

chatSendBtn.onclick = sendLocalChat;
chatInputEl.onkeydown = (e) => {
  if (e.key === 'Enter') sendLocalChat();
};

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const msg = (btn as HTMLElement).dataset.msg || '';
    addChatMessage(`[You]: ${msg}`, '#f1c40f');
    if (network) {
      network.broadcastChat(msg, '蒼空劍士');
    }
  });
});

// Inventory Modal
const invModal = document.getElementById('inventory-modal')!;
document.getElementById('modal-close-btn')!.onclick = toggleInventory;

function toggleInventory() {
  const isOpen = invModal.style.display === 'flex';
  invModal.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) {
    renderInventoryUI();
  }
}

function renderInventoryUI() {
  const invList = document.getElementById('inv-list')!;
  invList.innerHTML = '';
  document.getElementById('inv-count')!.innerText = `${lootManager.inventory.length} / 24`;

  // Render Equipped Slots
  const slots: ('weapon' | 'shield' | 'armor' | 'amulet')[] = ['weapon', 'shield', 'armor', 'amulet'];
  slots.forEach(slotType => {
    const el = document.getElementById(`equip-${slotType}`)!;
    const item = lootManager.equipped[slotType];
    if (item) {
      el.className = `equip-slot rarity-${item.rarity}`;
      el.innerHTML = `<span>${item.icon} ${item.name}</span><span style="font-size:10px; color:#f1c40f;">${item.attack ? `ATK +${item.attack}` : `DEF +${item.defense}`}</span>`;
    } else {
      el.className = 'equip-slot';
      el.innerHTML = `<span>${slotType.toUpperCase()}</span><span style="color:#aaa;">空</span>`;
    }
  });

  // Render Inventory items
  lootManager.inventory.forEach(item => {
    const card = document.createElement('div');
    card.className = `item-card rarity-${item.rarity}`;
    card.innerHTML = `
      <span style="font-size:20px;">${item.icon}</span>
      <strong>${item.name}</strong>
      <span>${item.attack ? `ATK +${item.attack}` : `DEF +${item.defense}`}</span>
    `;
    card.title = item.lore;
    card.onclick = () => {
      lootManager.equipItem(item);
      renderInventoryUI();
      sound.swordHit();
    };
    invList.appendChild(card);
  });
}

// Minimap Radar
const minimapCanvas = document.getElementById('minimap') as HTMLCanvasElement;
const minimapCtx = minimapCanvas.getContext('2d')!;

function drawMinimap() {
  minimapCtx.clearRect(0, 0, 120, 120);

  // Background circle
  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.arc(60, 60, 56, 0, Math.PI * 2);
  minimapCtx.fillStyle = '#0a101d';
  minimapCtx.fill();
  minimapCtx.lineWidth = 2;
  minimapCtx.strokeStyle = '#f5af19';
  minimapCtx.stroke();
  minimapCtx.clip();

  // Radar map scale: 48 units = 50px
  const scale = 50 / 48;
  const toMapX = (wx: number) => 60 + (wx - hero.mesh.position.x) * scale;
  const toMapY = (wz: number) => 60 + (wz - hero.mesh.position.z) * scale;

  // Draw Crystals (blue diamonds)
  world.crystals.forEach(c => {
    const mx = toMapX(c.position.x);
    const my = toMapY(c.position.z);
    minimapCtx.fillStyle = '#00f0ff';
    minimapCtx.fillRect(mx - 2, my - 2, 4, 4);
  });

  // Draw Monsters
  monsterManager.monsters.forEach(m => {
    if (m.state === 'dead') return;
    const mx = toMapX(m.x);
    const my = toMapY(m.z);
    if (m.type === 'boss') {
      minimapCtx.fillStyle = '#e74c3c';
      minimapCtx.beginPath();
      minimapCtx.arc(mx, my, 5, 0, Math.PI * 2);
      minimapCtx.fill();
    } else {
      minimapCtx.fillStyle = '#e67e22';
      minimapCtx.beginPath();
      minimapCtx.arc(mx, my, 2.5, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  });

  // Draw Remote Peers
  if (network) {
    network.remoteControllers.forEach(ctrl => {
      const mx = toMapX(ctrl.mesh.position.x);
      const my = toMapY(ctrl.mesh.position.z);
      minimapCtx.fillStyle = '#2ecc71';
      minimapCtx.beginPath();
      minimapCtx.arc(mx, my, 3.5, 0, Math.PI * 2);
      minimapCtx.fill();
    });
  }

  // Draw Local Player (Center Arrow)
  minimapCtx.save();
  minimapCtx.translate(60, 60);
  minimapCtx.rotate(-hero.mesh.rotation.y);
  minimapCtx.fillStyle = '#f1c40f';
  minimapCtx.beginPath();
  minimapCtx.moveTo(0, -6);
  minimapCtx.lineTo(5, 5);
  minimapCtx.lineTo(-5, 5);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.restore();

  minimapCtx.restore();
}

// Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Broadcast 20Hz Network State
let netBroadcastTimer = 0;

// Main Game Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();

  // 1. Update cooldowns
  Object.keys(cooldowns).forEach(k => {
    const key = k as keyof typeof cooldowns;
    if (cooldowns[key] > 0) {
      cooldowns[key] = Math.max(0, cooldowns[key] - delta);
    }
  });

  // UI cooldown numbers
  const cd1El = document.getElementById('cd-1')!;
  const cd2El = document.getElementById('cd-2')!;
  const cd3El = document.getElementById('cd-3')!;
  const cdDashEl = document.getElementById('cd-dash')!;
  cd1El.style.display = cooldowns.skill1 > 0 ? 'flex' : 'none';
  cd1El.innerText = cooldowns.skill1.toFixed(1);
  cd2El.style.display = cooldowns.skill2 > 0 ? 'flex' : 'none';
  cd2El.innerText = cooldowns.skill2.toFixed(1);
  cd3El.style.display = cooldowns.skill3 > 0 ? 'flex' : 'none';
  cd3El.innerText = cooldowns.skill3.toFixed(1);
  cdDashEl.style.display = cooldowns.dash > 0 ? 'flex' : 'none';
  cdDashEl.innerText = cooldowns.dash.toFixed(1);

  // Stamina & MP natural regeneration
  stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 18);
  stats.mp = Math.min(stats.maxMp, stats.mp + delta * 5);

  // 2. Handle Player Movement
  moveVec.set(0, 0, 0);
  if (keys['KeyW'] || keys['ArrowUp']) moveVec.z -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveVec.z += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveVec.x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveVec.x += 1;

  const isMoving = moveVec.lengthSq() > 0.01;

  if (isMoving && !hero.isDashing) {
    moveVec.normalize();
    const speedBonus = lootManager.getTotalBonus().speed;
    const moveSpeed = (7.5 + speedBonus) * delta;
    const nextX = hero.mesh.position.x + moveVec.x * moveSpeed;
    const nextZ = hero.mesh.position.z + moveVec.z * moveSpeed;

    if (world.isWalkable(nextX, nextZ)) {
      hero.mesh.position.x = nextX;
      hero.mesh.position.z = nextZ;
    }

    // Smooth rotate to movement direction
    const targetAngle = Math.atan2(moveVec.x, moveVec.z);
    hero.mesh.rotation.y = THREE.MathUtils.lerp(hero.mesh.rotation.y, targetAngle, delta * 15);
  }

  // Update Hero Character
  hero.update(delta, isMoving);
  hero.setNameTag('蒼空劍士 (You)', stats.hp, stats.maxHp);

  // 3. Update Camera in 2.5D Isometric perspective
  const camTargetPos = new THREE.Vector3(
    hero.mesh.position.x,
    hero.mesh.position.y + 24,
    hero.mesh.position.z + 24
  );
  camera.position.lerp(camTargetPos, delta * 8);
  camera.lookAt(hero.mesh.position.x, hero.mesh.position.y + 1.2, hero.mesh.position.z);

  // 4. Update World
  world.update(delta, elapsed);

  // 5. Update Monsters
  monsterManager.update(delta, hero.mesh.position, (damage) => {
    // Player took damage
    const defBonus = lootManager.getTotalBonus().defense;
    const actualDmg = Math.max(2, damage - Math.floor((stats.baseDefense + defBonus) * 0.6));
    stats.hp = Math.max(0, stats.hp - actualDmg);
    spawnFloatingText(hero.mesh.position, `-${actualDmg}`, '#ff4757');

    if (stats.hp <= 0) {
      // Respawn at sanctuary
      stats.hp = stats.maxHp;
      hero.mesh.position.set(0, 0, 8);
      addChatMessage('[系統] 你的守護結界發動，已於以太聖壇安全重生！', '#f5af19');
    }
  });

  // Boss Health Bar UI update
  const boss = monsterManager.monsters.find(m => m.type === 'boss');
  const bossBarContainer = document.getElementById('boss-bar-container')!;
  if (boss && boss.state !== 'dead') {
    const distToBoss = hero.mesh.position.distanceTo(boss.meshGroup.position);
    if (distToBoss < 32) {
      bossBarContainer.style.display = 'flex';
      const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
      document.getElementById('boss-hp-fill')!.style.width = `${pct}%`;
      document.getElementById('boss-hp-text')!.innerText = `${boss.hp} / ${boss.maxHp}`;
    } else {
      bossBarContainer.style.display = 'none';
    }
  } else {
    bossBarContainer.style.display = 'none';
  }

  // 6. Update Loot
  lootManager.update(delta, hero.mesh.position, (item) => {
    showLootToast(item);
  });

  // 7. Update Multiplayer Networking
  if (network) {
    network.update(delta);

    netBroadcastTimer += delta;
    if (netBroadcastTimer >= 0.05) {
      // 20 times per second
      netBroadcastTimer = 0;
      network.broadcastPlayerState({
        id: network.selfPeerId,
        name: '蒼空劍士',
        x: hero.mesh.position.x,
        y: hero.mesh.position.y,
        z: hero.mesh.position.z,
        rotationY: hero.mesh.rotation.y,
        anim: hero.animState,
        hp: stats.hp,
        maxHp: stats.maxHp,
        color: '#2e86de'
      });
    }
  }

  // 8. Update HUD Bars
  document.getElementById('hp-bar')!.style.width = `${(stats.hp / stats.maxHp) * 100}%`;
  document.getElementById('hp-text')!.innerText = `${stats.hp} / ${stats.maxHp}`;
  document.getElementById('mp-bar')!.style.width = `${(stats.mp / stats.maxMp) * 100}%`;
  document.getElementById('stamina-bar')!.style.width = `${(stats.stamina / stats.maxStamina) * 100}%`;
  document.getElementById('level-badge')!.innerText = `Lv.${stats.level}`;

  // 9. Draw Minimap Radar
  drawMinimap();

  // 10. Render 3D Scene
  renderer.render(scene, camera);
}

// Start Game Loop
animate();
