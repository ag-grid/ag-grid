import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RowRangeSelectionContext } from 'ag-grid-community';

import { DefaultStrategy } from './defaultStrategy';

// Unit coverage for the SSRM default selection strategy, which holds selection as an in-memory
// { selectAll, toggledNodes } state with no grid dependencies. This pins the selection-layer half of the
// AG-16019 "repeating remove transaction corrupts store" fix (deleteSelectionStateFromParent must be idempotent)
// and the AG-8439 numeric-row-id handling (toggled ids are string-keyed).
describe('DefaultStrategy (SSRM selection)', () => {
    let strategy: DefaultStrategy;

    beforeEach(() => {
        const selectionCtx = { setRoot: vi.fn(), reset: vi.fn() } as unknown as RowRangeSelectionContext;
        strategy = new DefaultStrategy(selectionCtx);
        // gos is only consulted by setSelectedState's multi-selection guard; a multiRow mode lets multi-selection
        // state (selectAll / multiple toggled nodes) be applied rather than rejected.
        strategy['gos'] = {
            beanName: 'gos',
            get: (key: string) => (key === 'rowSelection' ? { mode: 'multiRow' } : undefined),
        } as any;
        // warn/error route through the logger infra which isn't wired in a unit test; stub them to assert calls.
        strategy['warn'] = vi.fn() as any;
        strategy['error'] = vi.fn() as any;
    });

    describe('isNodeSelected', () => {
        it('follows the toggled set when not selecting all', () => {
            strategy.setSelectedState({ selectAll: false, toggledNodes: ['a'] });
            expect(strategy.isNodeSelected({ id: 'a' } as any)).toBe(true);
            expect(strategy.isNodeSelected({ id: 'b' } as any)).toBe(false);
        });

        it('inverts the toggled set when selecting all', () => {
            strategy.setSelectedState({ selectAll: true, toggledNodes: ['a'] });
            // 'a' is toggled off the select-all base, so it is deselected; everything else is selected
            expect(strategy.isNodeSelected({ id: 'a' } as any)).toBe(false);
            expect(strategy.isNodeSelected({ id: 'b' } as any)).toBe(true);
        });
    });

    describe('getSelectAllState', () => {
        it('is false when nothing is selected', () => {
            expect(strategy.getSelectAllState()).toBe(false);
        });

        it('is true when selecting all with no exceptions', () => {
            strategy.setSelectedState({ selectAll: true, toggledNodes: [] });
            expect(strategy.getSelectAllState()).toBe(true);
        });

        it('is indeterminate (null) when there are toggled exceptions', () => {
            strategy.setSelectedState({ selectAll: true, toggledNodes: ['a'] });
            expect(strategy.getSelectAllState()).toBeNull();

            strategy.setSelectedState({ selectAll: false, toggledNodes: ['a'] });
            expect(strategy.getSelectAllState()).toBeNull();
        });
    });

    describe('getSelectionCount', () => {
        it('reports the toggled count when not selecting all', () => {
            strategy.setSelectedState({ selectAll: false, toggledNodes: ['a', 'b'] });
            expect(strategy.getSelectionCount()).toBe(2);
        });

        it('reports -1 (unknown/all) when selecting all', () => {
            strategy.setSelectedState({ selectAll: true, toggledNodes: [] });
            expect(strategy.getSelectionCount()).toBe(-1);
        });
    });

    describe('deleteSelectionStateFromParent (AG-16019 regression)', () => {
        it('removes toggled ids for removed rows and reports the change', () => {
            strategy.setSelectedState({ selectAll: false, toggledNodes: ['a', 'b'] });

            const changed = strategy.deleteSelectionStateFromParent([], ['b']);

            expect(changed).toBe(true);
            expect(strategy.getSelectedState().toggledNodes).toEqual(['a']);
        });

        it('is idempotent: repeating the same remove does not corrupt state or report a change', () => {
            strategy.setSelectedState({ selectAll: false, toggledNodes: ['a', 'b'] });

            expect(strategy.deleteSelectionStateFromParent([], ['b'])).toBe(true);
            // the bug: a repeated remove transaction previously mutated unrelated state; now it is a clean no-op
            expect(strategy.deleteSelectionStateFromParent([], ['b'])).toBe(false);
            expect(strategy.getSelectedState().toggledNodes).toEqual(['a']);
        });

        it('returns false without touching state when nothing is toggled', () => {
            expect(strategy.deleteSelectionStateFromParent([], ['b'])).toBe(false);
        });
    });

    describe('setSelectedState id handling (AG-8439)', () => {
        it('keeps string ids and drops non-string ids with a warning', () => {
            strategy.setSelectedState({ selectAll: false, toggledNodes: ['1', 2 as any] });

            expect(strategy.getSelectedState().toggledNodes).toEqual(['1']);
            expect(strategy['warn']).toHaveBeenCalledWith(196, { key: 2 });
        });
    });
});
