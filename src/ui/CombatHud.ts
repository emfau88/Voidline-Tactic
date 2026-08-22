import { SHIELD_BOOST_COOLDOWN_MS, SHIELD_BOOST_COST } from '../domain/combat/constants';
import { WEAPONS } from '../domain/combat/content';
import { distance, normalizeAngle } from '../domain/combat/math';
import { UPGRADES } from '../domain/combat/missions';
import { STARTER_MODULES } from '../domain/combat/starterModules';
import type { AbilityPreview, CombatState, EscortDirective, MissionId, ShipState, TimeScale, UpgradeId } from '../domain/combat/types';

export type ActionMode = 'course' | 'target';
export type HudAction = ActionMode | 'lance' | 'torpedo' | 'shield' | 'escort';

export interface HudCallbacks {
  readonly onAction: (action: HudAction) => void;
  readonly onSteer: (heading: number) => void;
  readonly onTimeScale: (scale: TimeScale) => void;
  readonly onRestart: () => void;
  readonly onContinue: () => void;
  readonly onZoom: (direction: number) => void;
  readonly onZoomReset: () => void;
}

export interface HudViewModel {
  readonly state: CombatState;
  readonly flagship: ShipState;
  readonly escort?: ShipState;
  readonly target?: ShipState;
  readonly mode?: ActionMode;
  readonly timeScale: TimeScale;
  readonly lancePreview: AbilityPreview;
  readonly torpedoPreview: AbilityPreview;
  readonly shieldPreview: AbilityPreview;
}

export interface MissionResultView {
  readonly status: CombatState['status'];
  readonly missionId: MissionId;
  readonly missionName: string;
  readonly elapsedMs: number;
  readonly salvage: number;
  readonly totalSalvage: number;
  readonly upgradeChoices: readonly UpgradeId[];
  readonly finalMission: boolean;
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required HUD element #${id}`);
  return element as T;
}

function setText(id: string, value: string): void {
  requiredElement(id).textContent = value;
}

function setMeter(id: string, current: number, maximum: number): void {
  requiredElement<HTMLElement>(id).style.width = `${Math.max(0, Math.min(100, (current / maximum) * 100))}%`;
}

function facingLabel(angle: number): string {
  const degrees = ((normalizeAngle(angle) * 180) / Math.PI + 360) % 360;
  const labels = ['O', 'SO', 'S', 'SW', 'W', 'NW', 'N', 'NO'];
  return labels[Math.round(degrees / 45) % 8];
}

function formatTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function formatCooldown(milliseconds: number): string {
  return milliseconds <= 0 ? 'BEREIT' : `${(milliseconds / 1_000).toFixed(1)}s`;
}

function directiveLabel(directive: EscortDirective): string {
  const labels: Record<EscortDirective, string> = {
    follow: 'FOLGEN',
    'flank-left': 'FLANKE L',
    'flank-right': 'FLANKE R',
    protect: 'SCHÜTZEN',
  };
  return labels[directive];
}

export class CombatHud {
  private readonly actionButtons: readonly HTMLButtonElement[];
  private readonly targetCard = requiredElement<HTMLElement>('target-card');
  private readonly toastElement = requiredElement<HTMLElement>('toast');
  private readonly helpDialog = requiredElement<HTMLDialogElement>('help-dialog');
  private readonly resultDialog = requiredElement<HTMLDialogElement>('result-dialog');
  private readonly flightStick = requiredElement<HTMLButtonElement>('flight-stick');
  private readonly flightStickKnob = requiredElement<HTMLElement>('flight-stick-knob');
  private readonly actionGrid = requiredElement<HTMLElement>('action-grid');
  private toastTimer?: number;

