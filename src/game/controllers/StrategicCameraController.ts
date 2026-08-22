import Phaser from 'phaser';
import type { ShipState } from '../../domain/combat/types';

export class StrategicCameraController {
  private pointerId?: number;
  private lastX = 0;
  private lastY = 0;
  private travel = 0;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
  ) {}

  public begin(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== undefined) return;
    this.pointerId = pointer.id;
    this.lastX = pointer.x;
    this.lastY = pointer.y;
    this.travel = 0;
  }

  public move(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId || !pointer.isDown) return;
    const deltaX = pointer.x - this.lastX;
    const deltaY = pointer.y - this.lastY;
    this.travel += Math.hypot(deltaX, deltaY);
    this.camera.scrollX -= deltaX / this.camera.zoom;
    this.camera.scrollY -= deltaY / this.camera.zoom;
    this.lastX = pointer.x;
    this.lastY = pointer.y;
  }

  public end(pointer: Phaser.Input.Pointer): boolean {
    if (pointer.id !== this.pointerId) return false;
    const dragged = this.travel > 14;
    this.pointerId = undefined;
    this.travel = 0;
    return dragged;
  }

  public cancel(): void {
    this.pointerId = undefined;
    this.travel = 0;
  }

  public focusFleet(ships: readonly ShipState[]): void {
    const living = ships.filter((ship) => ship.alive && ship.team === 'player');
    if (living.length === 0) return;
    const centerX = living.reduce((sum, ship) => sum + ship.position.x, 0) / living.length;
    const centerY = living.reduce((sum, ship) => sum + ship.position.y, 0) / living.length;
    const targetScrollX = centerX - this.camera.width / (2 * this.camera.zoom);
    const targetScrollY = centerY - this.camera.height / (2 * this.camera.zoom);
    this.scene.tweens.add({
      targets: this.camera, scrollX: targetScrollX, scrollY: targetScrollY,
      duration: 420, ease: 'Cubic.Out',
    });
  }
}
