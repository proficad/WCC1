// Editor state machine as a pure transition function (state, event) -> state (PRD T2).
// Events are abstract: the controller performs hit-testing and grid snapping and passes the result in.
import {
  addSymbol,
  addWire,
  deleteObject,
  emptySchematic,
  findSymbol,
  moveSymbol,
  rotateClockwise,
  rotateSymbol,
} from '../model';
import type { PinRef, Point, Rotation, Schematic, SymbolKind } from '../model';

/** What the pointer is over, resolved by the controller with priority pin > wire > symbol > empty (PRD H1). */
export type Hit =
  | { type: 'pin'; ref: PinRef }
  | { type: 'wire'; id: string }
  | { type: 'symbol'; id: string }
  | { type: 'empty' };

export type Selection = { type: 'symbol'; id: string } | { type: 'wire'; id: string };

export type Mode =
  | { kind: 'select' }
  /** Placing symbols; `cursor` is the snapped grid point of the preview (PRD F7–F10). */
  | { kind: 'place'; symbolKind: SymbolKind; rotation: Rotation; cursor: Point | null }
  /** Drawing a wire from `from`; `cursor` drives the route preview (PRD F16). */
  | { kind: 'wire'; from: PinRef; cursor: Point | null }
  /**
   * Pressed on a symbol body; it follows `dragMove` events until `pointerUp` (PRD F12).
   * `grab` is the symbol position minus the pointer grid point at press time.
   * `start` is the schematic before the drag, so the whole drag is saved as one change.
   */
  | { kind: 'drag'; symbolId: string; grab: Point; start: Schematic };

export interface EditorState {
  schematic: Schematic;
  mode: Mode;
  selection: Selection | null;
}

export type EditorEvent =
  | { type: 'paletteClick'; kind: SymbolKind }
  /** `at` is the pointer position snapped to the grid. */
  | { type: 'pointerMove'; at: Point }
  | { type: 'pointerDown'; at: Point; hit: Hit; button: 'left' | 'right' }
  /** Sent by the controller only after the pointer moved at least 4 px while pressed (PRD H4). */
  | { type: 'dragMove'; at: Point }
  | { type: 'pointerUp' }
  | { type: 'key'; key: 'R' | 'Escape' | 'Delete' };

export interface Deps {
  newId: () => string;
}

export interface TransitionResult {
  state: EditorState;
  /** True when the schematic changed and should be persisted (PRD F20). */
  save: boolean;
}

export function initialState(schematic: Schematic = emptySchematic()): EditorState {
  return { schematic, mode: { kind: 'select' }, selection: null };
}

const SELECT: Mode = { kind: 'select' };

export function transition(state: EditorState, event: EditorEvent, deps: Deps): TransitionResult {
  const next = step(state, event, deps);
  // During a drag the schematic changes live but is saved only once, when the drag ends (PRD F12, F20).
  if (next.mode.kind === 'drag') return { state: next, save: false };
  const before = state.mode.kind === 'drag' ? state.mode.start : state.schematic;
  return { state: next, save: next.schematic !== before };
}

function step(state: EditorState, event: EditorEvent, deps: Deps): EditorState {
  // Choosing a symbol in the palette always enters placing and clears the selection (PRD F7).
  if (event.type === 'paletteClick') {
    const rotation = state.mode.kind === 'place' ? state.mode.rotation : 0;
    const cursor = state.mode.kind === 'place' || state.mode.kind === 'wire' ? state.mode.cursor : null;
    return { ...state, selection: null, mode: { kind: 'place', symbolKind: event.kind, rotation, cursor } };
  }

  // Outside a drag, moving with the button held is an ordinary pointer move.
  if (event.type === 'dragMove' && state.mode.kind !== 'drag') {
    return step(state, { type: 'pointerMove', at: event.at }, deps);
  }

  switch (state.mode.kind) {
    case 'select':
      return stepSelect(state, event);
    case 'place':
      return stepPlace(state, state.mode, event, deps);
    case 'wire':
      return stepWire(state, state.mode, event, deps);
    case 'drag':
      return stepDrag(state, state.mode, event);
  }
}

