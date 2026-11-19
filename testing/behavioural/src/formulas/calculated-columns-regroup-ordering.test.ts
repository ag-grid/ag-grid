import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

import { addViaDialog, order } from './calculatedColumnsStateHarness';

// Where calculated columns added from an auto group column sit when row grouping is cleared and set again.

describe('calculated columns - placement after row grouping is cleared and set again', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            CalculatedColumnsModule,
            FormulaModule,
            ColumnMenuModule,
            ContextMenuModule,
            PivotModule,
            RowGroupingModule,
            RowNumbersModule,
            TextEditorModule,
            NumberEditorModule,
            ValidationModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
        return gridsManager.createGrid(id, {
            getRowId: (params) => params.data?.id,
            calculatedColumns: true,
            ...opts,
        });
    }

    const regionAuto = 'ag-Grid-AutoColumn-region';
    const countryAuto = 'ag-Grid-AutoColumn-country';

    const LEAF_DEFS: ColDef[] = [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
        { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
    ];

    // A reaction to the auto group columns changing may land on a frame or a later task.
    async function settle(): Promise<void> {
        await nextAnimationFrame();
        await asyncSetTimeout(0);
    }

    async function regroup(api: GridApi): Promise<void> {
        api.setRowGroupColumns([]);
        await waitFor(() => expect(order(api).some((id) => id.startsWith('ag-Grid-AutoColumn'))).toBe(false));
        await settle();
        api.setRowGroupColumns(['region', 'country']);
        await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
        await settle();
    }

    test.each([{ maintainColumnOrder: false }, { maintainColumnOrder: true }])(
        'columns added from an auto group column that a column state moved together to the end stay there when row grouping is cleared and set again (maintainColumnOrder $maintainColumnOrder)',
        async (row) => {
            const api = createGrid('regroup-block-moved-to-end', {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder: row.maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const x2 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const added = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            expect({ step: 'added', order: order(api) }).toEqual({ step: 'added', order: added });

            const others = order(api).filter((id) => id !== x1 && id !== x2);
            api.applyColumnState({ state: [...others, x2, x1].map((colId) => ({ colId })), applyOrder: true });
            expect({ step: 'moved', order: order(api) }).toEqual({ step: 'moved', order: [...others, x2, x1] });

            await regroup(api);
            expect({ step: 'regrouped', order: order(api) }).toEqual({
                step: 'regrouped',
                order: [regionAuto, countryAuto, 'region', 'country', 'revenue', 'cost', x2, x1],
            });
        }
    );

    test.each([
        { maintainColumnOrder: false, arm: 'api.moveColumns' },
        { maintainColumnOrder: false, arm: 'applyColumnState with applyOrder' },
        { maintainColumnOrder: true, arm: 'api.moveColumns' },
        { maintainColumnOrder: true, arm: 'applyColumnState with applyOrder' },
    ] as const)(
        'a column state putting a column added from an auto group column one place after the next group column keeps it there when row grouping is cleared and set again, as a move does (maintainColumnOrder $maintainColumnOrder, $arm)',
        async ({ maintainColumnOrder, arm }) => {
            const api = createGrid('regroup-after-next-group-column', {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            expect({ step: 'added', order: order(api) }).toEqual({
                step: 'added',
                order: [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
            });

            const expected = [regionAuto, countryAuto, x1, 'region', 'country', 'revenue', 'cost'];
            if (arm === 'api.moveColumns') {
                api.moveColumns([x1], 2);
            } else {
                api.applyColumnState({ state: expected.map((colId) => ({ colId })), applyOrder: true });
            }
            expect({ step: 'moved', order: order(api) }).toEqual({ step: 'moved', order: expected });

            await regroup(api);
            expect({ step: 'regrouped', order: order(api) }).toEqual({ step: 'regrouped', order: expected });
        }
    );

    test.each([{ maintainColumnOrder: false }, { maintainColumnOrder: true }])(
        "a column added from an auto group column moved past another source's added column stays there when row grouping is cleared and set again (maintainColumnOrder $maintainColumnOrder)",
        async (row) => {
            const api = createGrid('regroup-moved-past-other-source', {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder: row.maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', hide: true },
                    { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                    { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
                ],
            });
            await waitFor(() => expect(order(api)).toContain(regionAuto));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const y1 = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
            expect({ step: 'added', order: order(api) }).toEqual({
                step: 'added',
                order: [regionAuto, x1, 'region', 'country', 'revenue', y1, 'cost'],
            });

            api.moveColumns([y1], 1);
            expect({ step: 'y1 moved', order: order(api) }).toEqual({
                step: 'y1 moved',
                order: [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'],
            });

            // x1 already follows y1: move it away and back so the place is one the user gave it.
            api.moveColumns([x1], order(api).length - 1);
            expect({ step: 'x1 moved last', order: order(api) }).toEqual({
                step: 'x1 moved last',
                order: [regionAuto, y1, 'region', 'country', 'revenue', 'cost', x1],
            });
            api.moveColumns([x1], 2);
            const placed = [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'];
            expect({ step: 'x1 placed after y1', order: order(api) }).toEqual({
                step: 'x1 placed after y1',
                order: placed,
            });

            api.setRowGroupColumns([]);
            await waitFor(() => expect(order(api)).not.toContain(regionAuto));
            await settle();
            api.setRowGroupColumns(['region']);
            await waitFor(() => expect(order(api)).toContain(regionAuto));
            await settle();
            expect({ step: 'regrouped', order: order(api) }).toEqual({ step: 'regrouped', order: placed });
        }
    );

    test.each([{ maintainColumnOrder: false }, { maintainColumnOrder: true }])(
        'a column state putting a column added from an auto group column before it places it as a move does when row grouping is cleared and set again (maintainColumnOrder $maintainColumnOrder)',
        async (row) => {
            async function run(arm: 'move' | 'state') {
                gridsManager.reset();
                const api = createGrid(`regroup-before-source-${arm}`, {
                    groupDisplayType: 'multipleColumns',
                    maintainColumnOrder: row.maintainColumnOrder,
                    rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                    columnDefs: LEAF_DEFS,
                });
                await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
                const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
                expect({ arm, step: 'added', order: order(api) }).toEqual({
                    arm,
                    step: 'added',
                    order: [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                // x1 follows the region leaf, a place an unmoved column does not reach after regrouping.
                if (arm === 'move') {
                    api.moveColumns(['region'], 0);
                    api.moveColumns([x1], 1);
                } else {
                    const state = ['region', x1, regionAuto, countryAuto, 'country', 'revenue', 'cost'];
                    api.applyColumnState({ state: state.map((colId) => ({ colId })), applyOrder: true });
                }
                const afterCall = order(api);

                await regroup(api);
                return { x1, afterCall, regrouped: order(api) };
            }

            const move = await run('move');
            const state = await run('state');
            const placed = (x1: string) => ({
                afterCall: ['region', x1, regionAuto, countryAuto, 'country', 'revenue', 'cost'],
                regrouped: [regionAuto, countryAuto, 'region', x1, 'country', 'revenue', 'cost'],
            });
            expect({
                move: { afterCall: move.afterCall, regrouped: move.regrouped },
                state: { afterCall: state.afterCall, regrouped: state.regrouped },
            }).toEqual({ move: placed(move.x1), state: placed(state.x1) });
        }
    );
});
