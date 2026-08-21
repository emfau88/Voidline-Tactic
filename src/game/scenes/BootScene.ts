import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot');
  }

  public preload(): void {
    this.load.image('ship-player-cruiser-v1', 'assets/ships/player-cruiser-v2.png');
    this.load.image('ship-player-frigate-v1', 'assets/ships/player-frigate-v1.png');
    this.load.image('ship-enemy-cruiser-v1', 'assets/ships/enemy-cruiser-v1.png');
    this.load.image('ship-enemy-destroyer-v1', 'assets/ships/enemy-destroyer-v1.png');
    this.load.image('battlefield-nebula-v1', 'assets/backgrounds/battlefield-nebula-v2.jpg');
  }

  public create(): void {
    this.scene.start('combat');
  }
}