  public constructor(callbacks: HudCallbacks) {
    this.actionButtons = [...document.querySelectorAll<HTMLButtonElement>('#action-grid [data-action]')];
    for (const button of this.actionButtons) {
      button.addEventListener('click', () => callbacks.onAction(button.dataset.action as HudAction));
    }
    this.bindFlightStick(callbacks.onSteer);
    requiredElement<HTMLButtonElement>('pause-button').addEventListener('click', () => callbacks.onTimeScale(0));
    requiredElement<HTMLButtonElement>('slow-button').addEventListener('click', () => callbacks.onTimeScale(0.25));
    requiredElement<HTMLButtonElement>('live-button').addEventListener('click', () => callbacks.onTimeScale(1));
    requiredElement<HTMLButtonElement>('restart-button').addEventListener('click', callbacks.onRestart);
    requiredElement<HTMLButtonElement>('continue-button').addEventListener('click', callbacks.onContinue);
    requiredElement<HTMLButtonElement>('zoom-out-button').addEventListener('click', () => callbacks.onZoom(-1));
    requiredElement<HTMLButtonElement>('zoom-in-button').addEventListener('click', () => callbacks.onZoom(1));
    requiredElement<HTMLButtonElement>('zoom-reset-button').addEventListener('click', callbacks.onZoomReset);
    const helpButton = requiredElement<HTMLButtonElement>('help-button');
    helpButton.addEventListener('click', () => this.helpDialog.showModal());
    helpButton.disabled = false;
    requiredElement<HTMLButtonElement>('zoom-out-button').disabled = false;
    requiredElement<HTMLButtonElement>('zoom-in-button').disabled = false;
    requiredElement<HTMLButtonElement>('zoom-reset-button').disabled = false;
    requiredElement<HTMLButtonElement>('close-help-button').addEventListener('click', () => this.helpDialog.close());
  }

  public setZoom(factor: number): void {
    setText('zoom-reset-button', `${Math.round(factor * 100)}%`);
  }

