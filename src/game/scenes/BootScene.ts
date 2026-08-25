import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot');
  }

  public preload(): void {
    this.load.image('ship-player-cruiser-v1', 'assets/ships/player-cruiser-v2.png');
    this.load.image('ship-player-frigate-v1', 'assets/ships/player-frigate-v1.png');
    this.load.image('ship-player-aster-vale-v1', 'assets/ships/player-aster-vale-v1.png');
    this.load.image('ship-player-bramble-v1', 'assets/ships/player-bramble-v1.png');
    this.load.image('aster-module-broadband-array-v1', 'assets/ships/aster-vale/broadband-array-v1.png');
    this.load.image('aster-module-cargo-spine-v1', 'assets/ships/aster-vale/cargo-spine-v1.png');
    this.load.image('aster-module-vector-tail-v1', 'assets/ships/aster-vale/vector-tail-v1.png');
    this.load.image('aster-module-salvage-claws-v2', 'assets/ships/aster-vale/salvage-claws-v2.png');
    this.load.image('aster-module-mining-lasers-v2', 'assets/ships/aster-vale/mining-lasers-v2.png');
    this.load.image('aster-module-rail-lance-v1', 'assets/ships/aster-vale/rail-lance-v1.png');
    this.load.image('aster-module-relic-shrine-v1', 'assets/ships/aster-vale/relic-shrine-v1.png');
    this.load.image('aster-module-side-turrets-v1', 'assets/ships/aster-vale/side-turrets-v1.png');
    this.load.image('ship-enemy-cruiser-v1', 'assets/ships/enemy-cruiser-v1.png');
    this.load.image('ship-enemy-destroyer-v1', 'assets/ships/enemy-destroyer-v1.png');
    this.load.image('ship-enemy-patrol-v1', 'assets/ships/enemy-patrol-v1.png');
    this.load.image('module-aegis-emitter-v1', 'assets/modules/aegis-emitter-v1.svg');
    this.load.image('module-vector-drive-v1', 'assets/modules/vector-drive-v1.svg');
    this.load.image('battlefield-nebula-v1', 'assets/backgrounds/battlefield-nebula-v2.jpg');
    this.load.image('ashen-fringe-v1', 'assets/backgrounds/ashen-fringe-v1.png');
    this.load.image('veloria-rift-v1', 'assets/backgrounds/veloria-rift-v1.webp');
    this.load.image('wormhole-gate-v3', 'assets/objects/wormhole-gate-v3.webp');
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
    this.scene.start('outpost');
  }
}
