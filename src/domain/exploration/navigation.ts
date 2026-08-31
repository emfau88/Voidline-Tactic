import type { ExpeditionState, SignalState } from './types';

export const EXPEDITION_WORLD = { width: 4_200, height: 2_600 } as const;

const STORY_TARGETS: Readonly<Record<ExpeditionState['scenario'], readonly string[]>> = {
  'first-wreck': ['echo-wreck', 'first-skiff-cache'],
  'second-shift': ['monk-lantern', 'cutting-liturgy', 'wayfarer-archive', 'raider-cipher'],
  'mining-run': ['black-vein', 'raider-cache'],
  'recovery-run': [],
  free: ['veloria-pilgrim'],
};

/** Returns the next authored story contact. It remains navigable before a scan,
 * while all other contacts keep their weak/unknown presentation. */
export function primaryNavigationSignal(state: ExpeditionState): SignalState | undefined {
  const ids = state.sectorId === 'veloria-rift' ? ['veloria-pilgrim'] : STORY_TARGETS[state.scenario];
  return ids
    .map((id) => state.signals.find((signal) => signal.id === id))
    .find((signal) => signal?.knowledge !== 'resolved');
}

export function isSignalNavigable(state: ExpeditionState, signal: SignalState): boolean {
  return signal.knowledge === 'classified'
    || primaryNavigationSignal(state)?.id === signal.id
    || Boolean(state.scanPerformed);
}
