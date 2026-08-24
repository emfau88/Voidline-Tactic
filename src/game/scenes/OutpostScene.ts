import Phaser from 'phaser';
import { getProfile, subscribe } from '../../app/gameFlow';
import type { FacilityId } from '../../domain/outpost/types';

export class OutpostScene extends Phaser.Scene {
  private unsubscribe?: () => void;

  public constructor() { super('outpost'); }

  public create(): void {
    this.scale.on('resize', this.draw, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
    this.unsubscribe = subscribe(() => this.draw());
    this.draw();
  }

  private draw(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const profile = getProfile();
    this.tweens.killAll();
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#080a12');

    const backdrop = this.add.image(width / 2, height / 2, 'farhaven-outpost-v1');
    const backdropScale = Math.max(width / backdrop.width, height / backdrop.height);
    backdrop.setDisplaySize(backdrop.width * backdropScale, backdrop.height * backdropScale);
    this.add.rectangle(0, 0, width, height, 0x02060c, 0.17).setOrigin(0);
    this.add.text(width * 0.5, height * 0.09, 'FARHAVEN', {
      fontFamily: 'Georgia, serif', fontSize: Math.max(26, width * 0.038), color: '#f6e4bc', letterSpacing: 7,
    }).setOrigin(0.5);
    this.add.text(width * 0.5, height * 0.14, 'ZUFUCHT AM RAND DER VOIDLINE · TIPPE EINEN BEREICH AN', {
      fontFamily: 'Arial', fontSize: Math.max(8, width * 0.009), color: '#a7e5f4', letterSpacing: 1.5,
    }).setOrigin(0.5);

    const hangarX = width * 0.58;
    const hangarY = height * 0.69;
    if (profile.facilities.hangar > 0) {
      const hangar = this.add.image(hangarX, hangarY, 'farhaven-hangar-module-v1');
      const hangarScale = Math.min(Math.min(width * 0.235, 360) / hangar.width, Math.min(height * 0.58, 550) / hangar.height);
      hangar.setDisplaySize(hangar.width * hangarScale, hangar.height * hangarScale).setOrigin(0.5, 0.17);
      hangar.setAlpha(0.98);
      this.tweens.add({ targets: hangar, alpha: { from: 0.78, to: 1 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else {
      const scaffold = this.add.graphics();
      const scaffoldWidth = Math.min(width * 0.19, 280);
      const scaffoldHeight = Math.min(height * 0.36, 330);
      scaffold.fillStyle(0x050b13, 0.76);
      scaffold.fillRoundedRect(hangarX - scaffoldWidth / 2, hangarY - scaffoldHeight * 0.12, scaffoldWidth, scaffoldHeight, 18);
      scaffold.lineStyle(2, 0x5c89a1, 0.72);
      scaffold.strokeRoundedRect(hangarX - scaffoldWidth / 2, hangarY - scaffoldHeight * 0.12, scaffoldWidth, scaffoldHeight, 18);
      scaffold.lineStyle(1, 0xc69b54, 0.64);
      for (let offset = -scaffoldWidth * 0.42; offset < scaffoldWidth * 0.42; offset += 24) {
        scaffold.lineBetween(hangarX + offset, hangarY + scaffoldHeight * 0.18, hangarX + offset + 34, hangarY + scaffoldHeight * 0.04);
      }
      this.add.text(hangarX, hangarY + scaffoldHeight * 0.09, 'FREIER DOCKANSCHLUSS', {
        fontFamily: 'Arial', fontSize: Math.max(8, width * 0.008), color: '#9ed8e6', fontStyle: 'bold', letterSpacing: 1.1,
      }).setOrigin(0.5);
      this.add.text(hangarX, hangarY + scaffoldHeight * 0.16, 'Hangar kann hier errichtet werden', {
        fontFamily: 'Arial', fontSize: Math.max(7, width * 0.0065), color: '#aab7bd',
      }).setOrigin(0.5);
    }

    const locations: readonly [FacilityId, string, number, number, number, number][] = [
      ['navigation', 'STERNENWERK', 0.59, 0.28, 0.64, 0.2],
      ['hangar', profile.facilities.hangar ? 'HANGAR · ONLINE' : 'HANGAR · BAUPLATZ', 0.58, 0.74, 0.58, 0.93],
      ['scanner', 'SCANNERKAPELLE', 0.75, 0.5, 0.79, 0.62],
      ['labor', 'RELIKTLABOR', 0.36, 0.49, 0.3, 0.61],
    ];
    locations.forEach(([id, label, xRatio, yRatio, labelXRatio, labelYRatio]) => {
      const x = width * xRatio;
      const y = height * yRatio;
      const upgraded = profile.facilities[id] > 0;
      const zone = this.add.rectangle(x, y, id === 'hangar' ? Math.max(126, width * 0.145) : Math.max(82, width * 0.085), id === 'hangar' ? Math.max(118, height * 0.26) : Math.max(72, height * 0.14), 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      const marker = this.add.rectangle(width * labelXRatio, height * labelYRatio, Math.max(88, width * 0.09), Math.max(22, height * 0.032), 0x08121d, 0.74)
        .setStrokeStyle(1, upgraded ? 0xa3ead0 : 0x6cc8e0, 0.7);
      const labelText = this.add.text(width * labelXRatio, height * labelYRatio, label, { fontFamily: 'Arial', fontSize: Math.max(8, width * 0.009), color: '#e6f4f4', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);
      zone.on('pointerover', () => { marker.setFillStyle(0x173044, 0.94); marker.setStrokeStyle(2, 0xf0d488, 0.95); labelText.setColor('#fff4d9'); });
      zone.on('pointerout', () => { marker.setFillStyle(0x08121d, 0.74); marker.setStrokeStyle(1, upgraded ? 0xa3ead0 : 0x6cc8e0, 0.7); labelText.setColor('#e6f4f4'); });
      zone.on('pointerdown', () => this.game.events.emit('farhaven:facility-selected', id));
    });
  }
}
