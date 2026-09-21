import { beforeEach, describe, expect, it } from 'vitest';

import {
  LAYOUT_VERSION,
  WIDGET_REGISTRY,
  clearLayout,
  defaultLayout,
  layoutStorageKey,
  loadLayout,
  mergeWithDefaults,
  moveWidget,
  saveLayout,
} from './widget-layout';

const USER_ID = 'user-1';
const KEY = layoutStorageKey(USER_ID);

function write(value: unknown) {
  localStorage.setItem(KEY, typeof value === 'string' ? value : JSON.stringify(value));
}

describe('dashboard widget layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to the registry order, sizes and columns', () => {
    expect(defaultLayout()).toEqual(
      WIDGET_REGISTRY.map((definition) => ({
        id: definition.id,
        size: definition.defaultSize,
        column: definition.defaultColumn,
      })),
    );
  });

  it('keeps a stored order, size and column round-trip intact', () => {
    const stored = moveWidget(defaultLayout(), 0, 3, 1);
    saveLayout(USER_ID, stored);

    expect(loadLayout(USER_ID)).toEqual(stored);
  });

  it('drops unknown widget ids', () => {
    const layout = mergeWithDefaults([
      { id: 'crypto-portfolio', size: 'sm', column: 0, order: 0 },
      ...defaultLayout().map((entry, order) => ({ ...entry, order: order + 1 })),
    ]);

    expect(layout.map((entry) => entry.id)).toEqual(defaultLayout().map((entry) => entry.id));
  });

  it('re-inserts a widget missing from storage at its default position', () => {
    const withoutSummary = defaultLayout()
      .filter((entry) => entry.id !== 'cash-flow-summary')
      .map((entry, order) => ({ ...entry, order }));

    expect(mergeWithDefaults(withoutSummary)).toEqual(defaultLayout());
  });

  it('keeps the stored order of the widgets it recognises', () => {
    const layout = mergeWithDefaults([
      { id: 'cash-flow-chart', size: 'sm', column: 1, order: 0 },
      { id: 'financial-overview', size: 'sm', column: 0, order: 1 },
    ]);

    const positions = layout.map((entry) => entry.id);

    expect(layout).toHaveLength(WIDGET_REGISTRY.length);
    expect(new Set(positions).size).toBe(WIDGET_REGISTRY.length);
    expect(positions.indexOf('cash-flow-chart')).toBeLessThan(
      positions.indexOf('financial-overview'),
    );
  });

  it('coerces a size the widget does not allow back to its default', () => {
    const [entry] = mergeWithDefaults([
      { id: 'financial-overview', size: 'tall', column: 0, order: 0 },
    ]);

    expect(entry).toEqual({ id: 'financial-overview', size: 'sm', column: 0 });
  });

  it('coerces a column outside the board back to the widget default', () => {
    const layout = mergeWithDefaults([
      { id: 'recent-transactions', size: 'sm', column: 7, order: 0 },
    ]);

    expect(layout.find((entry) => entry.id === 'recent-transactions')).toEqual({
      id: 'recent-transactions',
      size: 'sm',
      column: 1,
    });
  });

  it('keeps a stored column the board does support', () => {
    const layout = mergeWithDefaults([
      { id: 'account-overview', size: 'sm', column: 1, order: 0 },
    ]);

    expect(layout.find((entry) => entry.id === 'account-overview')).toEqual({
      id: 'account-overview',
      size: 'sm',
      column: 1,
    });
  });

  it('ignores duplicate entries for the same widget', () => {
    const layout = mergeWithDefaults([
      { id: 'transfer-limits', size: 'wide', column: 0, order: 0 },
      { id: 'transfer-limits', size: 'sm', column: 1, order: 1 },
    ]);

    expect(layout.filter((entry) => entry.id === 'transfer-limits')).toEqual([
      { id: 'transfer-limits', size: 'wide', column: 0 },
    ]);
  });

  it('discards a layout stored under a different version', () => {
    write({
      version: LAYOUT_VERSION + 1,
      widgets: [{ id: 'cash-flow-chart', size: 'wide', column: 1, order: 0 }],
    });

    expect(loadLayout(USER_ID)).toEqual(defaultLayout());
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('discards corrupt JSON', () => {
    write('{"version":1,"widgets":[');

    expect(loadLayout(USER_ID)).toEqual(defaultLayout());
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('discards a payload with the wrong shape', () => {
    write({ version: LAYOUT_VERSION, widgets: { 'cash-flow-chart': 'wide' } });

    expect(loadLayout(USER_ID)).toEqual(defaultLayout());
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('scopes storage per user', () => {
    saveLayout(USER_ID, moveWidget(defaultLayout(), 0, 5));

    expect(loadLayout('user-2')).toEqual(defaultLayout());
  });

  it('removes the stored key on reset', () => {
    saveLayout(USER_ID, moveWidget(defaultLayout(), 0, 2));
    clearLayout(USER_ID);

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(loadLayout(USER_ID)).toEqual(defaultLayout());
  });

  it('moves a widget without mutating the source layout', () => {
    const layout = defaultLayout();
    const moved = moveWidget(layout, 0, 2);

    expect(layout.map((entry) => entry.id)).toEqual(defaultLayout().map((entry) => entry.id));
    expect(moved.map((entry) => entry.id).slice(0, 3)).toEqual([
      'recent-transactions',
      'transfer-limits',
      'financial-overview',
    ]);
  });

  it('moves a widget to another column without reordering it', () => {
    const layout = defaultLayout();
    const moved = moveWidget(layout, 0, 0, 1);

    expect(moved.map((entry) => entry.id)).toEqual(layout.map((entry) => entry.id));
    expect(moved[0]).toEqual({ id: 'financial-overview', size: 'sm', column: 1 });
    expect(layout[0].column).toBe(0);
  });

  it('carries the new column along when a move also repositions the widget', () => {
    const moved = moveWidget(defaultLayout(), 0, 2, 1);

    expect(moved[2]).toEqual({ id: 'financial-overview', size: 'sm', column: 1 });
  });

  it('ignores out-of-range moves', () => {
    const layout = defaultLayout();

    expect(moveWidget(layout, 0, 0)).toBe(layout);
    expect(moveWidget(layout, 0, layout.length)).toBe(layout);
    expect(moveWidget(layout, -1, 1)).toBe(layout);
  });

  it('ignores a move to the column the widget already sits in', () => {
    const layout = defaultLayout();

    expect(moveWidget(layout, 0, 0, 0)).toBe(layout);
  });
});
