import type { CombatEvent, CombatState, ShipClass, Team, Vector2 } from '../combat/types';

export type LaneId = 'upper' | 'center' | 'lower';
export type FleetStance = 'advance' | 'broadside' | 'hold' | 'keep-range' | 'retreat';
export type DeployKind = 'frigate' | 'destroyer';

export interface FleetDirective {
  readonly laneId: LaneId;
  readonly previousLaneId?: LaneId;
  readonly stance: FleetStance;
  readonly focusTargetId?: string;
  readonly holdPosition?: Vector2;
}

export interface FleetObjectiveState {
  readonly id: 'upper-relay' | 'lower-shipyard';
  readonly kind: 'relay' | 'shipyard';
  readonly name: string;
  readonly laneId: LaneId;
  readonly position: Vector2;
  readonly radius: number;
  readonly captureProgress: number;
  readonly owner?: Team;
}

export interface FleetLayerState {
  readonly directives: Readonly<Record<string, FleetDirective>>;
  readonly objectives: Readonly<Record<FleetObjectiveState['id'], FleetObjectiveState>>;
  readonly supply: Readonly<Record<Team, number>>;
  readonly deploymentCooldownMs: Readonly<Record<Team, number>>;
  readonly nextDeploymentId: number;
  readonly navigationThinkMs: number;
  readonly strategicThinkMs: number;
  readonly commandShipIds: Readonly<Record<Team, string>>;
}

export interface FleetBattleState extends CombatState {
  readonly controlMode: 'fleet';
  readonly fleet: FleetLayerState;
}

export type FleetEvent =
  | { readonly type: 'fleet-stance-changed'; readonly shipId: string; readonly stance: FleetStance }
  | { readonly type: 'fleet-lane-changed'; readonly shipId: string; readonly laneId: LaneId }
  | { readonly type: 'fleet-focus-changed'; readonly shipId: string; readonly targetId: string }
  | { readonly type: 'fleet-objective-captured'; readonly objectiveId: FleetObjectiveState['id']; readonly team: Team }
  | { readonly type: 'fleet-deployed'; readonly shipId: string; readonly team: Team; readonly laneId: LaneId; readonly shipClass: ShipClass };

export interface FleetCommandResult {
  readonly state: FleetBattleState;
  readonly events: readonly (CombatEvent | FleetEvent)[];
  readonly error?: string;
}

export interface FleetStepResult {
  readonly state: FleetBattleState;
  readonly events: readonly (CombatEvent | FleetEvent)[];
}

