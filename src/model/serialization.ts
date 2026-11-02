// Serialization and validation of stored schematics (PRD F20, F21).
import { addWire, emptySchematic, wireProblem } from './commands';
import { SYMBOL_KINDS } from './types';
import type { PinRef, PlacedSymbol, Rotation, Schematic, SymbolKind, Wire } from './types';

export const STORAGE_KEY = 'mini-schematic:v1';

export type LoadResult = { ok: true; schematic: Schematic } | { ok: false; error: string };

export function serialize(s: Schematic): string {
  return JSON.stringify(s);
}

const ROTATIONS: readonly number[] = [0, 90, 180, 270];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isId(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function parseSymbol(v: unknown): PlacedSymbol | string {
  if (!isRecord(v)) return 'symbol is not an object';
  if (!isId(v.id)) return 'symbol has no id';
  if (!SYMBOL_KINDS.includes(v.kind as SymbolKind)) return `symbol ${v.id} has unknown kind`;
  if (!Number.isInteger(v.x) || !Number.isInteger(v.y)) return `symbol ${v.id} has non-integer position`;
  if (!ROTATIONS.includes(v.rotation as number)) return `symbol ${v.id} has invalid rotation`;
  return { id: v.id, kind: v.kind as SymbolKind, x: v.x as number, y: v.y as number, rotation: v.rotation as Rotation };
}

function parsePinRef(v: unknown): PinRef | null {
  if (!isRecord(v) || !isId(v.symbolId) || !Number.isInteger(v.pin)) return null;
  return { symbolId: v.symbolId, pin: v.pin as number };
}

function parseWire(v: unknown): Wire | string {
  if (!isRecord(v)) return 'wire is not an object';
  if (!isId(v.id)) return 'wire has no id';
  const a = parsePinRef(v.a);
  const b = parsePinRef(v.b);
  if (!a || !b) return `wire ${v.id} has invalid pin reference`;
  return { id: v.id, a, b };
}

/**
 * Parses and validates a stored schematic. Any problem rejects the whole schematic (PRD F21, AK 6):
 * bad JSON, unknown version, unknown kind, non-integer position, invalid rotation, duplicate id,
 * reference to a missing symbol or pin, self-wire or duplicate wire.
 */
export function deserialize(text: string): LoadResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid JSON' };
  }
  if (!isRecord(data)) return { ok: false, error: 'not an object' };
  if (data.version !== 1) return { ok: false, error: 'unknown version' };
  if (!Array.isArray(data.symbols) || !Array.isArray(data.wires)) {
    return { ok: false, error: 'missing symbols or wires' };
  }

  const ids = new Set<string>();
  let s = emptySchematic();

  for (const raw of data.symbols) {
    const sym = parseSymbol(raw);
    if (typeof sym === 'string') return { ok: false, error: sym };
    if (ids.has(sym.id)) return { ok: false, error: `duplicate id ${sym.id}` };
    ids.add(sym.id);
    s = { ...s, symbols: [...s.symbols, sym] };
  }

  for (const raw of data.wires) {
    const wire = parseWire(raw);
    if (typeof wire === 'string') return { ok: false, error: wire };
    if (ids.has(wire.id)) return { ok: false, error: `duplicate id ${wire.id}` };
    const problem = wireProblem(s, wire);
    if (problem) return { ok: false, error: `wire ${wire.id}: ${problem}` };
    ids.add(wire.id);
    s = addWire(s, wire);
  }

  return { ok: true, schematic: s };
}
