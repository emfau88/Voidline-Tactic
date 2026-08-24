import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene';
import { ExpeditionScene } from '../game/scenes/ExpeditionScene';
import { OutpostScene } from '../game/scenes/OutpostScene';
import { GAME_HEIGHT, GAME_WIDTH, RENDER_DENSITY } from './display';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  const host = document.getElementById(parent);
  const width = Math.round((host?.clientWidth || GAME_WIDTH) * RENDER_DENSITY);
  const height = Math.round((host?.clientHeight || GAME_HEIGHT) * RENDER_DENSITY);
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: '#05070c',
    transparent: false,
    antialias: true,
    render: {
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER,
      width,
      height,
    },
    scene: [BootScene, OutpostScene, ExpeditionScene],
  };
}
