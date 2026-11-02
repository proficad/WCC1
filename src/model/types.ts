// Data model, PRD §5. All coordinates are integer grid units (gu), screen orientation (y grows down).

export type Rotation = 0 | 90 | 180 | 270;

export const SYMBOL_KINDS = [
  'resistor',
  'battery',
  'lamp',
  'switch',
  'led',
  'capacitor',
  'diode',
  'ground',
] as const;

export type SymbolKind = (typeof SYMBOL_KINDS)[number];

export interface Point {
  x: number;
  y: number;
}

/** A symbol placed on the canvas. Named PlacedSymbol to avoid shadowing the global `Symbol`. */
export interface PlacedSymbol {
  id: string;
  kind: SymbolKind;
  /** Center, grid units. */
  x: number;
  y: number;
  rotation: Rotation;
}

export interface PinRef {
  symbolId: string;
  pin: number;
}

export interface Wire {
  id: string;
  a: PinRef;
  b: PinRef;
}

export interface Schematic {
  version: 1;
  symbols: PlacedSymbol[];
  wires: Wire[];
}
