// Renders the editor state into SVG (PRD T2 view/). Markup never contains ids or other stored strings,
// so data loaded from localStorage cannot inject markup.
import type { EditorState } from '../editor';
import { wirePath } from '../model';
import type { PlacedSymbol, Point, Rotation, SymbolKind } from '../model';
import { GRID, SYMBOL_SVG } from './symbols';

const px = (gu: number) => gu * GRID;

export function symbolMarkup(kind: SymbolKind, x: number, y: number, rotation: Rotation, cls = ''): string {
  const body = SYMBOL_SVG[kind] ?? '';
  return `<g class="symbol ${cls}" transform="translate(${px(x)} ${px(y)}) rotate(${rotation})">${body}</g>`;
}

function polyline(points: Point[], cls: string): string {
  const pts = points.map((p) => `${px(p.x)},${px(p.y)}`).join(' ');
  return `<polyline class="${cls}" points="${pts}"/>`;
}

function symbolsLayer(symbols: PlacedSymbol[]): string {
  return symbols.map((s) => symbolMarkup(s.kind, s.x, s.y, s.rotation)).join('');
}

function previewLayer(state: EditorState): string {
  const mode = state.mode;
  if (mode.kind === 'place' && mode.cursor) {
    return symbolMarkup(mode.symbolKind, mode.cursor.x, mode.cursor.y, mode.rotation, 'preview');
  }
  return '';
}

/** Static SVG skeleton: dotted grid (PRD F2) and a content layer that render() fills. */
export function createCanvas(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('canvas');
  svg.innerHTML =
    `<defs><pattern id="grid" width="${GRID}" height="${GRID}" patternUnits="userSpaceOnUse">` +
    `<circle cx="0" cy="0" r="1.2" class="grid-dot"/><circle cx="${GRID}" cy="0" r="1.2" class="grid-dot"/>` +
    `<circle cx="0" cy="${GRID}" r="1.2" class="grid-dot"/><circle cx="${GRID}" cy="${GRID}" r="1.2" class="grid-dot"/>` +
    `</pattern></defs>` +
    `<rect width="100%" height="100%" fill="url(#grid)"/>` +
    `<g class="content"></g>`;
  return svg;
}

export function render(svg: SVGSVGElement, state: EditorState): void {
  const content = svg.querySelector('.content');
  if (!content) return;
  const wires = state.schematic.wires.map((w) => polyline(wirePath(state.schematic, w), 'wire')).join('');
  content.innerHTML = wires + symbolsLayer(state.schematic.symbols) + previewLayer(state);
}
