import { describe, expect, it } from 'vitest';
import { pinPosition, pinPositions } from './geometry';
import type { PlacedSymbol, Point, Rotation, SymbolKind } from './types';

function sym(kind: SymbolKind, rotation: Rotation, x = 0, y = 0): PlacedSymbol {
  return { id: 's1', kind, x, y, rotation };
}

// Binding reference table, PRD §5 (screen coordinates, y grows down).
const REFERENCE: { name: string; kind: SymbolKind; pin: number; expected: Record<Rotation, Point> }[] = [
  {
    name: 'two-pin symbol, pin 0',
    kind: 'resistor',
    pin: 0,
    expected: { 0: { x: -2, y: 0 }, 90: { x: 0, y: -2 }, 180: { x: 2, y: 0 }, 270: { x: 0, y: 2 } },
  },
  {
    name: 'two-pin symbol, pin 1',
    kind: 'resistor',
    pin: 1,
    expected: { 0: { x: 2, y: 0 }, 90: { x: 0, y: 2 }, 180: { x: -2, y: 0 }, 270: { x: 0, y: -2 } },
  },
  {
    name: 'ground, pin 0',
    kind: 'ground',
    pin: 0,
    expected: { 0: { x: 0, y: -1 }, 90: { x: 1, y: 0 }, 180: { x: 0, y: 1 }, 270: { x: -1, y: 0 } },
  },
];

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

describe('pinPosition – PRD §5 reference table', () => {
  for (const row of REFERENCE) {
    for (const rotation of ROTATIONS) {
      it(`${row.name} at ${rotation}°`, () => {
        expect(pinPosition(sym(row.kind, rotation), row.pin)).toEqual(row.expected[rotation]);
      });
    }
  }

  it('adds the symbol center to the rotated offset', () => {
    expect(pinPosition(sym('battery', 90, 10, 5), 0)).toEqual({ x: 10, y: 3 });
  });

  it('all two-pin kinds share the same pin layout', () => {
    for (const kind of ['resistor', 'battery', 'lamp', 'switch', 'led', 'capacitor', 'diode'] as const) {
      expect(pinPositions(sym(kind, 0))).toEqual([
        { x: -2, y: 0 },
        { x: 2, y: 0 },
      ]);
    }
  });

  it('throws for a pin index out of range', () => {
    expect(() => pinPosition(sym('ground', 0), 1)).toThrow(RangeError);
  });
});
