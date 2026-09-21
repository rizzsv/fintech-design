import { z } from 'zod';

/**
 * Dashboard widget registry + layout persistence.
 *
 * Each widget lives in one of two independently stacked columns. Columns are
 * deliberately *not* rows of a shared grid: with shared rows a tall card in one
 * column inflates the row tracks of the other, which leaves dead space above and
 * below its neighbours. A stack packs at exactly the gap, whatever the heights.
 *
 * A size is a *footprint* only - it never sets a card's height. `sm` keeps the card
 * inside its column; `wide` lifts it out into a full-width row of its own.
 */
export type WidgetSize = 'sm' | 'wide';

/** Index of the column stack a widget belongs to. */
export type WidgetColumn = 0 | 1;

export const COLUMN_COUNT = 2;

export type WidgetId =
  | 'financial-overview'
  | 'recent-transactions'
  | 'transfer-limits'
  | 'cash-flow-summary'
  | 'cash-flow-chart'
  | 'account-overview';

/**
 * Static map: Tailwind v4 scans source text, so span classes can never be built
 * at runtime (`md:col-span-${n}` would not be generated).
 *
 * The span is `md:`-prefixed so the single-column mobile grid ignores it - a
 * `col-span-2` in a one-column grid creates an implicit second column and
 * overflows the viewport horizontally.
 */
export const SPAN_CLASS: Record<WidgetSize, string> = {
  sm: '',
  wide: 'md:col-span-2',
};

export const SIZE_LABEL: Record<WidgetSize, string> = {
  sm: 'Normal',
  wide: 'Full width',
};

export interface WidgetDefinition {
  id: WidgetId;
  label: string;
  /** Sizes that make sense for this card's content, not the full `WidgetSize` set. */
  allowedSizes: readonly WidgetSize[];
  defaultSize: WidgetSize;
  defaultColumn: WidgetColumn;
}

/**
 * Registry order is the default order *within* a column, and the column split
 * reproduces the arrangement the dashboard already shipped with: balance / limits
 * / cash-flow summary / account overview on the left, transactions + chart on the
 * right.
 */
export const WIDGET_REGISTRY: readonly WidgetDefinition[] = [
  {
    id: 'financial-overview',
    label: 'Total Balance',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 0,
  },
  {
    id: 'recent-transactions',
    label: 'Recent Transactions',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 1,
  },
  {
    id: 'transfer-limits',
    label: 'Transfer Limits',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 0,
  },
  {
    id: 'cash-flow-summary',
    label: 'Income / Expense / Net',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 0,
  },
  {
    id: 'cash-flow-chart',
    label: 'Cash Flow',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 1,
  },
  {
    id: 'account-overview',
    label: 'Account Overview',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
    defaultColumn: 0,
  },
];

const DEFINITION_BY_ID = new Map<WidgetId, WidgetDefinition>(
  WIDGET_REGISTRY.map((definition) => [definition.id, definition]),
);

export function widgetDefinition(id: WidgetId): WidgetDefinition {
  const definition = DEFINITION_BY_ID.get(id);

  if (!definition) {
    throw new Error(`Unknown dashboard widget: ${id}`);
  }

  return definition;
}

/**
 * Position inside a column is the order of the entries that share that column, so
 * the in-memory layout needs no `order` field.
 */
export interface WidgetLayoutEntry {
  id: WidgetId;
  size: WidgetSize;
  column: WidgetColumn;
}

export type WidgetLayout = WidgetLayoutEntry[];

export function defaultLayout(): WidgetLayout {
  return WIDGET_REGISTRY.map((definition) => ({
    id: definition.id,
    size: definition.defaultSize,
    column: definition.defaultColumn,
  }));
}

export const LAYOUT_VERSION = 2;

export function layoutStorageKey(userId: string): string {
  return `fintech:dashboard-layout:v${LAYOUT_VERSION}:${userId}`;
}

/**
 * `id`, `size` and `column` stay loose here on purpose: an id that no longer
 * exists, a size a widget does not allow or a column that is out of range is a
 * *recoverable* condition handled by `mergeWithDefaults`, not a reason to throw
 * the whole layout away.
 */
const storedWidgetSchema = z.object({
  id: z.string(),
  size: z.string(),
  column: z.number(),
  order: z.number(),
});

