import Phaser from 'phaser';
import type { Team } from '../../domain/combat/types';
import { LANES, LANE_ORDER, lanePointAt } from '../../domain/fleet/lanes';
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
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#9ac7dc',
        stroke: '#05070c', strokeThickness: 4,
      }).setOrigin(0.5).setAlpha(0.72).setDepth(7));
    }
    for (const objective of Object.values(state.fleet.objectives)) {
      const label = scene.add.text(objective.position.x, objective.position.y - objective.radius - 34, '', {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '27px', fontStyle: 'bold', color: '#eef8ff',
        stroke: '#05070c', strokeThickness: 5, align: 'center',
      }).setOrigin(0.5).setDepth(9);
      this.labels.set(objective.id, label);
    }
    this.sync(state);
  }

  private drawStatic(): void {
    const graphics = this.staticGraphics;
    graphics.clear();
    for (const laneId of LANE_ORDER) {
      const lane = LANES[laneId];
      graphics.lineStyle(laneId === 'center' ? 9 : 7, lane.color, laneId === 'center' ? 0.36 : 0.25);
      graphics.beginPath();
      lane.points.forEach((point, index) => index === 0 ? graphics.moveTo(point.x, point.y) : graphics.lineTo(point.x, point.y));
      graphics.strokePath();
    }
  }

  public sync(state: FleetBattleState): void {
    this.objectiveGraphics.clear();
    for (const objective of Object.values(state.fleet.objectives)) {
      const color = ownerColor(objective.owner);
      const progress = Math.abs(objective.captureProgress);
      this.objectiveGraphics.fillStyle(0x06111c, 0.82);
      this.objectiveGraphics.fillCircle(objective.position.x, objective.position.y, 44);
      this.objectiveGraphics.lineStyle(5, color, 0.72);
      this.objectiveGraphics.strokeCircle(objective.position.x, objective.position.y, 46);
      if (progress > 0.025) {
        this.objectiveGraphics.lineStyle(8, color, 0.95);
        this.objectiveGraphics.beginPath();
        this.objectiveGraphics.arc(objective.position.x, objective.position.y, 60, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        this.objectiveGraphics.strokePath();
      }
      this.objectiveGraphics.fillStyle(color, 0.95);
      if (objective.kind === 'relay') {
        this.objectiveGraphics.fillTriangle(
          objective.position.x, objective.position.y - 18,
          objective.position.x - 16, objective.position.y + 15,
          objective.position.x + 16, objective.position.y + 15,
        );
      } else {
        this.objectiveGraphics.fillRect(objective.position.x - 20, objective.position.y - 15, 40, 30);
        this.objectiveGraphics.fillStyle(0x07101a, 0.9);
        this.objectiveGraphics.fillCircle(objective.position.x, objective.position.y, 7);
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
