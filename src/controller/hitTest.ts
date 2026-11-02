// Hit-test, PRD §4.6: priority pin > wire > symbol body > empty.
import type { Hit } from '../editor';
import { pinPositions, rotatePoint, wirePath } from '../model';
import type { Point, Rotation, Schematic } from '../model';
import { GRID, SYMBOL_BODY } from '../view';

const PIN_RADIUS = 6; // px, PRD H2
const WIRE_DISTANCE = 4; // px, PRD H2

/** Inverse rotation, used to map a canvas point into a symbol's local frame. */
const INVERSE: Record<Rotation, Rotation> = { 0: 0, 90: 270, 180: 180, 270: 90 };

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

const toPx = (p: Point): Point => ({ x: p.x * GRID, y: p.y * GRID });

/** `p` is the pointer position in canvas pixels. Later symbols are drawn on top, so they win ties. */
export function hitTest(s: Schematic, p: Point): Hit {
  let bestPin: Hit | null = null;
  let bestDist = Infinity;
  for (const sym of s.symbols) {
    const pins = pinPositions(sym);
    for (let pin = 0; pin < pins.length; pin++) {
      const pos = pins[pin]!;
      const dist = Math.hypot(p.x - pos.x * GRID, p.y - pos.y * GRID);
      if (dist <= PIN_RADIUS && dist <= bestDist) {
        bestPin = { type: 'pin', ref: { symbolId: sym.id, pin } };
        bestDist = dist;
      }
    }
  }
  if (bestPin) return bestPin;

  for (const wire of [...s.wires].reverse()) {
    const path = wirePath(s, wire).map(toPx);
    for (let i = 0; i + 1 < path.length; i++) {
      if (distanceToSegment(p, path[i]!, path[i + 1]!) <= WIRE_DISTANCE) return { type: 'wire', id: wire.id };
    }
  }

  for (const sym of [...s.symbols].reverse()) {
    const body = SYMBOL_BODY[sym.kind];
    const local = rotatePoint({ x: p.x - sym.x * GRID, y: p.y - sym.y * GRID }, INVERSE[sym.rotation]);
    if (Math.abs(local.x) <= body.halfWidth && Math.abs(local.y) <= body.halfHeight) {
      return { type: 'symbol', id: sym.id };
    }
  }
  return { type: 'empty' };
}
