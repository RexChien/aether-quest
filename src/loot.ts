import * as THREE from 'three';
import { Item, Rarity } from './types';
import { sound } from './audio';

export interface GroundLoot {
  id: string;
  item: Item;
  meshGroup: THREE.Group;
  pos: THREE.Vector3;
}

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xbdc3c7,
  magic: 0x3498db,
  rare: 0xf1c40f,
  epic: 0x9b59b6,
  legendary: 0xe67e22,
  divine: 0x00f0ff
};

export class LootManager {
  private scene: THREE.Scene;
  public groundLoots: GroundLoot[] = [];
  public inventory: Item[] = [];
  public equipped: {
    weapon: Item | null;
    shield: Item | null;
    armor: Item | null;
    amulet: Item | null;
  } = {
    weapon: null,
    shield: null,
    armor: null,
    amulet: null
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Default starter gear
    this.equipped.weapon = {
      id: 'starter_sword',
      name: '青銅短劍 (Bronze Blade)',
      type: 'weapon',
      rarity: 'common',
      attack: 10,
      lore: '新手工匠打造的輕便短劍，鋒刃微鈍但十分可靠。',
      icon: '🗡️'
    };
    this.equipped.shield = {
      id: 'starter_shield',
      name: '木紋圓盾 (Wooden Buckler)',
      type: 'shield',
      rarity: 'common',
      defense: 5,
      lore: '以老橡木雕刻製成的圓盾，能抵擋史萊姆的撞擊。',
      icon: '🛡️'
    };
  }

  public generateRandomItem(level: number, forceBoss: boolean = false): Item {
    const roll = Math.random();
    let rarity: Rarity = 'common';

    if (forceBoss) {
      rarity = roll < 0.4 ? 'epic' : roll < 0.85 ? 'legendary' : 'divine';
    } else {
      if (roll < 0.45) rarity = 'common';
      else if (roll < 0.75) rarity = 'magic';
      else if (roll < 0.92) rarity = 'rare';
      else if (roll < 0.98) rarity = 'epic';
      else rarity = 'legendary';
    }

    const types: ('weapon' | 'shield' | 'armor' | 'amulet')[] = ['weapon', 'shield', 'armor', 'amulet'];
    const type = types[Math.floor(Math.random() * types.length)];

    const mult = {
      common: 1,
      magic: 1.5,
      rare: 2.2,
      epic: 3.5,
      legendary: 5.5,
      divine: 9.0
    }[rarity];

    const prefix = {
      common: ['生鏽的', '學徒的', '粗糙的'],
      magic: ['附魔的', '蒼翠之', '疾風之'],
      rare: ['榮耀的', '破甲之', '雷霆之'],
      epic: ['以太領主的', '滅絕之', '龍骨刻印'],
      legendary: ['太古誓約・', '天穹裁決・', '諸神殞落・'],
      divine: ['創世星核・', '永恆蒼空・', '神話原初・']
    }[rarity];

    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const id = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (type === 'weapon') {
      const baseAtk = Math.floor((12 + level * 5) * mult);
      return {
        id,
        name: `${randomPrefix}以太巨劍`,
        type: 'weapon',
        rarity,
        attack: baseAtk,
        critRate: rarity === 'legendary' || rarity === 'divine' ? 18 : 8,
        lore: '流淌著古代以太魔力的輝煌之刃，揮舞時伴隨雷鳴。',
        icon: '⚔️'
      };
    } else if (type === 'shield') {
      const baseDef = Math.floor((8 + level * 3) * mult);
      return {
        id,
        name: `${randomPrefix}守護神盾`,
        type: 'shield',
        rarity,
        defense: baseDef,
        hpBonus: Math.floor(baseDef * 4),
        lore: '刻有古代結界術式的大盾，宛如堅不可摧的磐石。',
        icon: '🛡️'
      };
    } else if (type === 'armor') {
      const baseDef = Math.floor((10 + level * 4) * mult);
      return {
        id,
        name: `${randomPrefix}神聖胸甲`,
        type: 'armor',
        rarity,
        defense: baseDef,
        hpBonus: Math.floor(baseDef * 6),
        lore: '由星之碎片鍛造而成的戰甲，守護旅者的靈魂。',
        icon: '🥋'
      };
    } else {
      const baseAtk = Math.floor((6 + level * 2) * mult);
      return {
        id,
        name: `${randomPrefix}蒼空之淚符石`,
        type: 'amulet',
        rarity,
        attack: baseAtk,
        critRate: 15,
        speedBonus: 2,
        lore: '凝聚純淨蒼穹之力的古代護身符，提升全身感官。',
        icon: '💎'
      };
    }
  }

  public spawnLootOnGround(item: Item, pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.4;

    const colorHex = RARITY_COLORS[item.rarity];

    // Floating gem/box
    const gemGeo = new THREE.OctahedronGeometry(0.35, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    group.add(gem);

    // Glowing Light Pillar (Diablo style vertical beam)
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.25, 6, 8, 1, true);
    beamGeo.translate(0, 3, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    group.add(beam);

    this.scene.add(group);
    this.groundLoots.push({
      id: item.id,
      item,
      meshGroup: group,
      pos: group.position
    });

    sound.itemDrop();
  }

  public update(delta: number, playerPos: THREE.Vector3, onPickItem: (item: Item) => void) {
    const elapsed = performance.now() * 0.004;

    for (let i = this.groundLoots.length - 1; i >= 0; i--) {
      const loot = this.groundLoots[i];
      loot.meshGroup.rotation.y = elapsed * 2;
      loot.meshGroup.position.y = 0.5 + Math.sin(elapsed * 3) * 0.15;

      const dx = playerPos.x - loot.pos.x;
      const dz = playerPos.z - loot.pos.z;
      const distSq = dx * dx + dz * dz;

      // Pickup radius: 2.2 units
      if (distSq < 2.2 * 2.2) {
        this.scene.remove(loot.meshGroup);
        this.groundLoots.splice(i, 1);
        this.inventory.push(loot.item);
        sound.itemDrop();
        onPickItem(loot.item);
      }
    }
  }

  public equipItem(item: Item): Item | null {
    const old = this.equipped[item.type];
    this.equipped[item.type] = item;
    // Remove from inventory
    const idx = this.inventory.findIndex(it => it.id === item.id);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
    }
    // Put old item back to inventory
    if (old) {
      this.inventory.push(old);
    }
    return old;
  }

  public getTotalBonus() {
    let attack = 0;
    let defense = 0;
    let hpBonus = 0;
    let crit = 5;
    let speed = 0;

    Object.values(this.equipped).forEach(it => {
      if (!it) return;
      if (it.attack) attack += it.attack;
      if (it.defense) defense += it.defense;
      if (it.hpBonus) hpBonus += it.hpBonus;
      if (it.critRate) crit += it.critRate;
      if (it.speedBonus) speed += it.speedBonus;
    });

    return { attack, defense, hpBonus, crit, speed };
  }
}
