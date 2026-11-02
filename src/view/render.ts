// Renders the editor state into SVG (PRD T2 view/). Markup never contains ids or other stored strings,
// so data loaded from localStorage cannot inject markup.
import type { EditorState, Hit, Mode } from '../editor';
import { allPinPositions, pinRefPosition, route, wirePath } from '../model';
import type { Point, Rotation, SymbolKind } from '../model';
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

function wiresLayer(state: EditorState): string {
  const sel = state.selection;
  return state.schematic.wires
    .map((w) => {
      const selected = sel?.type === 'wire' && sel.id === w.id;
      return polyline(wirePath(state.schematic, w), selected ? 'wire selected' : 'wire');
    })
    .join('');
}

function symbolsLayer(state: EditorState): string {
  const sel = state.selection;
  return state.schematic.symbols
    .map((s) => symbolMarkup(s.kind, s.x, s.y, s.rotation, sel?.type === 'symbol' && sel.id === s.id ? 'selected' : ''))
    .join('');
}

function previewLayer(state: EditorState): string {
  const mode = state.mode;
  if (mode.kind === 'place' && mode.cursor) {
    return symbolMarkup(mode.symbolKind, mode.cursor.x, mode.cursor.y, mode.rotation, 'preview');
  }
  if (mode.kind === 'wire' && mode.cursor) {
    // Route preview from the start pin to the cursor (PRD F16).
    const from = pinRefPosition(state.schematic, mode.from);
    return polyline(route(from, mode.cursor, allPinPositions(state.schematic)), 'wire preview');
  }
  return '';
}

/** Highlights the hovered pin and the start pin of a wire being drawn (PRD F15). */
function pinMarkers(state: EditorState, hover: Hit | null): string {
  if (state.mode.kind === 'place') return ''; // pins are inactive while placing (PRD F8)
  const points: Point[] = [];
  if (state.mode.kind === 'wire') points.push(pinRefPosition(state.schematic, state.mode.from));
  if (hover?.type === 'pin') points.push(pinRefPosition(state.schematic, hover.ref));
  return points.map((p) => `<circle class="pin-marker" cx="${px(p.x)}" cy="${px(p.y)}" r="5"/>`).join('');
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

export function render(svg: SVGSVGElement, state: EditorState, hover: Hit | null): void {
  const content = svg.querySelector('.content');
  if (!content) return;
  content.innerHTML = wiresLayer(state) + symbolsLayer(state) + previewLayer(state) + pinMarkers(state, hover);
}

/** Status bar help per mode (PRD F23). */
export function statusText(mode: Mode): string {
  switch (mode.kind) {
    case 'select':
      return 'Klikni na značku v paletě · klikni na pin a pak na cílový pin · R otočí · Delete smaže';
    case 'place':
      return 'Klikni pro položení · R otočí · Esc konec';
    case 'wire':
      return 'Klikni na cílový pin · Esc zruší';
  }
}
