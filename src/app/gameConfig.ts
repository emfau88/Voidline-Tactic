import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene';
import { CombatScene } from '../game/scenes/CombatScene';

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#05070c',
    transparent: false,
    antialias: true,
    render: {
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, CombatScene],
  };
}
