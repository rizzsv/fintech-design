'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

export interface WidgetGridItem<TId extends string, TSize extends string> {
  id: TId;
  /** Human name used by the move controls, the size group and announcements. */
  label: string;
  size: TSize;
  sizeOptions: readonly { value: TSize; label: string }[];
  /** Index of the column stack this item belongs to. Ignored while `fullWidth`. */
  column: number;
  /** Renders in a row of its own across every column instead of inside a stack. */
  fullWidth: boolean;
  /** Pre-resolved grid span classes - the grid never builds class names itself. */
  spanClassName: string;
  content: ReactNode;
}

interface DraggableWidgetGridProps<TId extends string, TSize extends string> {
  items: readonly WidgetGridItem<TId, TSize>[];
  editing: boolean;
  /**
   * Enables FLIP movement. Kept off until the caller's entrance animation has
   * finished, because `layout` and an animated `y` fight over the same transform.
   */
  layoutReady?: boolean;
  /** Number of stacks to render; has to match the tracks in `columnsClassName`. */
  columnCount: number;
  columnsClassName: string;
  /** Classes for one column stack. Its gap has to match the grid's own gap. */
  stackClassName: string;
  itemVariants?: Variants;
  onReorder: (from: number, to: number, column?: number) => void;
  onResize: (id: TId, size: TSize) => void;
}

interface PlacedItem<TId extends string, TSize extends string> {
  item: WidgetGridItem<TId, TSize>;
  /** Index in the flat `items` order, which is what `onReorder` speaks. */
  index: number;
}

/**
 * A band is one row of the outer grid: either a set of independently stacked
 * columns or a single full-width item.
 */
type Band<TId extends string, TSize extends string> =
  | { kind: 'columns'; columns: PlacedItem<TId, TSize>[][] }
  | { kind: 'full'; placed: PlacedItem<TId, TSize> };

/**
 * Splits the flat order into bands: every full-width item closes the band before
 * it and gets a row to itself, so column stacks only ever pack against items that
 * share their band.
 */
function buildBands<TId extends string, TSize extends string>(
  items: readonly WidgetGridItem<TId, TSize>[],
  columnCount: number,
): Band<TId, TSize>[] {
  const bands: Band<TId, TSize>[] = [];
  let open: PlacedItem<TId, TSize>[][] | null = null;

  items.forEach((item, index) => {
    if (item.fullWidth) {
      open = null;
      bands.push({ kind: 'full', placed: { item, index } });
      return;
    }

    let columns = open;

    if (!columns) {
      columns = Array.from({ length: columnCount }, () => []);
      open = columns;
      bands.push({ kind: 'columns', columns });
    }

    columns[Math.min(Math.max(item.column, 0), columnCount - 1)].push({ item, index });
  });

  return bands;
}

function pointerPosition(
  event: MouseEvent | TouchEvent | PointerEvent,
): { x: number; y: number } | null {
  if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY };
  }

  const touch = event.touches[0] ?? event.changedTouches[0];

  return touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function contains(rect: DOMRect, x: number, y: number): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Colours live in the variants, never in the base: two competing `bg-*` utilities
// on one element resolve by stylesheet order, not by concatenation order, so a
// base `bg-white` would beat the active `bg-black` and hide its white label.
const CONTROL_BASE =
  'rounded-lg border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40';
const CONTROL_IDLE = 'bg-white text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#111827]';
const CONTROL_ACTIVE = 'bg-black text-white hover:bg-slate-800';

type MoveAction = 'earlier' | 'later' | 'previous-column' | 'next-column';

/**
 * Reorderable/resizable widget board. Deliberately knows nothing about the data it
 * renders: callers supply the content, the column each item sits in and the sizes
 * each item accepts, so the same board works for any widget set.
 *
 * Columns are independent stacks rather than rows of one shared grid: shared rows
 * make a tall card in one column inflate its neighbour's row tracks, which leaves
 * dead space nothing can reclaim.
 *
 * Pointer users drag a whole card; keyboard and screen-reader users get explicit
 * move controls on every card, which also accept the arrow keys. Both paths go
 * through `onReorder`, so there is one reordering code path.
 */
