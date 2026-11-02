import type { Point } from './types';

/** True when point p lies on the axis-aligned segment from s to e (endpoints included). */
function onSegment(p: Point, s: Point, e: Point): boolean {
  if (s.x === e.x) {
    return p.x === s.x && p.y >= Math.min(s.y, e.y) && p.y <= Math.max(s.y, e.y);
  }
  if (s.y === e.y) {
    return p.y === s.y && p.x >= Math.min(s.x, e.x) && p.x <= Math.max(s.x, e.x);
  }
  return false;
}

function samePoint(p: Point, q: Point): boolean {
  return p.x === q.x && p.y === q.y;
}

/** True when the polyline passes through any of the given pins, ignoring pins located at a or b. */
function hitsForeignPin(path: Point[], a: Point, b: Point, otherPins: readonly Point[]): boolean {
  return otherPins.some((pin) => {
    if (samePoint(pin, a) || samePoint(pin, b)) return false;
    for (let i = 0; i + 1 < path.length; i++) {
      if (onSegment(pin, path[i]!, path[i + 1]!)) return true;
    }
    return false;
  });
}

/**
 * Smart L-routing, PRD F18. Returns the wire as a polyline (2 or 3 points).
 * Tries H→V (horizontal first) then V→H and picks the first that does not pass through a foreign pin.
 * When both collide, H→V is used. Collinear endpoints give a straight segment.
 */
export function route(a: Point, b: Point, otherPins: readonly Point[]): Point[] {
  if (a.x === b.x || a.y === b.y) {
    return [a, b];
  }
  const hv: Point[] = [a, { x: b.x, y: a.y }, b];
  if (!hitsForeignPin(hv, a, b, otherPins)) return hv;

  const vh: Point[] = [a, { x: a.x, y: b.y }, b];
  if (!hitsForeignPin(vh, a, b, otherPins)) return vh;

  return hv;
}