const storedLayoutSchema = z.object({
  version: z.literal(LAYOUT_VERSION),
  widgets: z.array(storedWidgetSchema),
});

export type StoredWidget = z.infer<typeof storedWidgetSchema>;

function resolveSize(definition: WidgetDefinition, size: string): WidgetSize {
  return definition.allowedSizes.includes(size as WidgetSize)
    ? (size as WidgetSize)
    : definition.defaultSize;
}

function resolveColumn(definition: WidgetDefinition, column: number): WidgetColumn {
  return column === 0 || column === 1 ? column : definition.defaultColumn;
}

/**
 * Reconciles a stored layout with the registry so a released widget change can
 * never leave the dashboard missing a card or rendering a stale one:
 * unknown ids are dropped, duplicates ignored, disallowed sizes and out-of-range
 * columns fall back to the widget default, and widgets absent from storage are
 * re-inserted at their default position.
 */
export function mergeWithDefaults(stored: readonly StoredWidget[] | null | undefined): WidgetLayout {
  const layout: WidgetLayout = [];
  const seen = new Set<WidgetId>();

  const ordered = [...(stored ?? [])].sort((a, b) => a.order - b.order);

  for (const entry of ordered) {
    const definition = DEFINITION_BY_ID.get(entry.id as WidgetId);

    if (!definition || seen.has(definition.id)) {
      continue;
    }

    seen.add(definition.id);
    layout.push({
      id: definition.id,
      size: resolveSize(definition, entry.size),
      column: resolveColumn(definition, entry.column),
    });
  }

  WIDGET_REGISTRY.forEach((definition, index) => {
    if (seen.has(definition.id)) {
      return;
    }

    layout.splice(Math.min(index, layout.length), 0, {
      id: definition.id,
      size: definition.defaultSize,
      column: definition.defaultColumn,
    });
  });

  return layout;
}

export function clearLayout(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(layoutStorageKey(userId));
  } catch {
    // Storage unavailable (private mode, disabled cookies): nothing to clean up.
  }
}

/**
 * Reads the persisted layout, falling back to the default whenever the stored
 * value cannot be trusted. A bad or outdated payload is deleted rather than left
 * to fail again on every load.
 */
export function loadLayout(userId: string): WidgetLayout {
  if (typeof window === 'undefined') {
    return defaultLayout();
  }

  let raw: string | null;

  try {
    raw = window.localStorage.getItem(layoutStorageKey(userId));
  } catch {
    return defaultLayout();
  }

  if (!raw) {
    return defaultLayout();
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    clearLayout(userId);
    return defaultLayout();
  }

  const result = storedLayoutSchema.safeParse(parsed);

  if (!result.success) {
    clearLayout(userId);
    return defaultLayout();
  }

  return mergeWithDefaults(result.data.widgets);
}

/**
 * Persists arrangement only - ids, sizes, columns and positions. No balance,
 * transaction or other API payload ever reaches storage.
 */
export function saveLayout(userId: string, layout: WidgetLayout): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    version: LAYOUT_VERSION,
    widgets: layout.map((entry, order) => ({
      id: entry.id,
      size: entry.size,
      column: entry.column,
      order,
    })),
  };

  try {
    window.localStorage.setItem(layoutStorageKey(userId), JSON.stringify(payload));
  } catch {
    // Quota or private mode: the layout still applies for this session.
  }
}

/**
 * Immutable move used by pointer drag and keyboard reordering alike. `to` moves the
 * widget within the flat order (which is what orders each column), `column` moves it
 * between columns; either may be a no-op, and a call that changes nothing returns the
 * same array so callers can skip the write.
 */
export function moveWidget(
  layout: WidgetLayout,
  from: number,
  to: number,
  column?: WidgetColumn,
): WidgetLayout {
  if (from < 0 || from >= layout.length) {
    return layout;
  }

  const entry = layout[from];
  const nextColumn = column ?? entry.column;
  const reposition = to !== from && to >= 0 && to < layout.length;

  if (!reposition && nextColumn === entry.column) {
    return layout;
  }

  const next = [...layout];
  next[from] = nextColumn === entry.column ? entry : { ...entry, column: nextColumn };

  if (reposition) {
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
  }

  return next;
}
