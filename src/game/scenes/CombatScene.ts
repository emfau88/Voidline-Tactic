import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../../app/gameConfig';

export class CombatScene extends Phaser.Scene {
  public constructor() {
    super('combat');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#05070c');

    const field = this.add.graphics();
    field.fillGradientStyle(0x101326, 0x101326, 0x060b13, 0x060b13, 1);
    field.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let index = 0; index < 90; index += 1) {
      const x = (index * 83.17) % GAME_WIDTH;
      const y = 72 + ((index * 47.31) % (GAME_HEIGHT - 190));
      const alpha = index % 9 === 0 ? 0.8 : 0.35;
      field.fillStyle(0xd9e7ff, alpha);
      field.fillCircle(x, y, index % 13 === 0 ? 1.2 : 0.55);
    }

    this.add
      .text(GAME_WIDTH / 2, 38, 'VOIDLINE TACTICS', {
        color: '#d9c89f',
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PRODUCTION FOUNDATION\nCOMBAT CORE NEXT', {
        align: 'center',
        color: '#8fcff5',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 42, 'Mobile-first · 390 × 844 reference viewport', {
        color: '#8794a4',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
      })
      .setOrigin(0.5);
  }
}
