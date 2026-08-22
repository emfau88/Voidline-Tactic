import { SHIELD_BOOST_COOLDOWN_MS } from '../domain/combat/constants';
import { WEAPONS } from '../domain/combat/content';
import { distance } from '../domain/combat/math';
import type { AbilityPreview, ManualAbility, ShipState, TimeScale } from '../domain/combat/types';
import { DEPLOY_COSTS } from '../domain/fleet/fleetCommands';
import { laneLabel } from '../domain/fleet/lanes';
import type { DeployKind, FleetBattleState, FleetStance, LaneId } from '../domain/fleet/types';

export type FleetHudAction = 'target' | ManualAbility;

export interface FleetHudCallbacks {
  readonly onAction: (action: FleetHudAction) => void;
  readonly onStance: (stance: FleetStance) => void;
  readonly onCommandLane: (lane: LaneId) => void;
  readonly onTransferSelected: () => void;
  readonly onDeploy: (kind: DeployKind, lane: LaneId) => void;
  readonly onTimeScale: (scale: TimeScale) => void;
  readonly onRestart: () => void;
  readonly onZoom: (direction: number) => void;
  readonly onZoomReset: () => void;
  readonly onFocusFleet: () => void;
}

export interface FleetHudModel {
  readonly state: FleetBattleState;
  readonly selected: ShipState;
  readonly target?: ShipState;
  readonly timeScale: TimeScale;
  readonly commandLane: LaneId;
  readonly lancePreview: AbilityPreview;
  readonly torpedoPreview: AbilityPreview;
  readonly shieldPreview: AbilityPreview;
}

function required<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing Fleet HUD element #${id}`);
  return element as T;
}

