export type Team = 'player' | 'enemy';
export type CombatStatus = 'active' | 'player-won' | 'enemy-won';
export type ShipClass = 'frigate' | 'destroyer' | 'cruiser';
export type WeaponKind = 'broadside' | 'lance' | 'torpedo';
export type WeaponArc = 'front' | 'broadside';
export type ShipRole = 'flagship' | 'escort' | 'hostile';
export type EscortDirective = 'follow' | 'flank-left' | 'flank-right' | 'protect';
export type TimeScale = 0 | 0.25 | 1;
export type ManualAbility = 'lance' | 'torpedo' | 'shield';
export type MissionId = 'mission-1' | 'mission-2' | 'mission-3';
export type UpgradeId = 'reinforced-hull' | 'vector-thrusters' | 'escort-plating' | 'flux-capacitor';
export type StarterModuleId = 'aegis-emitter' | 'vector-drive';
export type ObjectiveKind = 'eliminate' | 'relay' | 'shipyard';

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
  readonly energyCost: number;
  readonly damage: number;
  readonly shieldMultiplier: number;
  readonly cooldownMs: number;
  readonly chargeMs?: number;
  readonly projectileSpeed?: number;
  readonly projectileTurnRate?: number;
}

export interface ShipDefinition {
  readonly id: string;
  readonly team: Team;
  readonly name: string;
  readonly class: ShipClass;
  readonly maxHull: number;
  readonly maxShield: number;
  readonly armor: number;
  readonly maxEnergy: number;
  readonly energyRegenPerSecond: number;
  readonly maxSpeed: number;
  readonly acceleration: number;
  readonly turnRate: number;
  readonly radius: number;
  readonly weapons: readonly WeaponKind[];
  readonly startPosition: Vector2;
  readonly startFacing: number;
  readonly presentationId?: string;
}

export interface WeaponCooldowns {
  readonly broadside: number;
  readonly lance: number;
  readonly torpedo: number;
  readonly shield: number;
}

export interface ShipState extends ShipDefinition {
  readonly starterModuleId?: StarterModuleId;
  readonly navigationZone?: string;
  readonly hull: number;
  readonly shield: number;
  readonly energy: number;
  readonly position: Vector2;
  readonly facing: number;
  readonly speed: number;
  readonly alive: boolean;
  readonly role: ShipRole;
  readonly course: readonly Vector2[];
  readonly desiredHeading: number;
  readonly targetId?: string;
  readonly autoFire: boolean;
  readonly cooldowns: WeaponCooldowns;
  readonly lanceChargeMs: number;
  readonly lanceTargetId?: string;
  readonly shieldBoostMs: number;
  readonly aiThinkMs: number;
}

export interface ProjectileState {
  readonly id: string;
  readonly kind: 'torpedo';
  readonly team: Team;
  readonly ownerId: string;
  readonly targetId: string;
  readonly position: Vector2;
  readonly facing: number;
  readonly speed: number;
  readonly turnRate: number;
  readonly damage: number;
  readonly shieldMultiplier: number;
  readonly ttlMs: number;
  readonly radius: number;
}

export interface CombatState {
  readonly controlMode?: 'direct' | 'fleet';
  readonly elapsedMs: number;
  readonly status: CombatStatus;
  readonly ships: Readonly<Record<string, ShipState>>;
  readonly projectiles: Readonly<Record<string, ProjectileState>>;
  readonly nextProjectileId: number;
  readonly flagshipId: string;
  readonly escortDirective: EscortDirective;
  readonly missionId: MissionId;
  readonly starterModuleId?: StarterModuleId;
  readonly upgrades: readonly UpgradeId[];
  readonly objective: ObjectiveState;
  readonly nextReinforcementId: number;
}

export interface ObjectiveState {
  readonly kind: ObjectiveKind;
  readonly label: string;
  readonly position?: Vector2;
  readonly radius: number;
  readonly captureProgress: number;
  readonly owner?: Team;
  readonly spawnCooldownMs: number;
}

export interface AbilityPreview {
  readonly valid: boolean;
  readonly reason?: string;
  readonly ability: ManualAbility;
  readonly distance: number;
  readonly damage: number;
  readonly shieldDamage: number;
  readonly hullDamage: number;
  readonly coverReduction: number;
  readonly cooldownMs: number;
  readonly chargeMs: number;
  readonly etaMs: number;
}

export type CombatEvent =
  | { readonly type: 'course-changed'; readonly shipId: string; readonly points: readonly Vector2[] }
  | { readonly type: 'heading-changed'; readonly shipId: string; readonly heading: number }
  | { readonly type: 'target-designated'; readonly shipId: string; readonly targetId: string }
  | { readonly type: 'escort-directive-changed'; readonly directive: EscortDirective }
  | { readonly type: 'weapon-charging'; readonly shipId: string; readonly targetId: string; readonly weapon: 'lance'; readonly durationMs: number }
  | { readonly type: 'weapon-fired'; readonly shipId: string; readonly targetId: string; readonly weapon: WeaponKind }
  | { readonly type: 'attack-resolved'; readonly shipId: string; readonly targetId: string; readonly weapon: WeaponKind; readonly shieldDamage: number; readonly hullDamage: number }
  | { readonly type: 'projectile-launched'; readonly projectileId: string }
  | { readonly type: 'projectile-expired'; readonly projectileId: string }
  | { readonly type: 'objective-captured'; readonly objective: ObjectiveKind; readonly team: Team }
  | { readonly type: 'reinforcement-spawned'; readonly shipId: string; readonly team: Team }
  | { readonly type: 'shield-boosted'; readonly shipId: string; readonly restored: number; readonly durationMs: number }
  | { readonly type: 'ability-failed'; readonly shipId: string; readonly ability: ManualAbility; readonly reason: string }
  | { readonly type: 'ship-destroyed'; readonly shipId: string }
  | { readonly type: 'combat-ended'; readonly status: Exclude<CombatStatus, 'active'> };

export interface CommandResult {
  readonly state: CombatState;
  readonly events: readonly CombatEvent[];
  readonly error?: string;
}

export interface StepResult {
  readonly state: CombatState;
  readonly events: readonly CombatEvent[];
}
