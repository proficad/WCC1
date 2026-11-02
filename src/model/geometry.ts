import { SYMBOL_DEFS } from './symbols';
import type { PlacedSymbol, Point, Rotation } from './types';

/**
 * Rotates a point clockwise on screen (y grows down) around the origin.
 * 90° clockwise is (x, y) -> (-y, x), PRD §5.
 * `+ 0` normalizes -0 to 0 so results compare cleanly.
 */
export function rotatePoint(p: Point, rotation: Rotation): Point {
  switch (rotation) {
    case 0:
      return { x: p.x, y: p.y };
    case 90:
      return { x: -p.y + 0, y: p.x + 0 };
    case 180:
      return { x: -p.x + 0, y: -p.y + 0 };
    case 270:
      return { x: p.y + 0, y: -p.x + 0 };
  }
}

/** Next rotation step, 90° clockwise (PRD F9, F13). */
export function rotateClockwise(rotation: Rotation): Rotation {
  return ((rotation + 90) % 360) as Rotation;
}

export function pinCount(symbol: PlacedSymbol): number {
  return SYMBOL_DEFS[symbol.kind].pins.length;
}

/** Absolute pin position = symbol center + local offset rotated by symbol rotation (PRD §5). */
export function pinPosition(symbol: PlacedSymbol, pin: number): Point {
  const local = SYMBOL_DEFS[symbol.kind].pins[pin];
  if (!local) {
    throw new RangeError(`Symbol ${symbol.id} (${symbol.kind}) has no pin ${pin}`);
  }
  const r = rotatePoint(local, symbol.rotation);
  return { x: symbol.x + r.x, y: symbol.y + r.y };
}

/** Absolute positions of all pins of a symbol, indexed by pin number. */
export function pinPositions(symbol: PlacedSymbol): Point[] {
  return SYMBOL_DEFS[symbol.kind].pins.map((_, i) => pinPosition(symbol, i));
}
