export interface GambitRule {
  id: string;
  enabled: boolean;
  name: string;
  description: string;
  action: 'heal' | 'dodge' | 'whirlwind' | 'beam' | 'attack';
  conditionType: 'hp_below' | 'in_telegraph' | 'enemy_density' | 'target_boss' | 'enemy_in_range';
  threshold: number; // e.g. hp% threshold (50) or enemy count (2)
}

export interface GambitContext {
  hpPct: number;
  mp: number;
  stamina: number;
  inTelegraph: boolean;
  telegraphDir?: { x: number; z: number };
  nearbyEnemiesCount: number;
  bossInRange: boolean;
  closestEnemyDist: number;
  cooldowns: {
    dash: number;
    skill1: number;
    skill2: number;
    skill3: number;
  };
}

export const DEFAULT_GAMBITS: GambitRule[] = [
  {
    id: 'g_heal',
    enabled: true,
    name: '危急治癒 (Emergency Heal)',
    description: '自身 HP < 50% ➔ 施放【聖樹祈願】',
    action: 'heal',
    conditionType: 'hp_below',
    threshold: 50
  },
  {
    id: 'g_dodge',
    enabled: true,
    name: '求生翻滾 (Auto Evade)',
    description: '身處首領/怪物危險預警紅圈 ➔ 自動【翻滾脫離】',
    action: 'dodge',
    conditionType: 'in_telegraph',
    threshold: 0
  },
  {
    id: 'g_whirlwind',
    enabled: true,
    name: '群怪清場 (Whirlwind AOE)',
    description: '周圍敵人 >= 2 隻或遭遇首領 ➔ 施放【疾風旋刃】',
    action: 'whirlwind',
    conditionType: 'enemy_density',
    threshold: 2
  },
  {
    id: 'g_beam',
    enabled: true,
    name: '以太殲滅 (Aether Burst)',
    description: '鎖定首領或精英怪且 MP > 35 ➔ 施放【以太天衝】',
    action: 'beam',
    conditionType: 'target_boss',
    threshold: 35
  },
  {
    id: 'g_attack',
    enabled: true,
    name: '近戰討伐 (Auto Combo)',
    description: '武器攻擊範圍內有敵人 ➔ 自動發動【三段連斬】',
    action: 'attack',
    conditionType: 'enemy_in_range',
    threshold: 2.8
  }
];

export class GambitSystem {
  public enabled: boolean = true;
  public rules: GambitRule[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage() {
    try {
      const saved = localStorage.getItem('aether_gambits');
      if (saved) {
        this.rules = JSON.parse(saved);
        const auto = localStorage.getItem('aether_auto_enabled');
        if (auto !== null) {
          this.enabled = auto === 'true';
        }
        return;
      }
    } catch (e) {
      console.warn('Could not load gambits', e);
    }
    this.rules = JSON.parse(JSON.stringify(DEFAULT_GAMBITS));
  }

  public saveToStorage() {
    try {
      localStorage.setItem('aether_gambits', JSON.stringify(this.rules));
      localStorage.setItem('aether_auto_enabled', this.enabled.toString());
    } catch (e) {
      console.warn('Could not save gambits', e);
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.saveToStorage();
    return this.enabled;
  }

  public evaluate(ctx: GambitContext): 'heal' | 'dodge' | 'whirlwind' | 'beam' | 'attack' | null {
    if (!this.enabled) return null;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (rule.conditionType === 'hp_below') {
        if (ctx.hpPct <= rule.threshold && ctx.cooldowns.skill3 <= 0 && ctx.mp >= 40) {
          return 'heal';
        }
      } else if (rule.conditionType === 'in_telegraph') {
        if (ctx.inTelegraph && ctx.cooldowns.dash <= 0 && ctx.stamina >= 20) {
          return 'dodge';
        }
      } else if (rule.conditionType === 'enemy_density') {
        if ((ctx.nearbyEnemiesCount >= rule.threshold || ctx.bossInRange) && ctx.cooldowns.skill1 <= 0 && ctx.mp >= 25) {
          return 'whirlwind';
        }
      } else if (rule.conditionType === 'target_boss') {
        if (ctx.bossInRange && ctx.cooldowns.skill2 <= 0 && ctx.mp >= rule.threshold) {
          return 'beam';
        }
      } else if (rule.conditionType === 'enemy_in_range') {
        if (ctx.closestEnemyDist <= rule.threshold) {
          return 'attack';
        }
      }
    }

    return null;
  }
}

export const gambitSystem = new GambitSystem();
