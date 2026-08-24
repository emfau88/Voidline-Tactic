import Phaser from 'phaser';
import { createGameConfig } from './gameConfig';
import { RENDER_DENSITY } from './display';

export function createGame(parent: string): Phaser.Game {
  const game = new Phaser.Game(createGameConfig(parent));
  const host = document.getElementById(parent);
  if (!host) return game;

  const resizeCanvas = () => {
    const width = Math.max(1, Math.round(host.clientWidth * RENDER_DENSITY));
    const height = Math.max(1, Math.round(host.clientHeight * RENDER_DENSITY));
    if (game.scale.width !== width || game.scale.height !== height) game.scale.resize(width, height);
  };
  const observer = new ResizeObserver(resizeCanvas);
  observer.observe(host);
  resizeCanvas();
  return game;
}
