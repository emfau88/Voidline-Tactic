import Phaser from 'phaser';
import type { ShipState } from '../../domain/combat/types';
import { SHIP_PRESENTATIONS } from './shipPresentation';

export class ShipView extends Phaser.GameObjects.Container {
  private readonly hullGraphics: Phaser.GameObjects.Graphics;
  private readonly engineGlow: Phaser.GameObjects.Graphics;
  private readonly status: Phaser.GameObjects.Graphics;
  private readonly bars: Phaser.GameObjects.Graphics;
  private readonly mounts: Phaser.GameObjects.Graphics;
  private readonly art?: Phaser.GameObjects.Image;

  public constructor(scene: Phaser.Scene, ship: ShipState) {
    super(scene, ship.position.x, ship.position.y);
    const presentation = SHIP_PRESENTATIONS[ship.id];
    this.hullGraphics = scene.add.graphics();
    this.engineGlow = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.status = scene.add.graphics();
    this.bars = scene.add.graphics();
    this.mounts = scene.add.graphics();
    if (presentation) {
      this.art = scene.add
        .image(0, 0, presentation.texture)
        .setDisplaySize(ship.radius * presentation.spriteWidthInRadii, ship.radius * presentation.spriteLengthInRadii)
        .setRotation(Math.PI / 2);
    }
    this.add([this.status, this.engineGlow, this.hullGraphics, ...(this.art ? [this.art] : []), this.mounts, this.bars]);
    this.setDepth(20);
    scene.add.existing(this);
    scene.tweens.add({
      targets: this.engineGlow,
      alpha: { from: 0.52, to: 0.92 },
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
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
    const presentation = SHIP_PRESENTATIONS[ship.id];
    const statusLength = ship.radius * (presentation ? presentation.spriteLengthInRadii * 1.12 : 2.96);
    const statusWidth = ship.radius * (presentation ? presentation.spriteWidthInRadii * 1.38 : 2.96);
    this.hullGraphics.clear();
    this.engineGlow.clear();
    this.status.clear();
    this.bars.clear();
    this.mounts.clear();

    if (selected) {
      this.status.lineStyle(4, 0x63baff, 0.95);
      this.status.strokeEllipse(0, 0, statusLength, statusWidth);
    } else if (targeted) {
      this.status.lineStyle(4, 0xef5d68, 0.95);
      this.status.strokeEllipse(0, 0, statusLength, statusWidth);
    }
    if (ship.shield > 0) {
      this.status.lineStyle(2, friendly ? 0x57aef0 : 0xb95770, 0.24 + 0.35 * (ship.shield / ship.maxShield));
      this.status.strokeEllipse(0, 0, statusLength * 1.08, statusWidth * 1.13);
    }

    const enginePoints = presentation?.hardpoints.engines ?? [{ x: -1.1, y: 0 }];
    for (const engine of enginePoints) {
      const x = engine.x * ship.radius;
      const y = engine.y * ship.radius;
      this.engineGlow.fillStyle(friendly ? 0x5ac8ff : 0xff5d62, 0.18);
      this.engineGlow.fillEllipse(x - ship.radius * 0.2, y, ship.radius * 0.72, ship.radius * 0.3);
      this.engineGlow.fillStyle(friendly ? 0xb7efff : 0xffc0a5, 0.82);
      this.engineGlow.fillCircle(x, y, Math.max(3, ship.radius * 0.085));
    }

    if (!this.art) {
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
    } else {
      this.art.setTint(ship.hull / ship.maxHull < 0.35 ? 0xffb2a4 : 0xffffff);
    }

    if (presentation) {
      const mountAlpha = selected ? 0.95 : 0.58;
      const mountRadius = Math.max(2.4, ship.radius * 0.065);
      const drawMount = (x: number, y: number, color: number, radius = mountRadius): void => {
        this.mounts.fillStyle(0x02050a, 0.82);
        this.mounts.fillCircle(x * ship.radius, y * ship.radius, radius * 1.6);
        this.mounts.fillStyle(color, mountAlpha);
        this.mounts.fillCircle(x * ship.radius, y * ship.radius, radius);
      };
      for (const point of presentation.hardpoints.lance) drawMount(point.x, point.y, 0xd986ff, mountRadius * 1.15);
      for (const point of presentation.hardpoints.torpedo) drawMount(point.x, point.y, 0xffb15f);
      const broadsideMounts = [
        ...presentation.hardpoints.portBroadside,
        ...presentation.hardpoints.starboardBroadside,
      ];
      for (const point of broadsideMounts) drawMount(point.x, point.y, 0x79d2ff, mountRadius * 0.86);
    }

    const barWidth = ship.radius * 2.35;
    this.bars.fillStyle(0x05070a, 0.88);
    this.bars.fillRect(-barWidth / 2, 0, barWidth, 13);
    this.bars.fillStyle(friendly ? 0x65d58e : 0xef646b, 1);
    this.bars.fillRect(-barWidth / 2, 0, barWidth * (ship.hull / ship.maxHull), 5);
    this.bars.fillStyle(friendly ? 0x55aef1 : 0xb25b70, 1);
    this.bars.fillRect(-barWidth / 2, 7, barWidth * (ship.shield / ship.maxShield), 4);
  }
}
