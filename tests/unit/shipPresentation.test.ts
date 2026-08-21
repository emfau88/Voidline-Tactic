import { describe, expect, it } from 'vitest';
import { createCombatState } from '../../src/domain/combat/combatEngine';
import { weaponOrigins } from '../../src/game/presentation/shipPresentation';

describe('ship presentation hardpoints', () => {
  it('rotates the player cruiser lance origin with its facing', () => {
    const cruiser = createCombatState(1).ships['p-cruiser'];
    const [origin] = weaponOrigins(cruiser, { x: cruiser.position.x, y: 0 }, 'lance');

    expect(origin.x).toBeCloseTo(cruiser.position.x, 5);
    expect(origin.y).toBeCloseTo(cruiser.position.y - cruiser.radius * 1.28, 5);
  });

  it('chooses the broadside hardpoints on the side facing the target', () => {
    const cruiser = createCombatState(2).ships['p-cruiser'];
    const easternOrigins = weaponOrigins(cruiser, { x: cruiser.position.x + 300, y: cruiser.position.y }, 'broadside');
    const westernOrigins = weaponOrigins(cruiser, { x: cruiser.position.x - 300, y: cruiser.position.y }, 'broadside');

    expect(easternOrigins).toHaveLength(3);
    expect(westernOrigins).toHaveLength(3);
    expect(easternOrigins.every((origin) => origin.x > cruiser.position.x)).toBe(true);
    expect(westernOrigins.every((origin) => origin.x < cruiser.position.x)).toBe(true);
  });
});
