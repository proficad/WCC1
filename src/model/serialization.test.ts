import { describe, expect, it } from 'vitest';
import { addSymbol, addWire, emptySchematic } from './commands';
import { deserialize, serialize } from './serialization';
import type { Schematic } from './types';

function sample(): Schematic {
  let s = emptySchematic();
  s = addSymbol(s, { id: 'bat', kind: 'battery', x: 0, y: 0, rotation: 0 });
  s = addSymbol(s, { id: 'led', kind: 'led', x: 6, y: 3, rotation: 90 });
  s = addSymbol(s, { id: 'gnd', kind: 'ground', x: 0, y: 6, rotation: 180 });
  s = addWire(s, { id: 'w1', a: { symbolId: 'bat', pin: 1 }, b: { symbolId: 'led', pin: 0 } });
  s = addWire(s, { id: 'w2', a: { symbolId: 'bat', pin: 0 }, b: { symbolId: 'gnd', pin: 0 } });
  return s;
}

/** Serialized sample with one part replaced via a mutator. */
function corrupted(mutate: (data: any) => void): string {
  const data = JSON.parse(serialize(sample()));
  mutate(data);
  return JSON.stringify(data);
}

describe('serialize / deserialize – PRD F20, F21', () => {
  it('round-trips a schematic', () => {
    const s = sample();
    expect(deserialize(serialize(s))).toEqual({ ok: true, schematic: s });
  });

  it('round-trips an empty schematic', () => {
    expect(deserialize(serialize(emptySchematic()))).toEqual({ ok: true, schematic: emptySchematic() });
  });

  const invalid: [string, string][] = [
    ['invalid JSON', '{"version":1,'],
    ['unknown kind', corrupted((d) => (d.symbols[0].kind = 'transistor'))],
    ['pin index out of range', corrupted((d) => (d.wires[1].b.pin = 1))], // ground has a single pin
    ['reference to a missing symbol', corrupted((d) => (d.wires[0].b.symbolId = 'nope'))],
    ['unknown version', corrupted((d) => (d.version = 2))],
    ['non-integer position', corrupted((d) => (d.symbols[0].x = 1.5))],
    ['invalid rotation', corrupted((d) => (d.symbols[0].rotation = 45))],
    ['duplicate id', corrupted((d) => (d.symbols[1].id = 'bat'))],
    ['self-wire', corrupted((d) => (d.wires[0].b = { symbolId: 'bat', pin: 1 }))],
    ['duplicate wire', corrupted((d) => d.wires.push({ ...d.wires[0], id: 'w3' }))],
  ];

  for (const [name, text] of invalid) {
    it(`rejects ${name}`, () => {
      expect(deserialize(text).ok).toBe(false);
    });
  }
});
