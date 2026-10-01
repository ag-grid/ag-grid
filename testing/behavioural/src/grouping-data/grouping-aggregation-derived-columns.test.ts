import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import type { CellValueChangedEvent, GridApi } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ValueCacheModule,
    getGridElement,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

/** A column whose valueGetter reads aggregated values rather than being aggregated itself. */
const TOTAL_COL_ID = 'total';

describe('grouping aggregation: columns derived from aggregates', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, ValueCacheModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const createGrid = (rowData: any[], extraOptions = {}) =>
        gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                { colId: TOTAL_COL_ID, valueGetter: 'getValue("a") + getValue("b")' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            rowData,
            ...extraOptions,
        });

    const groupCells = (api: GridApi, rowId: string) =>
        Object.fromEntries(
            [...getGridElement(api)!.querySelectorAll(`[row-id="${rowId}"] [col-id]`)].map((el) => [
                el.getAttribute('col-id'),
                el.textContent?.trim(),
            ])
        );

    test('a transaction update refreshes the derived column on the group row', async () => {
        const rowData = [
            { group: 'A', a: 1, b: 10 },
            { group: 'A', a: 2, b: 20 },
        ];
        const api = await createGrid(rowData);

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '3', b: '30', [TOTAL_COL_ID]: '33' });

        rowData[0].a = 101;
        api.applyTransaction({ update: [rowData[0]] });

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '103', b: '30', [TOTAL_COL_ID]: '133' });
    });

    test('moving a row between groups refreshes the derived column on both group rows', async () => {
        const rowData = [
            { group: 'A', a: 1, b: 10 },
            { group: 'A', a: 2, b: 20 },
            { group: 'B', a: 4, b: 40 },
        ];
        const api = await createGrid(rowData, {
            onCellValueChanged: (params: CellValueChangedEvent) => {
                if (params.data) {
                    params.api.applyTransaction({ update: [params.data] });
                }
            },
        });

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '3', b: '30', [TOTAL_COL_ID]: '33' });
        expect(groupCells(api, 'row-group-group-B')).toMatchObject({ a: '4', b: '40', [TOTAL_COL_ID]: '44' });

        api.getRowNode('0')!.setDataValue('group', 'B');

        await waitFor(() =>
            expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '2', b: '20', [TOTAL_COL_ID]: '22' })
        );
        expect(groupCells(api, 'row-group-group-B')).toMatchObject({ a: '5', b: '50', [TOTAL_COL_ID]: '55' });
    });

    // Characterisation, not a guard on the sweep: endDeferred refreshes the edited row's ancestors
    // itself, so this passes without the sweep. It pins that the exclusion did not break that path.
    test('characterisation: a plain cell edit refreshes the derived column on the group row', async () => {
        const api = await createGrid([
            { group: 'A', a: 1, b: 10 },
            { group: 'A', a: 2, b: 20 },
        ]);

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '3', b: '30', [TOTAL_COL_ID]: '33' });

        api.getRowNode('0')!.setDataValue('a', 101);

        await waitFor(() =>
            expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '103', b: '30', [TOTAL_COL_ID]: '133' })
        );
    });

    test('a cached valueGetter reading a parent total is not poisoned mid-traversal', async () => {
        const api = await gridsManager.createGridAndWait('cachedParentTotal', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                {
                    colId: 'share',
                    valueGetter: (params) => {
                        const total = params.node?.parent?.aggData?.gold;
                        const value = params.node?.aggData?.gold;
                        return total && value != null ? `${Math.round((value / total) * 100)}%` : '';
                    },
                },
            ],
            valueCache: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', country: 'A', sport: 'X', gold: 10 },
                { id: '2', country: 'A', sport: 'Y', gold: 30 },
            ],
        });

        expect(groupCells(api, 'row-group-country-A-sport-X')).toMatchObject({ gold: '10', share: '25%' });
        expect(groupCells(api, 'row-group-country-A-sport-Y')).toMatchObject({ gold: '30', share: '75%' });

        // Sport X is visited before country A, so a share computed during the traversal would read
        // the old country total of 40 and cache 225% instead of 75%.
        api.applyTransaction({ update: [{ id: '1', country: 'A', sport: 'X', gold: 90 }] });

        expect(groupCells(api, 'row-group-country-A')).toMatchObject({ gold: '120' });
        expect(groupCells(api, 'row-group-country-A-sport-X')).toMatchObject({ gold: '90', share: '75%' });
    });
});

/**
 * A spanned cell is owned by a controller the row renderer keeps apart from the indexed one, so a node
 * can be rendered twice. The post-edit sweep skips a node the edit flow claims to have refreshed, which
 * leaves the spanned copy stale unless that refresh really did reach every controller.
 */
describe('grouping aggregation: a spanned column derived from an aggregate', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, CellSpanModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('editing the first leaf of a span refreshes the spanned derived cell', async () => {
        const api = await gridsManager.createGridAndWait('span-derived', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                {
                    colId: 'share',
                    spanRows: true,
                    valueGetter: (params) => {
                        const total = params.node?.parent?.aggData?.gold;
                        return total ? `T${total}` : '';
                    },
                },
            ],
            enableCellSpan: true,
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', gold: 10 },
                { id: '2', country: 'A', gold: 30 },
            ],
        });

        const spanned = () =>
            [...document.querySelectorAll('#span-derived [col-id="share"]')]
                .map((cell) => cell.textContent?.trim())
                .filter((text) => text !== '');

        expect(spanned()).toEqual(['T40']);

        // The edited node is the span's owner, so it is the one the sweep is told to skip.
        api.getRowNode('1')!.setDataValue('gold', 70);

        await waitFor(() => expect(spanned()).toEqual(['T100']));
    });
});
