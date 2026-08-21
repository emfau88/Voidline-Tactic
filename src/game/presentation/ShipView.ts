import Phaser from 'phaser';
import type { ShipState } from '../../domain/combat/types';

export class ShipView extends Phaser.GameObjects.Container {
  private readonly hullGraphics: Phaser.GameObjects.Graphics;
  private readonly status: Phaser.GameObjects.Graphics;
  private readonly bars: Phaser.GameObjects.Graphics;

  public constructor(scene: Phaser.Scene, ship: ShipState) {
    super(scene, ship.position.x, ship.position.y);
    this.hullGraphics = scene.add.graphics();
    this.status = scene.add.graphics();
    this.bars = scene.add.graphics();
    this.add([this.status, this.hullGraphics, this.bars]);
    this.setDepth(20);
    scene.add.existing(this);
    this.sync(ship, false, false, true);
  }

  public sync(ship: ShipState, selected: boolean, targeted: boolean, transform: boolean): void {
    if (transform) {
      this.setPosition(ship.position.x, ship.position.y);
      this.setRotation(ship.facing);
    }
    const barOffset = ship.radius * 1.62;
    this.bars.setPosition(Math.sin(ship.facing) * barOffset, Math.cos(ship.facing) * barOffset);
    this.bars.setRotation(-ship.facing);
    this.setVisible(ship.alive);
    this.redraw(ship, selected, targeted);
  }

  private redraw(ship: ShipState, selected: boolean, targeted: boolean): void {
    const friendly = ship.team === 'player';
    const length = ship.radius * 2.15;
    const width = ship.radius * (ship.class === 'frigate' ? 0.74 : 0.96);
    this.hullGraphics.clear();
    this.status.clear();
    this.bars.clear();

    if (selected) {
      this.status.lineStyle(4, 0x63baff, 0.95);
      this.status.strokeCircle(0, 0, ship.radius * 1.48);
    } else if (targeted) {
      this.status.lineStyle(4, 0xef5d68, 0.95);
      this.status.strokeCircle(0, 0, ship.radius * 1.5);
    }
    if (ship.shield > 0) {
      this.status.lineStyle(2, friendly ? 0x57aef0 : 0xb95770, 0.24 + 0.35 * (ship.shield / ship.maxShield));
      this.status.strokeEllipse(0, 0, ship.radius * 2.55, ship.radius * 2.05);
    }

    this.hullGraphics.fillStyle(friendly ? 0xd7c9a9 : 0x555a64, 1);
    this.hullGraphics.lineStyle(3, friendly ? 0x9d7e43 : 0xa63d48, 1);
    this.hullGraphics.beginPath();
    this.hullGraphics.moveTo(length * 0.58, 0);
    this.hullGraphics.lineTo(length * 0.18, -width * 0.55);
    this.hullGraphics.lineTo(-length * 0.36, -width * 0.5);
    this.hullGraphics.lineTo(-length * 0.52, -width * 0.22);
    this.hullGraphics.lineTo(-length * 0.6, 0);
    this.hullGraphics.lineTo(-length * 0.52, width * 0.22);
    this.hullGraphics.lineTo(-length * 0.36, width * 0.5);
    this.hullGraphics.lineTo(length * 0.18, width * 0.55);
    this.hullGraphics.closePath();
    this.hullGraphics.fillPath();
    this.hullGraphics.strokePath();

    this.hullGraphics.fillStyle(friendly ? 0x8c7b5d : 0x2d3138, 1);
    this.hullGraphics.fillRect(-length * 0.3, -width * 0.12, length * 0.72, width * 0.24);
    this.hullGraphics.fillStyle(friendly ? 0x67c9ff : 0xff6e67, 0.9);
    this.hullGraphics.fillCircle(-length * 0.53, 0, Math.max(5, ship.radius * 0.13));

    const barWidth = ship.radius * 2.35;
    this.bars.fillStyle(0x05070a, 0.88);
    this.bars.fillRect(-barWidth / 2, 0, barWidth, 13);
    this.bars.fillStyle(friendly ? 0x65d58e : 0xef646b, 1);
    this.bars.fillRect(-barWidth / 2, 0, barWidth * (ship.hull / ship.maxHull), 5);
    this.bars.fillStyle(friendly ? 0x55aef1 : 0xb25b70, 1);
    this.bars.fillRect(-barWidth / 2, 7, barWidth * (ship.shield / ship.maxShield), 4);
  }
}
