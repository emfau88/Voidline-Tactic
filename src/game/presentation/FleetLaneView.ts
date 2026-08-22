import Phaser from 'phaser';
import { NEBULA_CENTER, NEBULA_RADIUS } from '../../domain/combat/constants';
import type { Team } from '../../domain/combat/types';
import { LANE_JUNCTIONS, LANES, LANE_ORDER, lanePointAt } from '../../domain/fleet/lanes';
import type { FleetBattleState, FleetObjectiveState } from '../../domain/fleet/types';

function ownerColor(owner?: Team): number {
  return owner === 'player' ? 0x55c9ff : owner === 'enemy' ? 0xff5f70 : 0xd4bd83;
}

export class FleetLaneView {
  private readonly staticGraphics: Phaser.GameObjects.Graphics;
  private readonly objectiveGraphics: Phaser.GameObjects.Graphics;
  private readonly labels = new Map<FleetObjectiveState['id'], Phaser.GameObjects.Text>();
  private readonly laneLabels: Phaser.GameObjects.Text[] = [];

  public constructor(private readonly scene: Phaser.Scene, state: FleetBattleState) {
    this.staticGraphics = scene.add.graphics().setDepth(-11);
    this.objectiveGraphics = scene.add.graphics().setDepth(8);
    this.drawStatic();
    const routeNames = { upper: 'OBERE ROUTE', center: 'MITTLERE ROUTE', lower: 'UNTERE ROUTE' } as const;
    for (const laneId of LANE_ORDER) {
      const position = lanePointAt(laneId, 0.19);
      this.laneLabels.push(scene.add.text(position.x, position.y - 76, routeNames[laneId], {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#9ac7dc',
        stroke: '#05070c', strokeThickness: 4,
      }).setOrigin(0.5).setAlpha(0.72).setDepth(7));
    }
    for (const objective of Object.values(state.fleet.objectives)) {
      const label = scene.add.text(objective.position.x, objective.position.y - objective.radius - 34, '', {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#eef8ff',
        stroke: '#05070c', strokeThickness: 5, align: 'center',
      }).setOrigin(0.5).setDepth(9);
      this.labels.set(objective.id, label);
    }
    this.sync(state);
  }

  private drawStatic(): void {
    const graphics = this.staticGraphics;
    graphics.clear();
    graphics.fillStyle(0x5f77a1, 0.1);
    graphics.fillCircle(NEBULA_CENTER.x, NEBULA_CENTER.y, NEBULA_RADIUS);
    graphics.lineStyle(4, 0x7899c7, 0.28);
    graphics.strokeCircle(NEBULA_CENTER.x, NEBULA_CENTER.y, NEBULA_RADIUS);
    graphics.lineStyle(2, 0xa9c8ee, 0.18);
    graphics.strokeCircle(NEBULA_CENTER.x, NEBULA_CENTER.y, NEBULA_RADIUS * 0.72);

    for (const laneId of LANE_ORDER) {
      const lane = LANES[laneId];
      graphics.lineStyle(lane.width, lane.color, laneId === 'center' ? 0.07 : 0.055);
      graphics.beginPath();
      lane.points.forEach((point, index) => index === 0 ? graphics.moveTo(point.x, point.y) : graphics.lineTo(point.x, point.y));
      graphics.strokePath();
      graphics.lineStyle(5, lane.color, laneId === 'center' ? 0.42 : 0.31);
      graphics.beginPath();
      lane.points.forEach((point, index) => index === 0 ? graphics.moveTo(point.x, point.y) : graphics.lineTo(point.x, point.y));
      graphics.strokePath();
      graphics.lineStyle(2, 0xe5f5ff, 0.18);
      for (let progress = 0.08; progress < 1; progress += 0.09) {
        const a = lanePointAt(laneId, progress);
        const b = lanePointAt(laneId, Math.min(1, progress + 0.035));
        graphics.lineBetween(a.x, a.y, b.x, b.y);
      }
    }

    for (const junction of LANE_JUNCTIONS) {
      const upper = lanePointAt('upper', junction.progress);
      const lower = lanePointAt('lower', junction.progress);
      graphics.lineStyle(36, 0x75bfe3, 0.065);
      graphics.lineBetween(upper.x, upper.y, lower.x, lower.y);
      graphics.lineStyle(3, 0x9bdcff, 0.32);
      graphics.lineBetween(upper.x, upper.y, lower.x, lower.y);
      const center = lanePointAt('center', junction.progress);
      graphics.fillStyle(0xb8e9ff, 0.72);
      graphics.fillCircle(center.x, center.y, 8);
    }
  }

  public sync(state: FleetBattleState): void {
    this.objectiveGraphics.clear();
    for (const objective of Object.values(state.fleet.objectives)) {
      const color = ownerColor(objective.owner);
      const progress = Math.abs(objective.captureProgress);
      this.objectiveGraphics.fillStyle(color, 0.08);
      this.objectiveGraphics.fillCircle(objective.position.x, objective.position.y, objective.radius);
      this.objectiveGraphics.lineStyle(5, color, 0.75);
      this.objectiveGraphics.strokeCircle(objective.position.x, objective.position.y, objective.radius);
      this.objectiveGraphics.lineStyle(10, color, 0.95);
      this.objectiveGraphics.beginPath();
      this.objectiveGraphics.arc(
        objective.position.x, objective.position.y, objective.radius + 12,
        -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress,
      );
      this.objectiveGraphics.strokePath();
      this.objectiveGraphics.fillStyle(color, 0.95);
      if (objective.kind === 'relay') {
        this.objectiveGraphics.fillTriangle(
          objective.position.x, objective.position.y - 30,
          objective.position.x - 27, objective.position.y + 24,
          objective.position.x + 27, objective.position.y + 24,
        );
      } else {
        this.objectiveGraphics.fillRect(objective.position.x - 28, objective.position.y - 22, 56, 44);
        this.objectiveGraphics.fillStyle(0x07101a, 0.9);
        this.objectiveGraphics.fillCircle(objective.position.x, objective.position.y, 10);
      }
      const label = this.labels.get(objective.id);
      const status = objective.owner === 'player' ? 'VERBÜNDET' : objective.owner === 'enemy' ? 'FEINDLICH'
        : progress < 0.04 ? 'NEUTRAL' : `${Math.round(progress * 100)} % UMKÄMPFT`;
      label?.setText(`${objective.name.toUpperCase()}\n${status}`);
      label?.setColor(objective.owner === 'player' ? '#8de4ff' : objective.owner === 'enemy' ? '#ff9ca8' : '#ead7a4');
    }
  }

  public destroy(): void {
    this.staticGraphics.destroy();
    this.objectiveGraphics.destroy();
    for (const label of this.labels.values()) label.destroy();
    for (const label of this.laneLabels) label.destroy();
  }
}
