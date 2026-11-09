export type Rarity = 'common' | 'magic' | 'rare' | 'epic' | 'legendary' | 'divine';

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'shield' | 'armor' | 'amulet';
  rarity: Rarity;
  attack?: number;
  defense?: number;
  hpBonus?: number;
  critRate?: number;
  speedBonus?: number;
  lore: string;
  icon: string;
}

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  maxStamina: number;
  baseAttack: number;
  baseDefense: number;
  gold: number;
}

export interface NetworkPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  anim: 'idle' | 'run' | 'attack' | 'whirlwind' | 'beam' | 'dash' | 'hit';
  hp: number;
  maxHp: number;
  color: string;
  chatMsg?: string;
  chatTimer?: number;
  [key: string]: any;
}

export type MonsterType = 'slime' | 'stalker' | 'skeleton' | 'boss';

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  meshGroup: any;
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  aggroRadius: number;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'cooldown' | 'dead';
  timer: number;
  targetId: string | null;
  targetPos: { x: number; z: number };
  telegraphMesh?: any;
  lootTable: Item[];
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale?: number;
}