function text(id: string, value: string): void { required(id).textContent = value; }
function meter(id: string, value: number, maximum: number): void {
  required(id).style.width = `${Math.max(0, Math.min(100, value / maximum * 100))}%`;
}
function timeLabel(ms: number): string {
  const seconds = Math.floor(ms / 1_000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function cooldown(ms: number): string { return ms > 0 ? `${(ms / 1_000).toFixed(1)}s` : 'BEREIT'; }
function percent(value: number, maximum: number): string { return `${Math.round(value / maximum * 100)} %`; }

const STANCE_LABELS: Record<FleetStance, string> = {
  advance: 'ANGRIFF', broadside: 'BREITSEITE', hold: 'POSITION HALTEN', 'keep-range': 'ABSTAND HALTEN', retreat: 'RÜCKZUG',
};

const CLASS_LABELS: Record<ShipState['class'], string> = { frigate: 'FREGATTE', destroyer: 'ZERSTÖRER', cruiser: 'KREUZER' };

export class FleetCommandHud {
  private readonly actionButtons = [...document.querySelectorAll<HTMLButtonElement>('#action-grid [data-action]')];
  private readonly stanceButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-stance]')];
  private readonly laneButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-lane]')];
  private readonly deployLaneButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-deploy-lane]')];
  private readonly deployButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-deploy]')];
  private readonly targetCard = required<HTMLElement>('target-card');
  private readonly shipCard = required<HTMLElement>('ship-card');
  private readonly commandPanel = required<HTMLElement>('fleet-command-panel');
  private readonly deploymentPanel = required<HTMLElement>('deployment-panel');
  private readonly actionGrid = required<HTMLElement>('action-grid');
  private readonly viewControls = required<HTMLElement>('view-controls');
  private readonly helpDialog = required<HTMLDialogElement>('help-dialog');
  private readonly resultDialog = required<HTMLDialogElement>('result-dialog');
  private deployLane: LaneId = 'center';
  private toastTimer?: number;
  private guideStep = 1;

  public constructor(callbacks: FleetHudCallbacks) {
    for (const button of this.actionButtons) button.addEventListener('click', () => callbacks.onAction(button.dataset.action as FleetHudAction));
    for (const button of this.stanceButtons) button.addEventListener('click', () => {
      callbacks.onStance(button.dataset.stance as FleetStance);
      this.collapseCommandPanel();
      this.showGuide(2);
    });
    for (const button of this.laneButtons) button.addEventListener('click', () => {
      callbacks.onCommandLane(button.dataset.lane as LaneId);
      this.showGuide(3);
    });
    required<HTMLButtonElement>('transfer-selected-button').addEventListener('click', callbacks.onTransferSelected);
    for (const button of this.deployLaneButtons) button.addEventListener('click', () => {
      this.deployLane = button.dataset.deployLane as LaneId;
      this.syncDeployLane();
    });
    for (const button of this.deployButtons) button.addEventListener('click', () => {
      callbacks.onDeploy(button.dataset.deploy as DeployKind, this.deployLane);
      this.closeDeployment();
      this.showGuide(4);
    });
    required<HTMLButtonElement>('command-summary-button').addEventListener('click', () => {
      const collapsed = this.commandPanel.classList.toggle('collapsed');
      required<HTMLButtonElement>('command-summary-button').setAttribute('aria-expanded', String(!collapsed));
    });
    required<HTMLButtonElement>('supply-label').addEventListener('click', (event) => {
      event.stopPropagation();
      const opening = this.deploymentPanel.hidden;
      this.deploymentPanel.hidden = !opening;
      required<HTMLButtonElement>('supply-label').setAttribute('aria-expanded', String(opening));
      if (opening) this.viewControls.hidden = true;
    });
    required<HTMLButtonElement>('view-menu-button').addEventListener('click', (event) => {
      event.stopPropagation();
      const opening = this.viewControls.hidden;
      this.viewControls.hidden = !opening;
      required<HTMLButtonElement>('view-menu-button').setAttribute('aria-expanded', String(opening));
      if (opening) this.closeDeployment();
    });
    required<HTMLButtonElement>('pause-button').addEventListener('click', () => callbacks.onTimeScale(0));
    required<HTMLButtonElement>('slow-button').addEventListener('click', () => callbacks.onTimeScale(0.25));
    required<HTMLButtonElement>('live-button').addEventListener('click', () => callbacks.onTimeScale(1));
    required<HTMLButtonElement>('restart-button').addEventListener('click', callbacks.onRestart);
    required<HTMLButtonElement>('zoom-out-button').addEventListener('click', () => callbacks.onZoom(-1));
    required<HTMLButtonElement>('zoom-in-button').addEventListener('click', () => callbacks.onZoom(1));
    required<HTMLButtonElement>('zoom-reset-button').addEventListener('click', callbacks.onZoomReset);
    required<HTMLButtonElement>('fleet-focus-button').addEventListener('click', callbacks.onFocusFleet);
    required<HTMLButtonElement>('help-button').addEventListener('click', () => this.helpDialog.showModal());
    required<HTMLButtonElement>('close-help-button').addEventListener('click', () => this.helpDialog.close());
    required<HTMLButtonElement>('close-command-guide').addEventListener('click', () => required('command-guide').setAttribute('hidden', ''));
    for (const id of ['zoom-out-button', 'zoom-in-button', 'zoom-reset-button', 'fleet-focus-button', 'help-button']) {
      required<HTMLButtonElement>(id).disabled = false;
    }
    this.syncDeployLane();
    this.viewControls.hidden = true;
    this.setShipContextVisible(false);
    this.showGuide(1);
    window.setTimeout(() => required('command-guide').setAttribute('hidden', ''), 5_500);
  }

  public openCommandPanel(): void {
    this.commandPanel.hidden = false;
    this.commandPanel.classList.remove('collapsed');
    required<HTMLButtonElement>('command-summary-button').setAttribute('aria-expanded', 'true');
    this.setShipContextVisible(false);
    this.closeDeployment();
  }

  public collapseCommandPanel(): void {
    this.commandPanel.hidden = false;
    this.commandPanel.classList.add('collapsed');
    required<HTMLButtonElement>('command-summary-button').setAttribute('aria-expanded', 'false');
  }

  public setShipContextVisible(visible: boolean): void {
    this.shipCard.hidden = !visible;
    this.actionGrid.hidden = !visible;
    required<HTMLElement>('optional-systems-label').hidden = !visible;
    if (!visible) this.targetCard.hidden = true;
  }

  public clearContext(): void {
    this.setShipContextVisible(false);
    this.commandPanel.hidden = true;
    this.closeDeployment();
  }

  private closeDeployment(): void {
    this.deploymentPanel.hidden = true;
    required<HTMLButtonElement>('supply-label').setAttribute('aria-expanded', 'false');
  }

  private showGuide(step: number): void {
    if (step <= this.guideStep && step !== 1) return;
    this.guideStep = step;
    const messages = {
      1: ['ROUTE ANTIPPEN', 'Gib einer ganzen Routengruppe einen einfachen Befehl.'],
      2: ['SCHIFFE HANDELN AUTONOM', 'Du steuerst Haltung, Route und Verstärkung.'],
      3: ['ZIELE SICHERN', 'Relais und Werft stärken deine Flotte.'],
      4: ['KOMMANDO BEREIT', 'Tippe Schiffe nur für Status und Spezialfähigkeiten an.'],
    } as const;
    const message = messages[step as keyof typeof messages] ?? messages[4];
    const guide = required('command-guide');
    guide.removeAttribute('hidden');
    text('command-guide-step', String(Math.min(4, step)));
    text('command-guide-title', message[0]);
    text('command-guide-copy', message[1]);
    if (step >= 4) window.setTimeout(() => guide.setAttribute('hidden', ''), 5_000);
  }

  private syncDeployLane(): void {
    for (const button of this.deployLaneButtons) button.classList.toggle('active', button.dataset.deployLane === this.deployLane);
  }

  public setZoom(factor: number): void { text('zoom-reset-button', `${Math.round(factor * 100)}%`); }

  public update(model: FleetHudModel): void {
    const { state, selected, target, timeScale, commandLane, lancePreview, torpedoPreview, shieldPreview } = model;
    const directive = state.fleet.directives[selected.id];
    text('turn-number', timeLabel(state.elapsedMs));
    text('phase-label', timeScale === 0 ? 'TAKTISCHE PAUSE' : timeScale === 0.25 ? '0,25× PLANUNG' : '1× LIVE');
    text('objective-label', 'FEINDLICHES COMMAND SHIP AUSSCHALTEN');
    text('supply-label', `+ ${Math.floor(state.fleet.supply.player)}`);
    text('ship-name', selected.name);
    text('ship-class', `${CLASS_LABELS[selected.class]} · ${laneLabel(directive.laneId)}`);
    text('ship-status', STANCE_LABELS[directive.stance]);
    text('ship-hull-text', percent(selected.hull, selected.maxHull));
    text('ship-shield-text', percent(selected.shield, selected.maxShield));
    text('ship-energy-text', percent(selected.energy, selected.maxEnergy));
    text('ship-ap', `${Math.round(selected.speed)}`);
    text('ship-facing', laneLabel(directive.laneId));
    meter('ship-hull-bar', selected.hull, selected.maxHull);
    meter('ship-shield-bar', selected.shield, selected.maxShield);
    meter('ship-energy-bar', selected.energy, selected.maxEnergy);
    const groupShips = Object.values(state.ships).filter((ship) => ship.alive && ship.team === 'player' && state.fleet.directives[ship.id]?.laneId === commandLane);
    const groupCount = groupShips.length;
    const groupStance = groupShips[0] ? state.fleet.directives[groupShips[0].id].stance : undefined;
    text('command-group-title', `${laneLabel(commandLane)} · ROUTENGRUPPE`);
    text('command-group-count', `${groupCount} SCHIFF${groupCount === 1 ? '' : 'E'} · AUTONOM`);

    this.targetCard.hidden = !target || this.actionGrid.hidden;
    if (target) {
      text('target-name', target.name);
      text('target-class', `${CLASS_LABELS[target.class]} · ${Math.round(distance(selected.position, target.position))} m`);
      text('target-hull-text', percent(target.hull, target.maxHull));
      text('target-shield-text', percent(target.shield, target.maxShield));
      meter('target-hull-bar', target.hull, target.maxHull);
      meter('target-shield-bar', target.shield, target.maxShield);
      text('hit-chance', target.id === state.fleet.commandShipIds.enemy ? 'KOMMANDO' : 'ERFASST');
      text('preview-damage', lancePreview.valid ? `LANZE · ${lancePreview.damage} SCHADEN` : torpedoPreview.valid ? `TORPEDO · ETA ${(torpedoPreview.etaMs / 1_000).toFixed(1)}s` : 'Schussbahn über Haltung und Korridor herstellen.');
    }

    for (const button of this.stanceButtons) {
      const stance = button.dataset.stance as FleetStance;
      button.classList.toggle('active', groupStance === stance);
      button.disabled = state.status !== 'active' || !selected.alive;
    }
    for (const button of this.laneButtons) {
      button.classList.toggle('active', commandLane === button.dataset.lane);
      button.disabled = state.status !== 'active';
    }
    const transferButton = required<HTMLButtonElement>('transfer-selected-button');
    transferButton.disabled = state.status !== 'active' || !selected.alive || directive.laneId === commandLane;
    transferButton.hidden = directive.laneId === commandLane;
    transferButton.textContent = directive.laneId === commandLane ? 'SCHIFF IST BEREITS AUF DIESER ROUTE' : 'AUSGEWÄHLTES SCHIFF HIERHER VERLEGEN';

    const cooldownMax: Record<ManualAbility, number> = {
      lance: WEAPONS.lance.cooldownMs, torpedo: WEAPONS.torpedo.cooldownMs, shield: SHIELD_BOOST_COOLDOWN_MS,
    };
    for (const button of this.actionButtons) {
      const action = button.dataset.action as FleetHudAction;
      const ability = action === 'target' ? undefined : action;
      const remaining = ability ? selected.cooldowns[ability] : 0;
      button.style.setProperty('--ability-ready', `${Math.round((1 - Math.min(1, remaining / (ability ? cooldownMax[ability] : 1))) * 360)}deg`);
      button.dataset.cooling = String(remaining > 0);
      const unavailable = ability === 'lance' ? !selected.weapons.includes('lance') || !lancePreview.valid
        : ability === 'torpedo' ? !selected.weapons.includes('torpedo') || !torpedoPreview.valid
          : ability === 'shield' ? !shieldPreview.valid : false;
      button.disabled = state.status !== 'active' || !selected.alive || unavailable;
      const small = button.querySelector('small');
      if (small) small.textContent = action === 'target' ? (target ? 'WECHSELN' : 'ERFASSEN') : cooldown(remaining);
    }

    const deploymentCooldown = state.fleet.deploymentCooldownMs.player;
    text('deployment-supply', `${Math.floor(state.fleet.supply.player)} / 100`);
    for (const button of this.deployButtons) {
      const kind = button.dataset.deploy as DeployKind;
      button.disabled = state.status !== 'active' || deploymentCooldown > 0 || state.fleet.supply.player < DEPLOY_COSTS[kind];
      const small = button.querySelector('small');
      if (small) small.textContent = deploymentCooldown > 0 ? `${(deploymentCooldown / 1_000).toFixed(1)}s` : `${DEPLOY_COSTS[kind]} VERS.`;
    }
    for (const [id, scale] of [['pause-button', 0], ['slow-button', 0.25], ['live-button', 1]] as const) {
      required(id).classList.toggle('active', timeScale === scale);
    }
  }

  public toast(message: string): void {
    const toast = required('toast');
    window.clearTimeout(this.toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    this.toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3_200);
  }

  public showResult(won: boolean, elapsedMs: number): void {
    text('result-title', won ? 'KORRIDOR GESICHERT' : 'COMMAND SHIP VERLOREN');
    text('result-copy', won ? `Die feindliche Flottenführung wurde nach ${timeLabel(elapsedMs)} ausgeschaltet.` : 'Die eigene Kommandostruktur ist zusammengebrochen. Nutze Seitenkorridore, Rückzug und Verstärkungen gezielter.');
    text('result-reward', won ? 'PROOF OF CONCEPT ABGESCHLOSSEN' : 'GEFECHTSDATEN GESICHERT');
    required<HTMLElement>('upgrade-choice').hidden = true;
    required<HTMLButtonElement>('continue-button').hidden = true;
    if (!this.resultDialog.open) this.resultDialog.showModal();
  }

  public closeResult(): void { if (this.resultDialog.open) this.resultDialog.close(); }
}
