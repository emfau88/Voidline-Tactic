import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot');
  }

  public preload(): void {
    // Farhaven is the first screen, so only load the station's critical artwork
    // here. Campaign, combat and module art belongs to ExpeditionScene's lazy
    // preload; otherwise a phone downloads the whole game before it can show a
    // single useful pixel.
    this.load.image('ship-player-aster-vale-v1', 'assets/ships/player-aster-vale-v1.png');
    this.load.image('ship-player-bramble-v1', 'assets/ships/player-bramble-v1.png');
    this.load.image('resource-alloys-v1', 'assets/ui/resource-alloys-v1.png');
    this.load.image('resource-data-v1', 'assets/ui/resource-data-v1.png');
    this.load.image('resource-relics-v1', 'assets/ui/resource-relics-v1.png');
    this.load.image('farhaven-core-v2', 'assets/outpost/farhaven-core-v2.png');
    this.load.image('farhaven-space-v1', 'assets/outpost/farhaven-space-v1.png');
    this.load.spritesheet('farhaven-module-kit-v2', 'assets/outpost/farhaven-module-kit-v4.png', { frameWidth: 627, frameHeight: 627 });
  }

  public create(): void {
    // Frame 1 contains a disconnected 15px remnant from the generated atlas edge.
    // Register a clean sub-frame without changing the source artwork.
    this.textures.get('farhaven-module-kit-v2').add('scanner-clean', 0, 643, 0, 611, 627);
    document.getElementById('startup-splash')?.setAttribute('hidden', '');
    this.scene.start('outpost');
  }
}
