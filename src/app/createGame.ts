import Phaser from 'phaser';
import { createGameConfig } from './gameConfig';

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game(createGameConfig(parent));
}
