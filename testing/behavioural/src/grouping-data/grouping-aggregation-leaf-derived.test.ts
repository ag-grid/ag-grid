import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

/**
 * A leaf's own data is untouched by aggregation, but a getter reading the parent's total is not: the
 * share moves when a sibling changes. Pins that the post-aggregation refresh reaches leaf rows.
 */
describe('grouping aggregation: a leaf column derived from its parent total', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('a sibling changing the group total refreshes the untouched leaf', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('leaf-derived', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                {
                    colId: 'share',
                    valueGetter: (params) => {
                        const total = params.node?.parent?.aggData?.gold;
                        const value = params.data?.gold;
                        return total && value != null ? `${Math.round((value / total) * 100)}%` : '';
                    },
                },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', gold: 10 },
                { id: '2', country: 'A', gold: 30 },
            ],
        });

        const shareOf = (id: string) =>
            getGridElement(api)!.querySelector(`[row-id="${id}"] [col-id="share"]`)!.textContent?.trim();

        expect(shareOf('1')).toBe('25%');

        // Row 1's own gold is untouched; only its sibling moves, taking the group total 40 → 100.
        api.applyTransaction({ update: [{ id: '2', country: 'A', gold: 90 }] });

        await waitFor(() => expect(shareOf('1')).toBe('10%'));
    });

    // The edit path re-aggregates through endDeferred, which refreshes the edited node and its
    // ancestors — an untouched sibling reading the same parent total is in neither set.
    test('a sibling edited in place refreshes the untouched leaf', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('leaf-derived-edit', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                {
                    colId: 'share',
                    valueGetter: (params) => {
                        const total = params.node?.parent?.aggData?.gold;
                        const value = params.data?.gold;
                        return total && value != null ? `${Math.round((value / total) * 100)}%` : '';
                    },
                },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', gold: 10 },
                { id: '2', country: 'A', gold: 30 },
            ],
        });

        const shareOf = (id: string) =>
            document.querySelector(`#leaf-derived-edit [row-id="${id}"] [col-id="share"]`)!.textContent?.trim();

        expect(shareOf('1')).toBe('25%');

        api.getRowNode('2')!.setDataValue('gold', 90);

        await waitFor(() => expect(shareOf('1')).toBe('10%'));
    });
});
