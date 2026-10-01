import '@testing-library/jest-dom/vitest';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { CellChangedEvent, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

/**
 * A column dropped from aggregation leaves its key in the previous aggData, and the row node reports
 * that as a cellChanged to undefined. Swapping one column for another keeps the count the same, so
 * only comparing the columns themselves can tell that the keys moved.
 */
describe('grouping aggregation: events for a column dropped from aggregation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('dropping a value column reports its aggregate as removed', async () => {
        const api = await gridsManager.createGridAndWait('agg-removed-col', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b' },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            rowData: [
                { group: 'A', a: 1, b: 10 },
                { group: 'A', a: 2, b: 20 },
            ],
        });

        let groupNode: IRowNode | undefined;
        api.forEachNode((node) => {
            if (node.group) {
                groupNode = node;
            }
        });
        expect(groupNode!.aggData).toMatchObject({ a: 3 });

        const removed: [string, unknown][] = [];
        groupNode!.addEventListener('cellChanged', (event: CellChangedEvent) => {
            if (event.newValue === undefined) {
                removed.push([event.column.getColId(), event.oldValue]);
            }
        });

        // Same number of value columns before and after, so the count alone cannot reveal the swap.
        api.applyColumnState({
            state: [
                { colId: 'a', aggFunc: null },
                { colId: 'b', aggFunc: 'sum' },
            ],
        });

        expect(groupNode!.aggData).toMatchObject({ b: 30 });
        expect(groupNode!.aggData!.a).toBeUndefined();
        expect(removed).toEqual([['a', 3]]);
    });

    // Takes the no-value-columns early return, which passes no event columns at all, so this guards
    // that branch rather than the removal check the swap above drives.
    test('dropping the last value column reports every aggregate as removed', async () => {
        const api = await gridsManager.createGridAndWait('agg-cleared', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: 'sum' },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            rowData: [
                { group: 'A', a: 1 },
                { group: 'A', a: 2 },
            ],
        });

        let groupNode: IRowNode | undefined;
        api.forEachNode((node) => {
            if (node.group) {
                groupNode = node;
            }
        });
        expect(groupNode!.aggData).toMatchObject({ a: 3 });

        const removed: [string, unknown][] = [];
        groupNode!.addEventListener('cellChanged', (event: CellChangedEvent) => {
            if (event.newValue === undefined) {
                removed.push([event.column.getColId(), event.oldValue]);
            }
        });

        api.applyColumnState({ state: [{ colId: 'a', aggFunc: null }] });

        expect(groupNode!.aggData ?? {}).toEqual({});
        expect(removed).toEqual([['a', 3]]);
    });

    // Clearing the last aggregate only happens on a full refresh, which redraws the rows, so a getter
    // reading the removed total is repainted without the post-aggregation sweep reaching it.
    test('a getter reading a removed total blanks when the last value column goes', async () => {
        const api = await gridsManager.createGridAndWait('agg-cleared-getter', {
            columnDefs: [
                { field: 'group', rowGroup: true, hide: true },
                { field: 'a', aggFunc: 'sum' },
                { colId: 'derived', valueGetter: (params) => params.node?.parent?.aggData?.a ?? '' },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', group: 'A', a: 1 },
                { id: '2', group: 'A', a: 2 },
            ],
        });

        const derived = () =>
            document.querySelector('#agg-cleared-getter [row-id="1"] [col-id="derived"]')?.textContent?.trim();

        expect(derived()).toBe('3');

        api.applyColumnState({ state: [{ colId: 'a', aggFunc: null }] });
        await asyncSetTimeout(0);

        expect(derived()).toBe('');
    });
});
