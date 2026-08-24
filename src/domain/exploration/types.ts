export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export type ResourceKind = 'alloys' | 'data' | 'relics';
export type SignalKind = 'wreck' | 'vein' | 'anomaly' | 'distress';
export type SignalKnowledge = 'echo' | 'classified' | 'resolved';
export type ExpeditionStatus = 'active' | 'returning';
export type SectorId = 'ashenscar' | 'veloria-rift';
export type ExpeditionScenario = 'free' | 'first-wreck' | 'second-shift' | 'mining-run';
export type WeaponMode = 'broadside' | 'rail' | 'torpedo' | 'orb';
export type HostileKind = 'patrol' | 'raider';
export type HostileStatus = 'patrol' | 'alert';

export interface Cargo {
  readonly alloys: number;
  readonly data: number;
  readonly relics: number;
}

export interface SignalState {
  readonly id: string;
  readonly kind: SignalKind;
  readonly name: string;
  readonly position: Vector2;
  readonly knowledge: SignalKnowledge;
  readonly risk: 'low' | 'medium' | 'high';
  readonly description?: string;
  readonly classifiedName?: string;
  readonly classifiedDescription?: string;
  readonly guardedBy?: string;
  readonly reward?: {
    readonly kind: ResourceKind;
    readonly amount: number;
    readonly hullCost?: number;
    readonly text: string;
  };
}

export interface HostileState {
  readonly id: string;
  readonly name: string;
  readonly kind: HostileKind;
  readonly passive: boolean;
  readonly status: HostileStatus;
  readonly position: Vector2;
  readonly patrolCenter: Vector2;
  readonly patrolRadius: number;
  readonly patrolPhase: number;
  readonly heading: number;
  readonly hull: number;
  readonly maxHull: number;
  readonly attackCooldownMs?: number;
}

export interface DummyRespawnState {
  readonly hostileId: string;
  readonly remainingMs: number;
}

export interface ExpeditionState {
  readonly sectorId: SectorId;
  readonly sectorName: string;
  readonly scenario: ExpeditionScenario;
  readonly status: ExpeditionStatus;
  readonly position: Vector2;
  readonly heading: number;
  readonly flightInput: Vector2;
  readonly velocity: Vector2;
  readonly course?: Vector2;
  readonly origin: Vector2;
  readonly energy: number;
  readonly maxEnergy: number;
  readonly hull: number;
  readonly maxHull: number;
  readonly cargo: Cargo;
  readonly cargoCapacity: number;
  readonly scanRadius: number;
  readonly signals: readonly SignalState[];
  readonly hostiles: readonly HostileState[];
  readonly dummyRespawns: readonly DummyRespawnState[];
  readonly log: readonly string[];
}

export interface ExpeditionResult {
  readonly cargo: Cargo;
  readonly log: readonly string[];
}
