// Pure commands over the schematic. Each returns a new Schematic; when a command is rejected
// or changes nothing, the original object is returned so callers can detect "no change" by identity.
import { pinCount, pinPosition, pinPositions, rotateClockwise } from './geometry';
import { route } from './routing';
import type { PinRef, PlacedSymbol, Point, Schematic, Wire } from './types';

export function emptySchematic(): Schematic {
  return { version: 1, symbols: [], wires: [] };
}

export function findSymbol(s: Schematic, id: string): PlacedSymbol | undefined {
  return s.symbols.find((sym) => sym.id === id);
}

export function addSymbol(s: Schematic, symbol: PlacedSymbol): Schematic {
  if (findSymbol(s, symbol.id)) return s;
  return { ...s, symbols: [...s.symbols, symbol] };
}

export function moveSymbol(s: Schematic, id: string, x: number, y: number): Schematic {
  const sym = findSymbol(s, id);
  if (!sym || (sym.x === x && sym.y === y)) return s;
  return { ...s, symbols: s.symbols.map((it) => (it.id === id ? { ...it, x, y } : it)) };
}

/** Rotates a symbol 90° clockwise around its center (PRD F13). */
export function rotateSymbol(s: Schematic, id: string): Schematic {
  if (!findSymbol(s, id)) return s;
  return {
    ...s,
    symbols: s.symbols.map((it) => (it.id === id ? { ...it, rotation: rotateClockwise(it.rotation) } : it)),
  };
}

/** Deletes a symbol together with all wires connected to it, or a single wire (PRD F14). */
export function deleteObject(s: Schematic, id: string): Schematic {
  if (findSymbol(s, id)) {
    return {
      ...s,
      symbols: s.symbols.filter((it) => it.id !== id),
      wires: s.wires.filter((w) => w.a.symbolId !== id && w.b.symbolId !== id),
    };
  }
  if (s.wires.some((w) => w.id === id)) {
    return { ...s, wires: s.wires.filter((w) => w.id !== id) };
  }
  return s;
}

function samePin(p: PinRef, q: PinRef): boolean {
  return p.symbolId === q.symbolId && p.pin === q.pin;
}

function pinExists(s: Schematic, ref: PinRef): boolean {
  const sym = findSymbol(s, ref.symbolId);
  return !!sym && Number.isInteger(ref.pin) && ref.pin >= 0 && ref.pin < pinCount(sym);
}

/** Why a wire cannot be added, or null when it can (PRD F19). Shared with deserialization. */
export function wireProblem(s: Schematic, wire: Wire): string | null {
  if (!pinExists(s, wire.a) || !pinExists(s, wire.b)) return 'wire references a missing pin';
  if (samePin(wire.a, wire.b)) return 'wire connects a pin to itself';
  const duplicate = s.wires.some(
    (w) => (samePin(w.a, wire.a) && samePin(w.b, wire.b)) || (samePin(w.a, wire.b) && samePin(w.b, wire.a)),
  );
  if (duplicate) return 'duplicate wire';
  return null;
}

/** Adds a wire; invalid wires (self, duplicate, missing pin) are silently ignored (PRD F19). */
export function addWire(s: Schematic, wire: Wire): Schematic {
  if (wireProblem(s, wire) !== null || s.wires.some((w) => w.id === wire.id)) return s;
  return { ...s, wires: [...s.wires, wire] };
}

export function pinRefPosition(s: Schematic, ref: PinRef): Point {
  const sym = findSymbol(s, ref.symbolId);
  if (!sym) throw new RangeError(`Missing symbol ${ref.symbolId}`);
  return pinPosition(sym, ref.pin);
}

/** All pin positions in the schematic, used as obstacles for routing. */
export function allPinPositions(s: Schematic): Point[] {
  return s.symbols.flatMap(pinPositions);
}

/** Polyline of a wire, computed from its pin references (PRD F17, F18). */
export function wirePath(s: Schematic, wire: Wire): Point[] {
  return route(pinRefPosition(s, wire.a), pinRefPosition(s, wire.b), allPinPositions(s));
}
