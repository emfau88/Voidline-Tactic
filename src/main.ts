import './styles.css';
import { createGame } from './app/createGame';
import { setStarterShipId, type StarterShipId } from './app/starterSelection';

const shell = document.getElementById('game-shell');
const menu = document.getElementById('main-menu');
const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
const starterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-starter]')];
const fullscreenButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-fullscreen]')];
let selectedStarter: StarterShipId = 'p-cruiser';
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

for (const button of starterButtons) {
  button.addEventListener('click', () => selectStarter(button.dataset.starter as StarterShipId));
}

startButton?.addEventListener('click', () => {
  if (gameStarted) return;
  gameStarted = true;
  setStarterShipId(selectedStarter);
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
