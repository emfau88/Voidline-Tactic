import type { ShipDefinition, WeaponDefinition, WeaponKind } from './types';

const degrees = (value: number): number => (value * Math.PI) / 180;

export const WEAPONS: Readonly<Record<WeaponKind, WeaponDefinition>> = {
  broadside: {
    kind: 'broadside', name: 'Mass Driver Broadside', arc: 'broadside', range: 470, halfAngle: degrees(48),
    energyCost: 3, damage: 24, shieldMultiplier: 1, cooldownMs: 4_200,
  },
  lance: {
    kind: 'lance', name: 'Rift Lance', arc: 'front', range: 650, halfAngle: degrees(38),
    energyCost: 18, damage: 38, shieldMultiplier: 1.3, cooldownMs: 7_500, chargeMs: 1_600,
  },
  torpedo: {
    kind: 'torpedo', name: 'Void Torpedo', arc: 'front', range: 700, halfAngle: degrees(48),
    energyCost: 12, damage: 46, shieldMultiplier: 1, cooldownMs: 9_500,
    projectileSpeed: 190, projectileTurnRate: degrees(78),
  },
};

export const SHIPS: readonly ShipDefinition[] = [
  {
    id: 'p-cruiser', team: 'player', name: "Sovereign's Fury", class: 'cruiser',
    maxHull: 112, maxShield: 68, armor: 0.1, maxEnergy: 80, energyRegenPerSecond: 3.2,
    maxSpeed: 58, acceleration: 24, turnRate: degrees(25), radius: 48,
    weapons: ['broadside', 'lance', 'torpedo'], startPosition: { x: 350, y: 1_160 }, startFacing: -Math.PI / 2,
  },
  {
    id: 'p-frigate', team: 'player', name: 'Aster Vale', class: 'frigate',
    maxHull: 72, maxShield: 38, armor: 0.05, maxEnergy: 68, energyRegenPerSecond: 4.2,
    maxSpeed: 82, acceleration: 38, turnRate: degrees(43), radius: 34,
    weapons: ['lance', 'torpedo'], startPosition: { x: 675, y: 1_250 }, startFacing: -Math.PI / 2,
  },
  {
    id: 'e-cruiser', team: 'enemy', name: 'Ashen Crown', class: 'cruiser',
    maxHull: 102, maxShield: 54, armor: 0.08, maxEnergy: 74, energyRegenPerSecond: 3,
    maxSpeed: 54, acceleration: 22, turnRate: degrees(23), radius: 46,
    weapons: ['broadside', 'lance'], startPosition: { x: 380, y: 520 }, startFacing: Math.PI / 2,
  },
  {
    id: 'e-destroyer', team: 'enemy', name: 'Red Wake', class: 'destroyer',
    maxHull: 64, maxShield: 32, armor: 0.04, maxEnergy: 65, energyRegenPerSecond: 4,
    maxSpeed: 76, acceleration: 34, turnRate: degrees(38), radius: 38,
    weapons: ['lance', 'torpedo'], startPosition: { x: 705, y: 580 }, startFacing: Math.PI / 2,
  },
];
