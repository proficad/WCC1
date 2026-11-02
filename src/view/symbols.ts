// SVG geometry of IEC symbols (PRD F4, F6), drawn in local pixels around the symbol center at rotation 0.
// One grid unit is GRID px; two-pin symbols have pins at (±2 gu, 0) = (±40 px, 0).
import type { SymbolKind } from '../model';

export const GRID = 20;

const lead = (x1: number, x2: number) => `<line x1="${x1}" y1="0" x2="${x2}" y2="0"/>`;

/** Inner SVG markup per symbol kind. COULD symbols (capacitor, diode, ground) come in phase 7. */
export const SYMBOL_SVG: Partial<Record<SymbolKind, string>> = {
  resistor: `${lead(-40, -20)}<rect x="-20" y="-8" width="40" height="16"/>${lead(20, 40)}`,

  // Pin 0 (left) is +, drawn as the longer plate.
  battery:
    `${lead(-40, -5)}<line x1="-5" y1="-15" x2="-5" y2="15"/>` +
    `<line x1="5" y1="-8" x2="5" y2="8" class="thick"/>${lead(5, 40)}` +
    `<text x="-16" y="-10" class="label">+</text>`,

  lamp:
    `${lead(-40, -12)}<circle cx="0" cy="0" r="12"/>` +
    `<line x1="-8.5" y1="-8.5" x2="8.5" y2="8.5"/><line x1="-8.5" y1="8.5" x2="8.5" y2="-8.5"/>${lead(12, 40)}`,

  // Open contact: the blade starts at the left terminal and stays lifted above the right one.
  switch: `${lead(-40, -16)}<line x1="-16" y1="0" x2="14" y2="-13"/>${lead(16, 40)}`,

  // Pin 0 (left) is the anode; the triangle points to the cathode bar.
  led:
    `${lead(-40, -10)}<polygon points="-10,-10 -10,10 8,0"/>` +
    `<line x1="8" y1="-10" x2="8" y2="10"/>${lead(8, 40)}` +
    `<path d="M0,-13 L8,-21 M4,-21 L8,-21 L8,-17 M7,-11 L15,-19 M11,-19 L15,-19 L15,-15" class="arrow"/>`,
};

export const PALETTE: { kind: SymbolKind; label: string }[] = [
  { kind: 'resistor', label: 'Rezistor' },
  { kind: 'battery', label: 'Baterie' },
  { kind: 'lamp', label: 'Žárovka' },
  { kind: 'switch', label: 'Spínač' },
  { kind: 'led', label: 'LED' },
];
