import type { Point, SymbolKind } from './types';

export interface SymbolDef {
  /** Local pin offsets at rotation 0, relative to the symbol center (PRD F5). */
  pins: readonly Point[];
}

// PRD F5: two-pin symbols have pin 0 on the left (-2, 0) and pin 1 on the right (+2, 0).
// Pin 0 is + of the battery and the anode of diode/LED.
const TWO_PIN: readonly Point[] = [
  { x: -2, y: 0 },
  { x: 2, y: 0 },
];

export const SYMBOL_DEFS: Readonly<Record<SymbolKind, SymbolDef>> = {
  resistor: { pins: TWO_PIN },
  battery: { pins: TWO_PIN },
  lamp: { pins: TWO_PIN },
  switch: { pins: TWO_PIN },
  led: { pins: TWO_PIN },
  capacitor: { pins: TWO_PIN },
  diode: { pins: TWO_PIN },
  ground: { pins: [{ x: 0, y: -1 }] },
};