export function DraggableWidgetGrid<TId extends string, TSize extends string>({
  items,
  editing,
  layoutReady = false,
  columnCount,
  columnsClassName,
  stackClassName,
  itemVariants,
  onReorder,
  onResize,
}: DraggableWidgetGridProps<TId, TSize>) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cellsRef = useRef(new Map<string, HTMLDivElement>());
  const rectsRef = useRef<{ id: string; rect: DOMRect }[]>([]);
  /** Blocks further hit-testing until the committed order has been re-measured. */
  const lockedRef = useRef(false);
  /** Control to re-focus after a move that moved its card to another stack. */
  const pendingFocusRef = useRef<{ id: string; action: MoveAction } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const measureCells = useCallback(() => {
    const rects: { id: string; rect: DOMRect }[] = [];

    cellsRef.current.forEach((node, id) => {
      rects.push({ id, rect: node.getBoundingClientRect() });
    });

    rectsRef.current = rects;
  }, []);

  // Registration goes through a callback rather than an inline ref body so no ref is
  // read from the render path, not even inside a closure the renderer only defines.
  const registerCell = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      cellsRef.current.set(id, node);
    } else {
      cellsRef.current.delete(id);
    }
  }, []);

  // Re-measure after every committed reorder, so the next hit-test uses the new
  // positions instead of the ones captured when the drag started.
  useEffect(() => {
    if (!draggingId) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      measureCells();
      lockedRef.current = false;
    });

    return () => cancelAnimationFrame(frame);
  }, [items, draggingId, measureCells]);

  // Moving a card to another column re-parents it, which React does by remounting the
  // cell - the control the keyboard user pressed is destroyed with it and focus falls
  // back to the body, so arrow-key reordering would stop after a single step.
  //
  // The control is looked up in the DOM rather than kept in a ref map on purpose: the
  // remount deletes and recreates the same map key in the same commit, so a map
  // cannot be relied on to hold the live node by the time this runs.
  useEffect(() => {
    const pending = pendingFocusRef.current;

    if (!pending) {
      return;
    }

    pendingFocusRef.current = null;

    const find = (action: MoveAction) =>
      gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-widget-control="${pending.id}|${action}"]`,
      ) ?? null;

    // A cross-column move can land the card in the last column, which disables the
    // control that was just used; focus then goes to the card's vertical controls so
    // the keyboard user keeps a hold on the same card.
    const candidates: MoveAction[] =
      pending.action === 'earlier' || pending.action === 'later'
        ? [pending.action, pending.action === 'later' ? 'earlier' : 'later']
        : [pending.action, pending.action === 'next-column' ? 'previous-column' : 'next-column'];

    for (const action of candidates) {
      const target = find(action);

      if (target && !target.disabled) {
        if (target !== document.activeElement) {
          target.focus();
        }

        return;
      }
    }
  }, [items]);

  const requestMove = (
    id: string,
    action: MoveAction,
    from: number,
    to: number,
    column: number | undefined,
    message: string,
  ) => {
    pendingFocusRef.current = { id, action };
    onReorder(from, to, column);
    setAnnouncement(message);
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    lockedRef.current = false;
    measureCells();
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, id: string) => {
    if (lockedRef.current) {
      return;
    }

    const point = pointerPosition(event);

    if (!point) {
      return;
    }

    const hit = rectsRef.current.find(
      (cell) => cell.id !== id && contains(cell.rect, point.x, point.y),
    );

    if (!hit) {
      return;
    }

    const from = items.findIndex((item) => item.id === id);
    const to = items.findIndex((item) => item.id === hit.id);

    if (from < 0 || to < 0 || from === to) {
      return;
    }

    lockedRef.current = true;
    // The card takes over the column of whatever it was dropped on, so a drag
    // across the board moves between stacks as well as within one.
    const target = items[to];
    onReorder(from, to, target.fullWidth || items[from].fullWidth ? undefined : target.column);
  };

  const handleDragEnd = (id: string, label: string) => {
    setDraggingId(null);
    lockedRef.current = false;

    const index = items.findIndex((item) => item.id === id);

    if (index >= 0) {
      setAnnouncement(`${label} moved to position ${index + 1} of ${items.length}`);
    }
  };

  const bands = buildBands(items, columnCount);

  const renderCell = (
    placed: PlacedItem<TId, TSize>,
    siblings: readonly PlacedItem<TId, TSize>[],
  ) => {
    const { item, index } = placed;
    const position = siblings.findIndex((sibling) => sibling.item.id === item.id);

    // A full-width card has no stack to move inside, so it steps through the flat
    // order instead - which is what carries it past the bands around it.
    const earlier = item.fullWidth
      ? index > 0
        ? index - 1
        : null
      : position > 0
        ? siblings[position - 1].index
        : null;
    const later = item.fullWidth
      ? index < items.length - 1
        ? index + 1
        : null
      : position < siblings.length - 1
        ? siblings[position + 1].index
        : null;
    const previousColumn = !item.fullWidth && item.column > 0 ? item.column - 1 : null;
    const nextColumn = !item.fullWidth && item.column < columnCount - 1 ? item.column + 1 : null;

    const where = item.fullWidth
      ? `position ${index + 1} of ${items.length}`
      : `column ${item.column + 1}`;

    // A disabled control must still say what it would have done: naming the column it
    // cannot reach would repeat the label of the control pointing the other way.
    const columnLabel = (target: number | null, direction: 'previous' | 'next') =>
      target === null
        ? `Move ${item.label} to the ${direction} column`
        : `Move ${item.label} to column ${target + 1}`;

    const moveVertically = (action: 'earlier' | 'later') => {
      const to = action === 'earlier' ? earlier : later;

      if (to === null) {
        return;
      }

      const nextPosition = item.fullWidth
        ? to + 1
        : (action === 'earlier' ? position - 1 : position + 1) + 1;
      const total = item.fullWidth ? items.length : siblings.length;

      requestMove(
        item.id,
        action,
        index,
        to,
        undefined,
        `${item.label} moved to position ${nextPosition} of ${total}${
          item.fullWidth ? '' : ` in column ${item.column + 1}`
        }`,
      );
    };

    const moveToColumn = (action: 'previous-column' | 'next-column') => {
      const column = action === 'previous-column' ? previousColumn : nextColumn;

      if (column === null) {
        return;
      }

      requestMove(
        item.id,
        action,
        index,
        index,
        column,
        `${item.label} moved to column ${column + 1}`,
      );
    };

    const handleMoveKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowUp') {
        moveVertically('earlier');
      } else if (event.key === 'ArrowDown') {
        moveVertically('later');
      } else if (event.key === 'ArrowLeft') {
        moveToColumn('previous-column');
      } else if (event.key === 'ArrowRight') {
        moveToColumn('next-column');
      } else {
        return;
      }

      // Otherwise the arrow keys scroll the page instead of moving the card.
      event.preventDefault();
    };

    return (
      <motion.div
        key={item.id}
        ref={(node: HTMLDivElement | null) => registerCell(item.id, node)}
        role="listitem"
        variants={itemVariants}
        layout={layoutReady}
        drag={editing}
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0.12}
        onDragStart={() => handleDragStart(item.id)}
        onDrag={(event) => handleDrag(event, item.id)}
        onDragEnd={() => handleDragEnd(item.id, item.label)}
        whileDrag={
          editing
            ? { scale: 1.02, zIndex: 50, boxShadow: '0 18px 40px rgba(17, 24, 39, 0.16)' }
            : undefined
        }
        className={`relative min-w-0 ${item.spanClassName} ${editing ? 'touch-none' : ''} ${
          editing && draggingId !== item.id
            ? 'rounded-2xl outline-2 outline-dashed outline-offset-2 outline-[#D1D5DB]'
            : ''
        }`}
      >
        {item.content}

        {editing ? (
          <>
            {/* Covers the card so its own buttons and links cannot fire while
                arranging, and makes the whole card the drag surface. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 cursor-grab rounded-2xl bg-white/55 active:cursor-grabbing"
            />

            <div className="absolute right-3 top-3 z-20 flex flex-wrap items-center justify-end gap-1">
              <div
                role="group"
                aria-label={`Reorder ${item.label}`}
                className="flex items-center gap-1"
              >
                <button
                  type="button"
                  data-widget-control={`${item.id}|earlier`}
                  onClick={() => moveVertically('earlier')}
                  onKeyDown={handleMoveKeyDown}
                  disabled={earlier === null}
                  aria-label={`Move ${item.label} up in ${where}`}
                  className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                >
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-widget-control={`${item.id}|later`}
                  onClick={() => moveVertically('later')}
                  onKeyDown={handleMoveKeyDown}
                  disabled={later === null}
                  aria-label={`Move ${item.label} down in ${where}`}
                  className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                >
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-widget-control={`${item.id}|previous-column`}
                  onClick={() => moveToColumn('previous-column')}
                  onKeyDown={handleMoveKeyDown}
                  disabled={previousColumn === null}
                  aria-label={columnLabel(previousColumn, 'previous')}
                  className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-widget-control={`${item.id}|next-column`}
                  onClick={() => moveToColumn('next-column')}
                  onKeyDown={handleMoveKeyDown}
                  disabled={nextColumn === null}
                  aria-label={columnLabel(nextColumn, 'next')}
                  className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {item.sizeOptions.length > 1 ? (
                <div
                  role="group"
                  aria-label={`Size for ${item.label}`}
                  className="flex items-center gap-1"
                >
                  {item.sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onResize(item.id, option.value)}
                      aria-pressed={item.size === option.value}
                      className={`${CONTROL_BASE} ${
                        item.size === option.value ? CONTROL_ACTIVE : CONTROL_IDLE
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </motion.div>
    );
  };

  return (
    <>
      <div ref={gridRef} role="list" className={columnsClassName}>
        {bands.map((band, bandIndex) =>
          band.kind === 'full'
            ? renderCell(band.placed, [band.placed])
            : band.columns.map((column, columnIndex) => (
                // `presentation` keeps the stacks out of the accessibility tree, so
                // the cells stay the list's own items.
                <div
                  key={`${bandIndex}-${columnIndex}`}
                  role="presentation"
                  className={stackClassName}
                >
                  {column.map((placed) => renderCell(placed, column))}
                </div>
              )),
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