  public update(model: HudViewModel): void {
    const { state, flagship, escort, target, mode, timeScale, lancePreview, torpedoPreview, shieldPreview } = model;
    setText('turn-number', formatTime(state.elapsedMs));
    setText('phase-label', timeScale === 0 ? 'TAKTISCHE PAUSE' : timeScale === 0.25 ? '0,25× SLOW' : '1× LIVE');
    const captureSuffix = state.objective.position
      ? ` · ${state.objective.owner === 'player' ? 'GEHALTEN' : state.objective.owner === 'enemy' ? 'FEINDLICH' : `${Math.round(Math.abs(state.objective.captureProgress) * 100)} %`}`
      : '';
    setText('objective-label', `${state.objective.label}${captureSuffix}`);
    setText('ship-name', flagship.name);
    const starterModule = flagship.starterModuleId ? STARTER_MODULES[flagship.starterModuleId] : undefined;
    setText('ship-class', `${flagship.class.toUpperCase()} · ${starterModule?.name.toUpperCase() ?? 'FLAGGSCHIFF'}`);
    setText('ship-hull-text', `${flagship.hull}/${flagship.maxHull}`);
    setText('ship-shield-text', `${flagship.shield}/${flagship.maxShield}`);
    setText('ship-energy-text', `${Math.floor(flagship.energy)}/${flagship.maxEnergy}`);
    setText('ship-ap', `${Math.round(flagship.speed)}/${flagship.maxSpeed}`);
    setText('ship-facing', `${facingLabel(flagship.facing)} → ${facingLabel(flagship.desiredHeading)}`);
    setText('flight-stick-readout', `SOLLKURS ${facingLabel(flagship.desiredHeading)}`);
    this.setStickHeading(flagship.desiredHeading);
    this.flightStick.disabled = state.status !== 'active' || !flagship.alive;
    this.flightStick.setAttribute('aria-label', `Steuerjoystick für Sollkurs ${facingLabel(flagship.desiredHeading)}`);
    setMeter('ship-hull-bar', flagship.hull, flagship.maxHull);
    setMeter('ship-shield-bar', flagship.shield, flagship.maxShield);
    setMeter('ship-energy-bar', flagship.energy, flagship.maxEnergy);
    setText(
      'ship-status',
      flagship.lanceChargeMs > 0
        ? `LANZE ${(flagship.lanceChargeMs / 1_000).toFixed(1)}s`
        : flagship.shieldBoostMs > 0
          ? 'SCHILD BOOST'
          : mode === 'course'
            ? 'ROUTE INAKTIV'
            : mode === 'target'
              ? 'ZIEL WÄHLEN'
              : timeScale === 0
                ? 'PAUSE'
                : 'AUTOFIRE',
    );

    this.targetCard.hidden = !target;
    if (target) {
      setText('target-name', target.name);
      setText('target-class', `${target.class.toUpperCase()} · ${Math.round(distance(flagship.position, target.position))} m`);
      setText('target-hull-text', `${target.hull}/${target.maxHull}`);
      setText('target-shield-text', `${target.shield}/${target.maxShield}`);
      setMeter('target-hull-bar', target.hull, target.maxHull);
      setMeter('target-shield-bar', target.shield, target.maxShield);
      setText('hit-chance', target.lanceChargeMs > 0 ? `LANZE ${(target.lanceChargeMs / 1_000).toFixed(1)}s` : 'ERFASST');
      setText(
        'preview-damage',
        lancePreview.valid
          ? `Lanze: ${lancePreview.shieldDamage} Schild · ${lancePreview.hullDamage} Hülle`
          : torpedoPreview.valid
            ? `Torpedo ETA ${(torpedoPreview.etaMs / 1_000).toFixed(1)}s · ${torpedoPreview.damage} Schaden`
            : 'Mit dem Steuerstick einen Frontbogen herstellen.',
      );
    }

    this.actionGrid.classList.toggle('solo', !escort?.alive);
    for (const button of this.actionButtons) {
      const action = button.dataset.action as HudAction;
      button.hidden = action === 'escort' && !escort?.alive;
      const cooldown = action === 'lance'
        ? flagship.cooldowns.lance
        : action === 'torpedo'
          ? flagship.cooldowns.torpedo
          : action === 'shield'
            ? flagship.cooldowns.shield
            : 0;
      const cooldownMaximum = action === 'lance'
        ? WEAPONS.lance.cooldownMs
        : action === 'torpedo'
          ? WEAPONS.torpedo.cooldownMs
          : action === 'shield'
            ? SHIELD_BOOST_COOLDOWN_MS
            : 0;
      const readyRatio = cooldownMaximum > 0 ? 1 - Math.min(1, cooldown / cooldownMaximum) : 1;
      button.style.setProperty('--ability-ready', `${Math.round(readyRatio * 360)}deg`);
      button.dataset.cooling = String(cooldown > 0);
      const lanceUnavailable = !flagship.weapons.includes('lance') || flagship.cooldowns.lance > 0 || flagship.energy < WEAPONS.lance.energyCost;
      const torpedoUnavailable = !flagship.weapons.includes('torpedo') || flagship.cooldowns.torpedo > 0 || flagship.energy < WEAPONS.torpedo.energyCost;
      const disabled = state.status !== 'active' || !flagship.alive ||
        action === 'course' ||
        (action === 'lance' && lanceUnavailable) ||
        (action === 'torpedo' && torpedoUnavailable) ||
        (action === 'shield' && !shieldPreview.valid) ||
        (action === 'escort' && !escort?.alive);
      button.disabled = Boolean(disabled);
      button.classList.toggle('active', action === mode);
      const small = button.querySelector('small');
      if (!small) continue;
      if (action === 'lance') small.textContent = `${formatCooldown(flagship.cooldowns.lance)} · 18 EN`;
      if (action === 'torpedo') small.textContent = `${formatCooldown(flagship.cooldowns.torpedo)} · 12 EN`;
      if (action === 'shield') small.textContent = `${formatCooldown(flagship.cooldowns.shield)} · ${SHIELD_BOOST_COST} EN`;
      if (action === 'escort') small.textContent = escort ? directiveLabel(state.escortDirective) : 'NICHT AKTIV';
      if (action === 'target') small.textContent = target ? 'WECHSELN' : 'TAP / WECHSEL';
      if (action === 'course') small.textContent = 'INAKTIV';
    }

    for (const [id, scale] of [['pause-button', 0], ['slow-button', 0.25], ['live-button', 1]] as const) {
      requiredElement<HTMLButtonElement>(id).classList.toggle('active', timeScale === scale);
    }

  }

