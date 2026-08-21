import { WEAPONS } from '../domain/combat/content';
import {
  MOVE_AP_COST,
  MOVE_ENERGY_COST,
  ROTATE_AP_COST,
  SHIELD_AP_COST,
  SHIELD_ENERGY_COST,
} from '../domain/combat/constants';
import { normalizeAngle } from '../domain/combat/math';
import type { AttackPreview, CombatState, ShipState, WeaponKind } from '../domain/combat/types';

export type ActionMode = 'move' | 'rotate' | WeaponKind;

export interface HudCallbacks {
  readonly onAction: (action: ActionMode | 'shield') => void;
  readonly onEndTurn: () => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly onRestart: () => void;
  readonly onZoom: (direction: number) => void;
  readonly onZoomReset: () => void;
}

export interface HudViewModel {
  readonly state: CombatState;
  readonly selected: ShipState;
  readonly target?: ShipState;
  readonly preview?: AttackPreview;
  readonly mode?: ActionMode;
  readonly hasPendingAction: boolean;
  readonly busy: boolean;
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

function actionLabel(mode?: ActionMode): string {
  const labels: Record<ActionMode, string> = {
    move: 'BEWEGEN',
    rotate: 'DREHEN',
    broadside: 'BREITSEITE',
    lance: 'LANZE',
    torpedo: 'TORPEDO',
  };
  return mode ? labels[mode] : 'BEREIT';
}

function translateReason(reason?: string): string {
  const translations: Record<string, string> = {
    'Target is outside weapon range.': 'Ziel außerhalb der Waffenreichweite.',
    'Target is outside the weapon arc.': 'Ziel außerhalb des Feuerbogens.',
    'Not enough AP.': 'Nicht genügend AP.',
    'Not enough Energy.': 'Nicht genügend Energie.',
  };
  return reason ? (translations[reason] ?? reason) : 'Waffe wählen, um eine Prognose zu sehen.';
}

export class CombatHud {
  private readonly actionButtons: readonly HTMLButtonElement[];
  private readonly confirmBar = requiredElement<HTMLElement>('confirm-bar');
  private readonly confirmButton = requiredElement<HTMLButtonElement>('confirm-button');
  private readonly targetCard = requiredElement<HTMLElement>('target-card');
  private readonly toastElement = requiredElement<HTMLElement>('toast');
  private readonly helpDialog = requiredElement<HTMLDialogElement>('help-dialog');
  private readonly resultDialog = requiredElement<HTMLDialogElement>('result-dialog');
  private toastTimer?: number;

  public constructor(callbacks: HudCallbacks) {
    this.actionButtons = [...document.querySelectorAll<HTMLButtonElement>('#action-grid [data-action]')];
    for (const button of this.actionButtons) {
      button.addEventListener('click', () => callbacks.onAction(button.dataset.action as ActionMode | 'shield'));
    }
    requiredElement<HTMLButtonElement>('end-turn-button').addEventListener('click', callbacks.onEndTurn);
    requiredElement<HTMLButtonElement>('confirm-button').addEventListener('click', callbacks.onConfirm);
    requiredElement<HTMLButtonElement>('cancel-button').addEventListener('click', callbacks.onCancel);
    requiredElement<HTMLButtonElement>('restart-button').addEventListener('click', callbacks.onRestart);
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
    const { state, selected, target, preview, mode, hasPendingAction, busy } = model;
    setText('turn-number', String(state.turn));
    setText('phase-label', state.phase === 'player' ? 'SPIELERPHASE' : 'GEGNERPHASE');
    setText('ship-name', selected.name);
    setText('ship-class', selected.class.toUpperCase());
    setText('ship-hull-text', `${selected.hull}/${selected.maxHull}`);
    setText('ship-shield-text', `${selected.shield}/${selected.maxShield}`);
    setText('ship-energy-text', `${selected.energy}/${selected.maxEnergy}`);
    setText('ship-ap', `${selected.ap}/${selected.maxAp}`);
    setText('ship-facing', facingLabel(selected.facing));
    setMeter('ship-hull-bar', selected.hull, selected.maxHull);
    setMeter('ship-shield-bar', selected.shield, selected.maxShield);
    setMeter('ship-energy-bar', selected.energy, selected.maxEnergy);
    setText('ship-status', busy ? 'AKTION' : hasPendingAction ? 'PLANUNG' : actionLabel(mode));

    this.targetCard.hidden = !target;
    if (target) {
      setText('target-name', target.name);
      setText('target-class', target.class.toUpperCase());
      setText('target-hull-text', `${target.hull}/${target.maxHull}`);
      setText('target-shield-text', `${target.shield}/${target.maxShield}`);
      setMeter('target-hull-bar', target.hull, target.maxHull);
      setMeter('target-shield-bar', target.shield, target.maxShield);
      setText('hit-chance', preview?.valid ? `${preview.hitChance}%` : 'ZIEL');
      setText(
        'preview-damage',
        preview?.valid
          ? `Schild ${preview.minShieldDamage}–${preview.maxShieldDamage} · Hülle ${preview.minHullDamage}–${preview.maxHullDamage}`
          : translateReason(preview?.reason),
      );
    }

    const canAct = state.phase === 'player' && state.status === 'active' && !busy;
    for (const button of this.actionButtons) {
      const action = button.dataset.action as ActionMode | 'shield';
      const weapon = action === 'broadside' || action === 'lance' || action === 'torpedo' ? WEAPONS[action] : undefined;
      const lacksBasicResources =
        action === 'move'
          ? selected.ap < MOVE_AP_COST || selected.energy < MOVE_ENERGY_COST
          : action === 'rotate'
            ? selected.ap < ROTATE_AP_COST
            : action === 'shield'
              ? selected.ap < SHIELD_AP_COST ||
                selected.energy < SHIELD_ENERGY_COST ||
                selected.shield >= selected.maxShield
              : false;
      button.disabled =
        !canAct ||
        selected.team !== 'player' ||
        lacksBasicResources ||
        (weapon ? selected.ap < weapon.apCost || selected.energy < weapon.energyCost : false);
      button.classList.toggle('active', action === mode);
    }
    requiredElement<HTMLButtonElement>('end-turn-button').disabled = !canAct;
    this.confirmBar.hidden = !hasPendingAction;
    this.confirmButton.textContent = preview ? 'FEUERN' : mode === 'rotate' ? 'DREHEN' : 'BEWEGEN';

    if (state.status !== 'active' && !this.resultDialog.open) {
      setText('result-title', state.status === 'player-won' ? 'MISSION ERFÜLLT' : 'FLOTTE VERLOREN');
      setText(
        'result-copy',
        state.status === 'player-won'
          ? 'Die feindliche Formation ist gebrochen. Der nächste Meilenstein ergänzt Belohnung und Shipyard.'
          : 'Ausrichtung und Feuerwinkel waren nicht ausreichend. Formiere die Flotte neu und versuche es erneut.',
      );
      this.resultDialog.showModal();
    }
  }

  public toast(message: string): void {
    window.clearTimeout(this.toastTimer);
    this.toastElement.textContent = message;
    this.toastElement.classList.add('visible');
    this.toastTimer = window.setTimeout(() => this.toastElement.classList.remove('visible'), 2_500);
  }

  public closeResult(): void {
    if (this.resultDialog.open) this.resultDialog.close();
  }
}