function stepDrag(state: EditorState, mode: Extract<Mode, { kind: 'drag' }>, event: EditorEvent): EditorState {
  switch (event.type) {
    case 'dragMove':
      return {
        ...state,
        schematic: moveSymbol(state.schematic, mode.symbolId, event.at.x + mode.grab.x, event.at.y + mode.grab.y),
      };
    case 'pointerUp':
      return { ...state, mode: SELECT };
    default:
      return state; // keys and other pointer events are ignored while dragging
  }
}

function stepSelect(state: EditorState, event: EditorEvent): EditorState {
  if (event.type === 'pointerDown') {
    if (event.button !== 'left') return state;
    const { hit } = event;
    switch (hit.type) {
      case 'pin': // A press on a pin always starts a wire (PRD H3, F16).
        return { ...state, selection: null, mode: { kind: 'wire', from: hit.ref, cursor: event.at } };
      case 'wire':
        return { ...state, selection: { type: 'wire', id: hit.id } };
      case 'symbol': {
        // Select the symbol and get ready to drag it by its body (PRD F11, F12, H3).
        const sym = findSymbol(state.schematic, hit.id);
        if (!sym) return state;
        return {
          ...state,
          selection: { type: 'symbol', id: hit.id },
          mode: {
            kind: 'drag',
            symbolId: hit.id,
            grab: { x: sym.x - event.at.x, y: sym.y - event.at.y },
            start: state.schematic,
          },
        };
      }
      case 'empty':
        return { ...state, selection: null };
    }
  }
  if (event.type === 'key') {
    const sel = state.selection;
    switch (event.key) {
      case 'R': // Rotate the selected symbol (PRD F13).
        return sel?.type === 'symbol' ? { ...state, schematic: rotateSymbol(state.schematic, sel.id) } : state;
      case 'Delete': // Delete the selected object, symbols with their wires (PRD F14).
        return sel ? { ...state, schematic: deleteObject(state.schematic, sel.id), selection: null } : state;
      case 'Escape':
        return { ...state, selection: null };
    }
  }
  return state;
}

function stepPlace(
  state: EditorState,
  mode: Extract<Mode, { kind: 'place' }>,
  event: EditorEvent,
  deps: Deps,
): EditorState {
  switch (event.type) {
    case 'pointerMove':
      return { ...state, mode: { ...mode, cursor: event.at } };
    case 'pointerDown':
      if (event.button === 'right') return { ...state, mode: SELECT }; // PRD F10
      // Pins are inactive while placing (PRD F8); the click always places a symbol and placing continues.
      return {
        ...state,
        mode: { ...mode, cursor: event.at },
        schematic: addSymbol(state.schematic, {
          id: deps.newId(),
          kind: mode.symbolKind,
          x: event.at.x,
          y: event.at.y,
          rotation: mode.rotation,
        }),
      };
    case 'key':
      if (event.key === 'R') return { ...state, mode: { ...mode, rotation: rotateClockwise(mode.rotation) } }; // PRD F9
      if (event.key === 'Escape') return { ...state, mode: SELECT }; // PRD F10
      return state;
    default:
      return state;
  }
}

function stepWire(
  state: EditorState,
  mode: Extract<Mode, { kind: 'wire' }>,
  event: EditorEvent,
  deps: Deps,
): EditorState {
  switch (event.type) {
    case 'pointerMove':
      return { ...state, mode: { ...mode, cursor: event.at } };
    case 'pointerDown': {
      // A click on another pin creates the wire; anything else cancels (PRD F16).
      // Invalid wires (same pin, duplicate) are silently ignored by addWire (PRD F19).
      if (event.button === 'left' && event.hit.type === 'pin') {
        const schematic = addWire(state.schematic, { id: deps.newId(), a: mode.from, b: event.hit.ref });
        return { ...state, schematic, mode: SELECT };
      }
      return { ...state, mode: SELECT };
    }
    case 'key':
      return event.key === 'Escape' ? { ...state, mode: SELECT } : state; // PRD F16
    default:
      return state;
  }
}
