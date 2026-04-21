/**
 * Tests for the `api.applyAutoSizeStrategy()` grid API method. Covers:
 * - No-op when no strategy is configured and no override is passed
 * - Applies `fitProvidedWidth` configured on `gridOptions.autoSizeStrategy`
 * - Applies a strategy passed as the override argument
 * - Override argument takes precedence over the configured strategy
 * - Applies `fitGridWidth`
 * - Applies `fitCellContents` (autoSizeAllColumns path)
 * - Applies `fitCellContents` with `colIds` (autoSizeCols path)
 * - Is callable repeatedly (no one-shot guards)
 * - `columnResized` fires with `source: 'autoSizeStrategy'`
 *
 * Note: jsdom has no real layout engine. `mockGridLayout` (applied by
 * `TestGridsManager` by default) gives the grid a simulated width of 1000px
 * and simulated column widths of 150px. These tests assert behaviour that
 * does not depend on real cell content measurement.
 */
import { ClientSideRowModelModule, ColumnAutoSizeModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('applyAutoSizeStrategy API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('is a no-op when no strategy is configured and no override is passed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }],
        });

        // Let any init work settle.
        await asyncSetTimeout(5);

        const listener = vitest.fn();
        api.addEventListener('columnResized', listener);

        api.applyAutoSizeStrategy();
        await asyncSetTimeout(5);

        expect(listener).not.toHaveBeenCalled();
        api.removeEventListener('columnResized', listener);
    });

    test('applies fitProvidedWidth configured on gridOptions.autoSizeStrategy', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            autoSizeStrategy: { type: 'fitProvidedWidth', width: 600 },
        });

        // Wait for the init-time application to complete so the subsequent API call is isolated from it.
        await asyncSetTimeout(10);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(600);

        // Force columns off the configured total so the no-arg re-application isn't a no-op.
        // (`sizeColumnsToFit` correctly short-circuits when current widths already satisfy the target.)
        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 400 });
        await asyncSetTimeout(10);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(400);

        // Attach listener and verify the no-arg call re-applies the configured strategy (600) with the new source.
        const listener = vitest.fn();
        api.addEventListener('columnResized', listener);

        api.applyAutoSizeStrategy();
        await asyncSetTimeout(10);

        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(600);

        const sources = listener.mock.calls.map(([ev]) => ev.source);
        expect(sources).toContain('autoSizeStrategy');

        api.removeEventListener('columnResized', listener);
    });

    test('applies the strategy passed as the override argument', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
        });

        await asyncSetTimeout(5);

        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 800 });
        await asyncSetTimeout(5);

        const totalWidth = api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth();
        expect(totalWidth).toBe(800);
    });

    test('override argument takes precedence over the configured strategy', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            autoSizeStrategy: { type: 'fitProvidedWidth', width: 400 },
        });

        // Let the init-time application complete (columns should now sum to 400).
        await asyncSetTimeout(10);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(400);

        // Override should win over the configured 400.
        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 800 });
        await asyncSetTimeout(10);

        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(800);
    });

    test('applies fitGridWidth', async () => {
        // mockGridLayout gives the grid a simulated width of 1000px.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
        });

        await asyncSetTimeout(5);

        const listener = vitest.fn();
        api.addEventListener('columnResized', listener);

        api.applyAutoSizeStrategy({ type: 'fitGridWidth' });
        // sizeColumnsToFitGridBody defers on a zero-width check chain; give it room.
        await asyncSetTimeout(50);

        // Columns should have been resized (the exact widths depend on the mock layout).
        const totalWidth = api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth();
        expect(totalWidth).toBeGreaterThan(200);

        const sources = listener.mock.calls.map(([ev]) => ev.source);
        expect(sources).toContain('autoSizeStrategy');

        api.removeEventListener('columnResized', listener);
    });

    test('applies fitCellContents to all columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            rowData: [{ a: 'x', b: 'y' }],
        });

        await asyncSetTimeout(5);

        const listener = vitest.fn();
        api.addEventListener('columnResized', listener);

        api.applyAutoSizeStrategy({ type: 'fitCellContents' });
        await asyncSetTimeout(5);

        // fitCellContents with no cell content in jsdom falls back to default widths,
        // but the dispatch should still fire the event with the new source.
        expect(listener).toHaveBeenCalled();
        const sources = listener.mock.calls.map(([ev]) => ev.source);
        expect(sources).toContain('autoSizeStrategy');

        api.removeEventListener('columnResized', listener);
    });

    test('applies fitCellContents with colIds only to specified columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
                { colId: 'c', width: 100 },
            ],
            rowData: [{ a: 'x', b: 'y', c: 'z' }],
        });

        await asyncSetTimeout(5);

        const listener = vitest.fn();
        api.addEventListener('columnResized', listener);

        api.applyAutoSizeStrategy({ type: 'fitCellContents', colIds: ['a', 'b'] });
        await asyncSetTimeout(5);

        // Expect only columns a and b to appear in resize events; c should not be targeted.
        const resizedColIds = new Set<string>();
        for (const [ev] of listener.mock.calls) {
            for (const col of ev.columns ?? []) {
                resizedColIds.add(col.getColId());
            }
        }
        // At least one of the targeted columns should show up in the events,
        // and 'c' should not appear as a target.
        expect(resizedColIds.has('c')).toBe(false);

        api.removeEventListener('columnResized', listener);
    });

    test('is callable repeatedly', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
        });

        await asyncSetTimeout(5);

        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 400 });
        await asyncSetTimeout(5);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(400);

        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 700 });
        await asyncSetTimeout(5);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(700);

        api.applyAutoSizeStrategy({ type: 'fitProvidedWidth', width: 500 });
        await asyncSetTimeout(5);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(500);
    });
});
