import { describe, expect, it } from 'vitest';
import { addSymbol, addWire, deleteObject, emptySchematic } from './commands';
import type { Schematic } from './types';

// Battery, switch and resistor, wired battery→switch→resistor.
function circuit(): Schematic {
  let s = emptySchematic();
  s = addSymbol(s, { id: 'bat', kind: 'battery', x: 0, y: 0, rotation: 0 });
  s = addSymbol(s, { id: 'sw', kind: 'switch', x: 6, y: 0, rotation: 0 });
  s = addSymbol(s, { id: 'r', kind: 'resistor', x: 12, y: 0, rotation: 0 });
  s = addWire(s, { id: 'w1', a: { symbolId: 'bat', pin: 1 }, b: { symbolId: 'sw', pin: 0 } });
  s = addWire(s, { id: 'w2', a: { symbolId: 'sw', pin: 1 }, b: { symbolId: 'r', pin: 0 } });
  return s;
}

describe('deleteObject – PRD F14', () => {
  it('deleting a symbol also deletes its wires and keeps the others', () => {
    const s = deleteObject(circuit(), 'bat');
    expect(s.symbols.map((it) => it.id)).toEqual(['sw', 'r']);
    expect(s.wires.map((w) => w.id)).toEqual(['w2']);
  });

  it('deleting a symbol in the middle removes both of its wires', () => {
    const s = deleteObject(circuit(), 'sw');
    expect(s.wires).toEqual([]);
  });
});

describe('addWire – PRD F19', () => {
  it('rejects a wire from a pin to the same pin', () => {
    const s = circuit();
    expect(addWire(s, { id: 'w3', a: { symbolId: 'r', pin: 1 }, b: { symbolId: 'r', pin: 1 } })).toBe(s);
  });

  it('rejects a duplicate wire in the same order', () => {
    const s = circuit();
    expect(addWire(s, { id: 'w3', a: { symbolId: 'bat', pin: 1 }, b: { symbolId: 'sw', pin: 0 } })).toBe(s);
  });

  it('rejects a duplicate wire in reversed order', () => {
    const s = circuit();
    expect(addWire(s, { id: 'w3', a: { symbolId: 'sw', pin: 0 }, b: { symbolId: 'bat', pin: 1 } })).toBe(s);
  });

  it('allows several wires on one pin', () => {
    const s = addWire(circuit(), { id: 'w3', a: { symbolId: 'bat', pin: 1 }, b: { symbolId: 'r', pin: 1 } });
    expect(s.wires).toHaveLength(3);
  });
});
