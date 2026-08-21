export type Team = 'player' | 'enemy';
export type CombatPhase = Team;
export type CombatStatus = 'active' | 'player-won' | 'enemy-won';
export type ShipClass = 'frigate' | 'destroyer' | 'cruiser';
export type WeaponKind = 'broadside' | 'lance' | 'torpedo';
export type WeaponArc = 'front' | 'broadside';

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface WeaponDefinition {
  readonly kind: WeaponKind;
  readonly name: string;
  readonly arc: WeaponArc;
  readonly range: number;
  readonly halfAngle: number;
  readonly apCost: number;
  readonly energyCost: number;
  readonly accuracy: number;
  readonly minDamage: number;
  readonly maxDamage: number;
  readonly shieldMultiplier: number;
}

export interface ShipDefinition {
  readonly id: string;
  readonly team: Team;
  readonly name: string;
  readonly class: ShipClass;
  readonly maxHull: number;
  readonly maxShield: number;
  readonly shieldRegen: number;
  readonly armor: number;
  readonly maxEnergy: number;
  readonly energyRegen: number;
  readonly maxAp: number;
  readonly moveRange: number;
  readonly radius: number;
  readonly weapons: readonly WeaponKind[];
  readonly startPosition: Vector2;
  readonly startFacing: number;
}

export interface ShipState extends ShipDefinition {
  readonly hull: number;
  readonly shield: number;
  readonly energy: number;
  readonly ap: number;
  readonly position: Vector2;
  readonly facing: number;
  readonly alive: boolean;
}

export interface CombatState {
  readonly turn: number;
  readonly phase: CombatPhase;
  readonly status: CombatStatus;
  readonly rngState: number;
  readonly ships: Readonly<Record<string, ShipState>>;
}

export interface AttackPreview {
  readonly valid: boolean;
  readonly reason?: string;
  readonly weapon: WeaponDefinition;
  readonly distance: number;
  readonly hitChance: number;
  readonly minShieldDamage: number;
  readonly maxShieldDamage: number;
  readonly minHullDamage: number;
  readonly maxHullDamage: number;
}

export type CombatCommand =
  | {
      readonly type: 'move';
      readonly shipId: string;
      readonly destination: Vector2;
      readonly facing: number;
    }
  | { readonly type: 'rotate'; readonly shipId: string; readonly facing: number }
  | {
      readonly type: 'attack';
      readonly shipId: string;
      readonly targetId: string;
      readonly weapon: WeaponKind;
    }
  | { readonly type: 'reinforce-shield'; readonly shipId: string }
  | { readonly type: 'end-turn' };

export type CombatEvent =
  | {
      readonly type: 'ship-moved';
      readonly shipId: string;
      readonly from: Vector2;
      readonly to: Vector2;
      readonly facing: number;
    }
  | { readonly type: 'ship-rotated'; readonly shipId: string; readonly facing: number }
  | {
      readonly type: 'attack-resolved';
      readonly shipId: string;
      readonly targetId: string;
      readonly weapon: WeaponKind;
      readonly hit: boolean;
      readonly intercepted: boolean;
      readonly shieldDamage: number;
      readonly hullDamage: number;
    }
  | { readonly type: 'shield-reinforced'; readonly shipId: string; readonly amount: number }
  | { readonly type: 'phase-changed'; readonly phase: CombatPhase; readonly turn: number }
  | { readonly type: 'ship-destroyed'; readonly shipId: string }
  | { readonly type: 'combat-ended'; readonly status: Exclude<CombatStatus, 'active'> };

export interface CommandResult {
  readonly state: CombatState;
  readonly events: readonly CombatEvent[];
  readonly error?: string;
}
