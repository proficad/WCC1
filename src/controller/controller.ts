// Thin layer: builds the DOM, translates DOM events into editor events and re-renders (PRD T2 controller/).
import { initialState, transition } from '../editor';
import type { EditorEvent, EditorState, Hit } from '../editor';
import type { Point } from '../model';
import { createCanvas, GRID, PALETTE, render, symbolMarkup } from '../view';

const deps = { newId: () => crypto.randomUUID() };

/** Pointer position in canvas pixels. */
function canvasPoint(svg: SVGSVGElement, e: MouseEvent): { x: number; y: number } {
  const r = svg.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/** Nearest grid point to the pointer (PRD F3, F7). */
function snap(p: { x: number; y: number }): Point {
  return { x: Math.round(p.x / GRID), y: Math.round(p.y / GRID) };
}

/** Hit-test; filled in phase 5 (PRD H1–H3). */
function hitTest(): Hit {
  return { type: 'empty' };
}

function keyOf(e: KeyboardEvent): Extract<EditorEvent, { type: 'key' }>['key'] | null {
  if (e.key === 'r' || e.key === 'R') return 'R';
  if (e.key === 'Escape') return 'Escape';
  if (e.key === 'Delete' || e.key === 'Backspace') return 'Delete';
  return null;
}

export function mountEditor(root: HTMLElement): void {
  let state: EditorState = initialState();

  root.innerHTML = `
    <aside class="palette" aria-label="Paleta značek"></aside>
    <main class="stage"></main>`;
  const palette = root.querySelector<HTMLElement>('.palette')!;
  const stage = root.querySelector<HTMLElement>('.stage')!;
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
    state = transition(state, event, deps).state;
    update();
  }

  function update(): void {
    render(svg, state);
    const active = state.mode.kind === 'place' ? state.mode.symbolKind : null;
    for (const { kind, btn } of buttons) btn.classList.toggle('active', kind === active);
  }

  svg.addEventListener('pointermove', (e) => {
    dispatch({ type: 'pointerMove', at: snap(canvasPoint(svg, e)) });
  });

  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    dispatch({
      type: 'pointerDown',
      at: snap(canvasPoint(svg, e)),
      hit: hitTest(),
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
