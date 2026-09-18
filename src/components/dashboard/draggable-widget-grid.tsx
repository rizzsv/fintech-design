'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface WidgetGridItem<TId extends string, TSize extends string> {
  id: TId;
  /** Human name used by the move controls, the size group and announcements. */
  label: string;
  size: TSize;
  sizeOptions: readonly { value: TSize; label: string }[];
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
  columnsClassName: string;
  itemVariants?: Variants;
  onReorder: (from: number, to: number) => void;
  onResize: (id: TId, size: TSize) => void;
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

/** Arrow keys step one position in the flat widget order, along either axis. */
function arrowDelta(key: string): number | null {
  if (key === 'ArrowUp' || key === 'ArrowLeft') return -1;
  if (key === 'ArrowDown' || key === 'ArrowRight') return 1;
  return null;
}

// Colours live in the variants, never in the base: two competing `bg-*` utilities
// on one element resolve by stylesheet order, not by concatenation order, so a
// base `bg-white` would beat the active `bg-black` and hide its white label.
const CONTROL_BASE =
  'rounded-lg border border-[#E5E7EB] px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40';
const CONTROL_IDLE = 'bg-white text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#111827]';
const CONTROL_ACTIVE = 'bg-black text-white hover:bg-slate-800';

/**
 * Reorderable/resizable grid. Deliberately knows nothing about the data it
 * renders: callers supply the content, a span class per item and the sizes each
 * item accepts, so the same grid works for any widget set.
 *
 * Pointer users drag a whole card; keyboard and screen-reader users get explicit
 * move buttons on every card, which also accept the arrow keys. Both paths go
 * through `onReorder`, so there is one reordering code path.
 */
export function DraggableWidgetGrid<TId extends string, TSize extends string>({
  items,
  editing,
  layoutReady = false,
  columnsClassName,
  itemVariants,
  onReorder,
  onResize,
}: DraggableWidgetGridProps<TId, TSize>) {
  const cellsRef = useRef(new Map<string, HTMLDivElement>());
  const rectsRef = useRef<{ id: string; rect: DOMRect }[]>([]);
  /** Blocks further hit-testing until the committed order has been re-measured. */
  const lockedRef = useRef(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const measureCells = useCallback(() => {
    const rects: { id: string; rect: DOMRect }[] = [];

    cellsRef.current.forEach((node, id) => {
      rects.push({ id, rect: node.getBoundingClientRect() });
    });

    rectsRef.current = rects;
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

  const move = (label: string, from: number, to: number) => {
    if (from < 0 || to < 0 || to >= items.length || from === to) {
      return;
    }

    onReorder(from, to);
    setAnnouncement(`${label} moved to position ${to + 1} of ${items.length}`);
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
    onReorder(from, to);
  };

  const handleDragEnd = (id: string, label: string) => {
    setDraggingId(null);
    lockedRef.current = false;

    const index = items.findIndex((item) => item.id === id);

    if (index >= 0) {
      setAnnouncement(`${label} moved to position ${index + 1} of ${items.length}`);
    }
  };

  const handleMoveKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    label: string,
    index: number,
  ) => {
    const delta = arrowDelta(event.key);

    if (delta === null) {
      return;
    }

    // Otherwise the arrow keys scroll the page instead of moving the card.
    event.preventDefault();
    move(label, index, index + delta);
  };

  return (
    <>
      <div role="list" className={columnsClassName}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            ref={(node: HTMLDivElement | null) => {
              if (node) {
                cellsRef.current.set(item.id, node);
              } else {
                cellsRef.current.delete(item.id);
              }
            }}
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
            className={`relative min-w-0 ${item.spanClassName} ${
              editing ? 'touch-none' : ''
            } ${
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
                      onClick={() => move(item.label, index, index - 1)}
                      onKeyDown={(event) => handleMoveKeyDown(event, item.label, index)}
                      disabled={index === 0}
                      aria-label={`Move ${item.label} earlier`}
                      className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(item.label, index, index + 1)}
                      onKeyDown={(event) => handleMoveKeyDown(event, item.label, index)}
                      disabled={index === items.length - 1}
                      aria-label={`Move ${item.label} later`}
                      className={`${CONTROL_BASE} ${CONTROL_IDLE} flex items-center`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
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
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
