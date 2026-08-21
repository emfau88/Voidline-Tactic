import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot');
  }

  public preload(): void {
    this.load.image('ship-player-cruiser-v1', 'assets/ships/player-cruiser-v2.png');
  }

  public create(): void {
    this.scene.start('combat');
  }
}