  public showResult(result: MissionResultView, onUpgrade: (upgradeId: UpgradeId) => void): void {
    const victory = result.status === 'player-won';
    setText('result-title', victory ? `MISSION 0${Number(result.missionId.at(-1))} ERFÜLLT` : 'FLAGGSCHIFF VERLOREN');
    setText(
      'result-copy',
      victory
        ? `${result.missionName} nach ${formatTime(result.elapsedMs)} abgeschlossen. Die nächste Operation ist jetzt verfügbar.`
        : 'Die Formation wurde aufgerieben. Nutze Pause, Joystick-Korrekturen und Spezialwaffen gezielter.',
    );
    setText('result-reward', victory ? `+${result.salvage} SALVAGE · GESAMT ${result.totalSalvage}` : 'KEINE BERGUNGSGÜTER GESICHERT');
    const upgradeSection = requiredElement<HTMLElement>('upgrade-choice');
    const upgradeContainer = upgradeSection.querySelector('div');
    const continueButton = requiredElement<HTMLButtonElement>('continue-button');
    if (!upgradeContainer) throw new Error('Missing upgrade choice container.');
    upgradeContainer.replaceChildren();
    upgradeSection.hidden = !victory || result.upgradeChoices.length === 0;
    continueButton.disabled = !victory || result.upgradeChoices.length > 0;
    continueButton.textContent = result.finalMission ? 'KAMPAGNE ABSCHLIESSEN' : 'NÄCHSTE MISSION';

    for (const upgradeId of result.upgradeChoices) {
      const upgrade = UPGRADES[upgradeId];
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.upgrade = upgradeId;
      const name = document.createElement('strong');
      name.textContent = upgrade.name;
      const description = document.createElement('small');
      description.textContent = upgrade.description;
      button.append(name, description);
      button.addEventListener('click', () => {
        for (const sibling of upgradeContainer.querySelectorAll('button')) {
          sibling.classList.toggle('selected', sibling === button);
          (sibling as HTMLButtonElement).disabled = sibling !== button;
        }
        button.classList.add('selected');
        continueButton.disabled = false;
        onUpgrade(upgradeId);
      }, { once: true });
      upgradeContainer.append(button);
    }
    if (!this.resultDialog.open) this.resultDialog.showModal();
  }

  public toast(message: string): void {
    window.clearTimeout(this.toastTimer);
    this.toastElement.textContent = message;
    this.toastElement.classList.add('visible');
    this.toastTimer = window.setTimeout(() => this.toastElement.classList.remove('visible'), 2_400);
  }

  public closeResult(): void {
    if (this.resultDialog.open) this.resultDialog.close();
  }

  private bindFlightStick(onSteer: (heading: number) => void): void {
    this.flightStick.disabled = false;
    const applyPointer = (event: PointerEvent): void => {
      const bounds = this.flightStick.getBoundingClientRect();
      const deltaX = event.clientX - (bounds.left + bounds.width / 2);
      const deltaY = event.clientY - (bounds.top + bounds.height / 2);
      if (Math.hypot(deltaX, deltaY) < Math.max(7, bounds.width * 0.1)) return;
      onSteer(Math.atan2(deltaY, deltaX));
    };
    this.flightStick.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.flightStick.setPointerCapture(event.pointerId);
      applyPointer(event);
    });
    this.flightStick.addEventListener('pointermove', (event) => {
      if (!this.flightStick.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      applyPointer(event);
    });
    this.flightStick.addEventListener('pointerup', (event) => {
      if (this.flightStick.hasPointerCapture(event.pointerId)) this.flightStick.releasePointerCapture(event.pointerId);
    });
    this.flightStick.addEventListener('pointercancel', (event) => {
      if (this.flightStick.hasPointerCapture(event.pointerId)) this.flightStick.releasePointerCapture(event.pointerId);
    });
    this.flightStick.addEventListener('keydown', (event) => {
      const headings: Partial<Record<string, number>> = {
        ArrowUp: -Math.PI / 2,
        ArrowRight: 0,
        ArrowDown: Math.PI / 2,
        ArrowLeft: Math.PI,
      };
      const heading = headings[event.key];
      if (heading === undefined) return;
      event.preventDefault();
      onSteer(heading);
    });
  }

  private setStickHeading(heading: number): void {
    const offset = Math.max(18, this.flightStick.clientWidth * 0.3);
    const x = Math.cos(heading) * offset;
    const y = Math.sin(heading) * offset;
    this.flightStickKnob.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px))`;
  }
}
