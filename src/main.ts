import './styles.css';
import { getCampaignState, selectMission } from './app/campaign';
import { createGame } from './app/createGame';
import { setStarterModuleId, setStarterShipId, type StarterShipId } from './app/starterSelection';
import { MISSIONS } from './domain/combat/missions';
import { STARTER_MODULES } from './domain/combat/starterModules';
import type { MissionId, StarterModuleId } from './domain/combat/types';

const shell = document.getElementById('game-shell');
const menu = document.getElementById('main-menu');
const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
const starterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-starter]')];
const starterModuleButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-starter-module]')];
const fullscreenButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-fullscreen]')];
const missionButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-mission]')];
let selectedStarter: StarterShipId = 'p-cruiser';
let selectedStarterModule: StarterModuleId | undefined;
let gameStarted = false;
let shellStatusTimer: number | undefined;

function reportShellStatus(message: string): void {
  if (shell?.dataset.screen === 'menu') {
    const status = document.getElementById('menu-status');
    if (status) status.textContent = message;
    return;
  }
  const toast = document.getElementById('toast');
  if (!toast) return;
  window.clearTimeout(shellStatusTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  shellStatusTimer = window.setTimeout(() => toast.classList.remove('visible'), 3_400);
}

function selectStarter(starter: StarterShipId): void {
  selectedStarter = starter;
  for (const button of starterButtons) {
    const selected = button.dataset.starter === starter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const starterName = starter === 'p-cruiser' ? "Sovereign's Fury" : 'Aster Vale';
  const label = document.getElementById('selected-starter-label');
  if (label) label.textContent = starterName;
}

function selectStarterModule(moduleId: StarterModuleId): void {
  selectedStarterModule = moduleId;
  const definition = STARTER_MODULES[moduleId];
  if (menu) menu.dataset.starterModule = moduleId;
  for (const button of starterModuleButtons) {
    const selected = button.dataset.starterModule === moduleId;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const status = document.getElementById('starter-module-status');
  const startStatus = document.getElementById('start-loadout-status');
  if (status) status.textContent = `${definition.name.toUpperCase()} · MONTIERT`;
  if (startStatus) startStatus.textContent = `2 Schiffe · 3 Korridore · ${definition.name}`;
  if (startButton) startButton.disabled = false;
}

function updateCampaignUi(): void {
  const campaign = getCampaignState();
  for (const button of missionButtons) {
    const missionId = button.dataset.mission as MissionId;
    const definition = MISSIONS[missionId];
    const selected = missionId === campaign.selectedMissionId;
    button.disabled = definition.number > campaign.unlockedMission;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const salvage = document.getElementById('campaign-salvage');
  const briefingTitle = document.getElementById('mission-briefing-title');
  const briefingCopy = document.getElementById('mission-briefing-copy');
  const startNumber = document.getElementById('start-mission-number');
  const startName = document.getElementById('start-mission-name');
  if (salvage) salvage.textContent = 'PROOF OF CONCEPT · FLEET CORRIDORS';
  if (briefingTitle) briefingTitle.textContent = 'EINSATZ 01 · KORRIDORBRUCH';
  if (briefingCopy) briefingCopy.textContent = 'Führe deinen Verband indirekt über drei Routen, sichere Relais und Werft und zerstöre das gegnerische Command Ship.';
  if (startNumber) startNumber.textContent = 'EINSATZ 01';
  if (startName) startName.textContent = 'FLEET CORRIDORS STARTEN';
  const startStatus = document.getElementById('start-loadout-status');
  if (startStatus && selectedStarterModule) {
    const module = STARTER_MODULES[selectedStarterModule];
    startStatus.textContent = `2 Schiffe · 3 Korridore · ${module.name}`;
  }
}

for (const button of starterButtons) {
  button.addEventListener('click', () => selectStarter(button.dataset.starter as StarterShipId));
}

for (const button of starterModuleButtons) {
  button.addEventListener('click', () => selectStarterModule(button.dataset.starterModule as StarterModuleId));
}

for (const button of missionButtons) {
  button.addEventListener('click', () => {
    selectMission(button.dataset.mission as MissionId);
    updateCampaignUi();
  });
}

startButton?.addEventListener('click', () => {
  if (gameStarted || !selectedStarterModule) {
    reportShellStatus('Vor dem ersten Kampf muss ein sichtbares Modul montiert werden.');
    return;
  }
  gameStarted = true;
  setStarterShipId(selectedStarter);
  setStarterModuleId(selectedStarterModule);
  startButton.disabled = true;
  shell?.setAttribute('aria-busy', 'true');
  if (shell) shell.dataset.screen = 'battle';
  if (menu) menu.hidden = true;
  createGame('game-root');
});

async function toggleFullscreen(): Promise<void> {
  const fullscreenTarget = shell ?? document.documentElement;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled) await fullscreenTarget.requestFullscreen({ navigationUI: 'hide' });
    else reportShellStatus('Kein Web-Vollbild verfügbar. Auf iOS: Zum Home-Bildschirm hinzufügen.');
  } catch {
    reportShellStatus('Vollbild konnte nicht geöffnet werden. Bitte die Browser-Einstellung prüfen.');
  }
}

for (const button of fullscreenButtons) {
  button.disabled = false;
  button.addEventListener('click', () => void toggleFullscreen());
}

document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  for (const button of fullscreenButtons) {
    button.setAttribute('aria-pressed', String(active));
    button.title = active ? 'Vollbild verlassen' : 'Vollbild öffnen';
  }
});

shell?.setAttribute('aria-busy', 'false');
selectStarter(selectedStarter);
updateCampaignUi();
