import { MISSION_ORDER, MISSIONS } from '../domain/combat/missions';
import type { MissionId, UpgradeId } from '../domain/combat/types';

const STORAGE_KEY = 'voidline-campaign-v1';

export interface CampaignState {
  readonly version: 1;
  readonly selectedMissionId: MissionId;
  readonly unlockedMission: number;
  readonly completedMissions: readonly MissionId[];
  readonly salvage: number;
  readonly upgrades: readonly UpgradeId[];
}

const DEFAULT_CAMPAIGN: CampaignState = {
  version: 1,
  selectedMissionId: 'mission-1',
  unlockedMission: 1,
  completedMissions: [],
  salvage: 0,
  upgrades: [],
};

let campaignState = loadCampaign();

function isMissionId(value: unknown): value is MissionId {
  return typeof value === 'string' && MISSION_ORDER.includes(value as MissionId);
}

function loadCampaign(): CampaignState {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGN;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<CampaignState> | null;
    if (!parsed || parsed.version !== 1) return DEFAULT_CAMPAIGN;
    const completedMissions = (parsed.completedMissions ?? []).filter(isMissionId);
    const unlockedMission = Math.max(1, Math.min(3, Number(parsed.unlockedMission) || 1));
    const selectedMissionId = isMissionId(parsed.selectedMissionId) && MISSIONS[parsed.selectedMissionId].number <= unlockedMission
      ? parsed.selectedMissionId
      : MISSION_ORDER[unlockedMission - 1];
    return {
      ...DEFAULT_CAMPAIGN,
      selectedMissionId,
      unlockedMission,
      completedMissions,
      salvage: Math.max(0, Number(parsed.salvage) || 0),
      upgrades: [...new Set(parsed.upgrades ?? [])] as UpgradeId[],
    };
  } catch {
    return DEFAULT_CAMPAIGN;
  }
}

function saveCampaign(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campaignState));
}

export function getCampaignState(): CampaignState {
  return campaignState;
}

export function selectMission(missionId: MissionId): boolean {
  if (MISSIONS[missionId].number > campaignState.unlockedMission) return false;
  campaignState = { ...campaignState, selectedMissionId: missionId };
  saveCampaign();
  return true;
}

export function completeMission(missionId: MissionId): CampaignState {
  if (campaignState.completedMissions.includes(missionId)) return campaignState;
  const mission = MISSIONS[missionId];
  const nextUnlocked = Math.min(3, Math.max(campaignState.unlockedMission, mission.number + 1));
  campaignState = {
    ...campaignState,
    unlockedMission: nextUnlocked,
    completedMissions: [...campaignState.completedMissions, missionId],
    salvage: campaignState.salvage + mission.salvage,
  };
  saveCampaign();
  return campaignState;
}

export function installUpgrade(upgradeId: UpgradeId): CampaignState {
  if (campaignState.upgrades.includes(upgradeId)) return campaignState;
  campaignState = { ...campaignState, upgrades: [...campaignState.upgrades, upgradeId] };
  saveCampaign();
  return campaignState;
}

export function selectNextMission(current: MissionId): MissionId {
  const currentIndex = MISSION_ORDER.indexOf(current);
  const next = MISSION_ORDER[Math.min(MISSION_ORDER.length - 1, currentIndex + 1)];
  selectMission(next);
  return next;
}

export function resetCampaign(): void {
  campaignState = DEFAULT_CAMPAIGN;
  saveCampaign();
}
