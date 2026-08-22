import { describe, expect, it } from 'vitest';
import { createCombatState } from '../../src/domain/combat/combatEngine';
import { SHIP_PRESENTATIONS, weaponOrigins } from '../../src/game/presentation/shipPresentation';

describe('ship presentation hardpoints', () => {
  it('rotates the player cruiser lance origin with its facing', () => {
    const cruiser = createCombatState().ships['p-cruiser'];
    const [origin] = weaponOrigins(cruiser, { x: cruiser.position.x + 300, y: cruiser.position.y }, 'lance');

    expect(origin.x).toBeCloseTo(cruiser.position.x + cruiser.radius * 1.28, 5);
    expect(origin.y).toBeCloseTo(cruiser.position.y, 5);
  });

  it('chooses the broadside hardpoints on the side facing the target', () => {
    const cruiser = createCombatState().ships['p-cruiser'];
    const southernOrigins = weaponOrigins(cruiser, { x: cruiser.position.x, y: cruiser.position.y + 300 }, 'broadside');
    const northernOrigins = weaponOrigins(cruiser, { x: cruiser.position.x, y: cruiser.position.y - 300 }, 'broadside');

    expect(southernOrigins).toHaveLength(3);
    expect(northernOrigins).toHaveLength(3);
    expect(southernOrigins.every((origin) => origin.y > cruiser.position.y)).toBe(true);
    expect(northernOrigins.every((origin) => origin.y < cruiser.position.y)).toBe(true);
  });

  it('defines distinct runtime art and weapon origins for all four ships', () => {
    const state = createCombatState();

    expect(Object.keys(SHIP_PRESENTATIONS)).toEqual(['p-cruiser', 'p-frigate', 'e-cruiser', 'e-destroyer']);
    for (const ship of Object.values(state.ships)) {
      const presentation = SHIP_PRESENTATIONS[ship.id];
      expect(presentation?.texture).toMatch(/^ship-/);
      expect(presentation?.hardpoints.engines.length).toBeGreaterThanOrEqual(2);
      for (const weapon of ship.weapons) {
        const origins = weaponOrigins(ship, { x: ship.position.x + 200, y: ship.position.y }, weapon);
        expect(origins.length).toBeGreaterThan(0);
        expect(origins.some((origin) => origin.x !== ship.position.x || origin.y !== ship.position.y)).toBe(true);
      }
    }
  });
});
