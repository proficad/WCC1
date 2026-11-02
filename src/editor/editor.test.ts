import { describe, expect, it } from 'vitest';
import { addSymbol, emptySchematic, findSymbol } from '../model';
import { initialState, transition } from './editor';
import type { EditorEvent, EditorState } from './editor';

let counter = 0;
const deps = { newId: () => `id${++counter}` };

function run(state: EditorState, ...events: EditorEvent[]): EditorState {
  return events.reduce((s, e) => transition(s, e, deps).state, state);
}

// One resistor at (0,0), already selected.
function withSelectedResistor(): EditorState {
  const schematic = addSymbol(emptySchematic(), { id: 'r', kind: 'resistor', x: 0, y: 0, rotation: 0 });
  return run(initialState(schematic), {
    type: 'pointerDown',
    at: { x: 0, y: 0 },
    hit: { type: 'symbol', id: 'r' },
    button: 'left',
  });
}

describe('editor state machine – PRD T3', () => {
  it('entering placing mode clears the selection (F7)', () => {
    const s = withSelectedResistor();
    expect(s.selection).toEqual({ type: 'symbol', id: 'r' });

    const placing = run(s, { type: 'paletteClick', kind: 'lamp' });
    expect(placing.mode.kind).toBe('place');
    expect(placing.selection).toBeNull();
  });

  it('R while placing rotates only the preview, not the previously selected symbol (F9)', () => {
    const s = run(withSelectedResistor(), { type: 'paletteClick', kind: 'lamp' }, { type: 'key', key: 'R' });
    expect(s.mode).toMatchObject({ kind: 'place', rotation: 90 });
    expect(findSymbol(s.schematic, 'r')?.rotation).toBe(0);
  });

  it('Esc ends placing mode (F10)', () => {
    const s = run(initialState(), { type: 'paletteClick', kind: 'lamp' }, { type: 'key', key: 'Escape' });
    expect(s.mode).toEqual({ kind: 'select' });
  });

  it('Esc ends wire drawing without creating a wire (F16)', () => {
    const s = run(
      withSelectedResistor(),
      { type: 'pointerDown', at: { x: 2, y: 0 }, hit: { type: 'pin', ref: { symbolId: 'r', pin: 1 } }, button: 'left' },
    );
    expect(s.mode.kind).toBe('wire');

    const cancelled = run(s, { type: 'key', key: 'Escape' });
    expect(cancelled.mode).toEqual({ kind: 'select' });
    expect(cancelled.schematic.wires).toEqual([]);
  });
});
