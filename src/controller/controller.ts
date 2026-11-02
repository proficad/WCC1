// Thin layer: builds the DOM, translates DOM events into editor events, persists and re-renders (PRD T2 controller/).
import { initialState, transition } from '../editor';
import type { EditorEvent, EditorState, Hit } from '../editor';
import { deserialize, emptySchematic, serialize, STORAGE_KEY } from '../model';
import type { Point, Schematic } from '../model';
import { createCanvas, GRID, PALETTE, render, statusText, symbolMarkup } from '../view';
import { hitTest } from './hitTest';

const deps = { newId: () => crypto.randomUUID() };

/** Restores the saved schematic; missing or invalid data gives an empty canvas and a warning (PRD F21). */
function loadSchematic(): Schematic {
  let text: string | null = null;
  try {
    text = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Mini editor: localStorage is not available', err);
  }
  if (text === null) return emptySchematic();
  const result = deserialize(text);
  if (!result.ok) {
    console.warn(`Mini editor: saved schematic ignored (${result.error})`);
    return emptySchematic();
  }
  return result.schematic;
}

/** Saves after every change of the model (PRD F20). */
function saveSchematic(s: Schematic): void {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(s));
  } catch (err) {
    console.warn('Mini editor: saving failed', err);
  }
}

/** Pointer position in canvas pixels. */
function canvasPoint(svg: SVGSVGElement, e: MouseEvent): Point {
  const r = svg.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/** Nearest grid point to a pixel position (PRD F3, F7). */
function snap(p: Point): Point {
  return { x: Math.round(p.x / GRID), y: Math.round(p.y / GRID) };
}

function keyOf(e: KeyboardEvent): Extract<EditorEvent, { type: 'key' }>['key'] | null {
  if (e.key === 'r' || e.key === 'R') return 'R';
  if (e.key === 'Escape') return 'Escape';
  if (e.key === 'Delete' || e.key === 'Backspace') return 'Delete';
  return null;
}

export function mountEditor(root: HTMLElement): void {
  let state: EditorState = initialState(loadSchematic());
  let hover: Hit | null = null;

  root.innerHTML = `
    <aside class="palette" aria-label="Paleta značek"></aside>
    <main class="stage"></main>
    <footer class="status" role="status"></footer>`;
  const palette = root.querySelector<HTMLElement>('.palette')!;
  const stage = root.querySelector<HTMLElement>('.stage')!;
  const status = root.querySelector<HTMLElement>('.status')!;
  const svg = createCanvas();
  stage.append(svg);

  const buttons = PALETTE.map(({ kind, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-item';
    btn.innerHTML = `<svg viewBox="-44 -24 88 48" aria-hidden="true">${symbolMarkup(kind, 0, 0, 0)}</svg><span>${label}</span>`;
    btn.addEventListener('click', () => dispatch({ type: 'paletteClick', kind }));
    palette.append(btn);
    return { kind, btn };
  });

  function dispatch(event: EditorEvent): void {
    const result = transition(state, event, deps);
    state = result.state;
    if (result.save) saveSchematic(state.schematic);
    update();
  }

  function update(): void {
    render(svg, state, hover);
    status.textContent = statusText(state.mode);
    const active = state.mode.kind === 'place' ? state.mode.symbolKind : null;
    for (const { kind, btn } of buttons) btn.classList.toggle('active', kind === active);
  }

  // Press position of the left button; a drag starts once the pointer moves 4 px away (PRD H4).
  let press: Point | null = null;
  let dragging = false;
  const DRAG_THRESHOLD = 4;

  svg.addEventListener('pointermove', (e) => {
    const p = canvasPoint(svg, e);
    hover = hitTest(state.schematic, p);
    if (press && !dragging && Math.hypot(p.x - press.x, p.y - press.y) >= DRAG_THRESHOLD) dragging = true;
    dispatch(dragging ? { type: 'dragMove', at: snap(p) } : { type: 'pointerMove', at: snap(p) });
  });

  function endPress(): void {
    if (!press) return;
    press = null;
    dragging = false;
    dispatch({ type: 'pointerUp' });
  }
  svg.addEventListener('pointerup', (e) => {
    if (e.button === 0) endPress();
  });
  svg.addEventListener('pointercancel', endPress);

  svg.addEventListener('pointerleave', () => {
    hover = null;
    update();
  });

  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    const p = canvasPoint(svg, e);
    if (e.button === 0) {
      press = p;
      dragging = false;
      svg.setPointerCapture(e.pointerId); // keep receiving moves when the pointer leaves the canvas
    }
    dispatch({
      type: 'pointerDown',
      at: snap(p),
      hit: hitTest(state.schematic, p),
      button: e.button === 0 ? 'left' : 'right',
    });
  });

  // Right button ends placing (PRD F10), so the browser menu must not open.
  svg.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    const key = keyOf(e);
    if (!key) return;
    e.preventDefault();
    dispatch({ type: 'key', key });
  });

  update();
}
