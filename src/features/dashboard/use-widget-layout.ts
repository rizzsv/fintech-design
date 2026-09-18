'use client';

import { useCallback, useRef, useState } from 'react';

import {
  clearLayout,
  defaultLayout,
  loadLayout,
  moveWidget,
  saveLayout,
  widgetDefinition,
  type WidgetId,
  type WidgetLayout,
  type WidgetSize,
} from './widget-layout';

export interface UseWidgetLayoutResult {
  layout: WidgetLayout;
  reorder: (from: number, to: number) => void;
  resize: (id: WidgetId, size: WidgetSize) => void;
  reset: () => void;
}

/**
 * Layout state + localStorage persistence for one user.
 *
 * The stored layout is read in the state initialiser, so callers must mount this
 * hook only once the user id is known - the dashboard does that behind its
 * skeleton, which is why no default-then-stored flash is possible and why no load
 * effect is needed.
 *
 * `layoutRef` mirrors the state because every mutation is event-driven (drag end,
 * click, keypress) and has to write storage from the latest value: doing the write
 * inside a `setState` updater would make the updater impure, and doing it in an
 * effect on `layout` would immediately re-create the key `reset` just deleted.
 */
export function useWidgetLayout(userId: string): UseWidgetLayoutResult {
  const [layout, setLayout] = useState<WidgetLayout>(() => loadLayout(userId));
  const layoutRef = useRef<WidgetLayout>(layout);

  const apply = useCallback(
    (next: WidgetLayout) => {
      if (next === layoutRef.current) {
        return;
      }

      layoutRef.current = next;
      setLayout(next);
      saveLayout(userId, next);
    },
    [userId],
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      apply(moveWidget(layoutRef.current, from, to));
    },
    [apply],
  );

  const resize = useCallback(
    (id: WidgetId, size: WidgetSize) => {
      if (!widgetDefinition(id).allowedSizes.includes(size)) {
        return;
      }

      apply(layoutRef.current.map((entry) => (entry.id === id ? { ...entry, size } : entry)));
    },
    [apply],
  );

  const reset = useCallback(() => {
    const next = defaultLayout();
    layoutRef.current = next;
    setLayout(next);
    clearLayout(userId);
  }, [userId]);

  return { layout, reorder, resize, reset };
}
