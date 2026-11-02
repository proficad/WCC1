import { describe, expect, it } from 'vitest';
import { route } from './routing';

describe('route – smart L-routing, PRD F18', () => {
  it('general case without obstacles goes horizontal first (H→V)', () => {
    expect(route({ x: 0, y: 0 }, { x: 4, y: 3 }, [])).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
    ]);
  });

  it('same x gives a straight vertical segment', () => {
    expect(route({ x: 2, y: 1 }, { x: 2, y: 6 }, [])).toEqual([
      { x: 2, y: 1 },
      { x: 2, y: 6 },
    ]);
  });

  it('same y gives a straight horizontal segment', () => {
    expect(route({ x: -3, y: 4 }, { x: 5, y: 4 }, [])).toEqual([
      { x: -3, y: 4 },
      { x: 5, y: 4 },
    ]);
  });

  it('switches to V→H when H→V passes through a foreign pin (AK 8)', () => {
    // Resistor at (0,0): wire from its left pin (-2,0) to a pin lower right at (5,3).
    // H→V would run along y=0 through the resistor's right pin (2,0).
    const otherPins = [{ x: 2, y: 0 }];
    expect(route({ x: -2, y: 0 }, { x: 5, y: 3 }, otherPins)).toEqual([
      { x: -2, y: 0 },
      { x: -2, y: 3 },
      { x: 5, y: 3 },
    ]);
  });

  it('falls back to H→V when both variants pass through a foreign pin', () => {
    const otherPins = [
      { x: 2, y: 0 }, // blocks H→V
      { x: -2, y: 2 }, // blocks V→H
    ];
    expect(route({ x: -2, y: 0 }, { x: 5, y: 3 }, otherPins)).toEqual([
      { x: -2, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 3 },
    ]);
  });

  it('a pin at the corner point counts as a collision', () => {
    const otherPins = [{ x: 4, y: 0 }];
    expect(route({ x: 0, y: 0 }, { x: 4, y: 3 }, otherPins)[1]).toEqual({ x: 0, y: 3 });
  });

  it('ignores pins located at the wire endpoints', () => {
    const endpoints = [
      { x: 0, y: 0 },
      { x: 4, y: 3 },
    ];
    expect(route({ x: 0, y: 0 }, { x: 4, y: 3 }, endpoints)[1]).toEqual({ x: 4, y: 0 });
  });
});
