import { z } from 'zod';

/**
 * Dashboard widget registry + layout persistence.
 *
 * A size is a grid *footprint* only - it never sets a card's height. Cards keep
 * the intrinsic heights they render at today; `wide`/`tall` just let a card claim
 * more columns/rows of the logical grid.
 */
export type WidgetSize = 'sm' | 'wide' | 'tall' | 'lg';

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
 * Every span is `md:`-prefixed so the single-column mobile grid ignores them -
 * a `col-span-2` in a one-column grid creates an implicit second column and
 * overflows the viewport horizontally.
 */
export const SPAN_CLASS: Record<WidgetSize, string> = {
  sm: '',
  wide: 'md:col-span-2',
  tall: 'md:row-span-2',
  lg: 'md:col-span-2 md:row-span-2',
};

export const SIZE_LABEL: Record<WidgetSize, string> = {
  sm: 'Small',
  wide: 'Wide',
  tall: 'Tall',
  lg: 'Large',
};

export interface WidgetDefinition {
  id: WidgetId;
  label: string;
  /** Sizes that make sense for this card's content, not the full `WidgetSize` set. */
  allowedSizes: readonly WidgetSize[];
  defaultSize: WidgetSize;
}

/**
 * Registry order is the default layout order. Combined with
 * `md:grid-flow-row-dense` this resolves to the arrangement the dashboard
 * already shipped with: balance / limits / cash-flow summary / account overview
 * in the left column, transactions + chart in the right one.
 */
export const WIDGET_REGISTRY: readonly WidgetDefinition[] = [
  {
    id: 'financial-overview',
    label: 'Total Balance',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
  },
  {
    id: 'recent-transactions',
    label: 'Recent Transactions',
    allowedSizes: ['sm', 'tall', 'wide', 'lg'],
    defaultSize: 'tall',
  },
  {
    id: 'transfer-limits',
    label: 'Transfer Limits',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
  },
  {
    id: 'cash-flow-summary',
    label: 'Income / Expense / Net',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
  },
  {
    id: 'cash-flow-chart',
    label: 'Cash Flow',
    allowedSizes: ['tall', 'wide', 'lg'],
    defaultSize: 'tall',
  },
  {
    id: 'account-overview',
    label: 'Account Overview',
    allowedSizes: ['sm', 'wide'],
    defaultSize: 'sm',
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

/** Position is the array index, so the in-memory layout needs no `order` field. */
export interface WidgetLayoutEntry {
  id: WidgetId;
  size: WidgetSize;
}

export type WidgetLayout = WidgetLayoutEntry[];

export function defaultLayout(): WidgetLayout {
  return WIDGET_REGISTRY.map((definition) => ({
    id: definition.id,
    size: definition.defaultSize,
  }));
}

export const LAYOUT_VERSION = 1;

export function layoutStorageKey(userId: string): string {
  return `fintech:dashboard-layout:v${LAYOUT_VERSION}:${userId}`;
}

/**
 * `id` and `size` stay loose strings here on purpose: an id that no longer exists
 * or a size a widget does not allow is a *recoverable* condition handled by
 * `mergeWithDefaults`, not a reason to throw the whole layout away.
 */
const storedWidgetSchema = z.object({
  id: z.string(),
  size: z.string(),
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

/**
 * Reconciles a stored layout with the registry so a released widget change can
 * never leave the dashboard missing a card or rendering a stale one:
 * unknown ids are dropped, duplicates ignored, disallowed sizes fall back to the
 * widget default, and widgets absent from storage are re-inserted at their
 * default position.
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
    layout.push({ id: definition.id, size: resolveSize(definition, entry.size) });
  }

  WIDGET_REGISTRY.forEach((definition, index) => {
    if (seen.has(definition.id)) {
      return;
    }

    layout.splice(Math.min(index, layout.length), 0, {
      id: definition.id,
      size: definition.defaultSize,
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
 * Persists arrangement only - ids, sizes and positions. No balance, transaction
 * or other API payload ever reaches storage.
 */
export function saveLayout(userId: string, layout: WidgetLayout): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    version: LAYOUT_VERSION,
    widgets: layout.map((entry, order) => ({ id: entry.id, size: entry.size, order })),
  };

  try {
    window.localStorage.setItem(layoutStorageKey(userId), JSON.stringify(payload));
  } catch {
    // Quota or private mode: the layout still applies for this session.
  }
}

/** Immutable move used by both pointer drag and keyboard reordering. */
export function moveWidget(layout: WidgetLayout, from: number, to: number): WidgetLayout {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= layout.length ||
    to >= layout.length
  ) {
    return layout;
  }

  const next = [...layout];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
}
