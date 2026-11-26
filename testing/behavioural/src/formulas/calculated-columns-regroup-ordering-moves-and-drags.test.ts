import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import {
    LEAF_DEFS,
    MOVE_ARMS,
    countryAuto,
    createGrid,
    createRegroupGrid,
    gridsManager,
    moveColumn,
    regionAuto,
    regroup,
    settle,
} from './calculatedColumnsRegroupHarness';
import { addViaDialog, order } from './calculatedColumnsStateHarness';

describe('calculated columns - placement after row grouping is cleared and set again', () => {
    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test("a column added from an auto group column moved past another source's added column stays there when row grouping is cleared and set again, whether api.moveColumns or a column state with applyOrder put it there", async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of MOVE_ARMS) {
                gridsManager.reset();
                const api = createGrid(`regroup-moved-past-other-source-${arm}-${maintainColumnOrder}`, {
                    groupDisplayType: 'multipleColumns',
                    maintainColumnOrder,
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
                expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'added',
                    order: [regionAuto, x1, 'region', 'country', 'revenue', y1, 'cost'],
                });

                api.moveColumns([y1], 1);
                expect({ maintainColumnOrder, arm, step: 'y1 moved', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'y1 moved',
                    order: [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'],
                });

                // x1 already follows y1: move it away and back so the place is one the user gave it.
                api.moveColumns([x1], order(api).length - 1);
                expect({ maintainColumnOrder, arm, step: 'x1 moved last', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved last',
                    order: [regionAuto, y1, 'region', 'country', 'revenue', 'cost', x1],
                });
                const placed = [regionAuto, y1, x1, 'region', 'country', 'revenue', 'cost'];
                moveColumn(api, arm, x1, 2, placed);
                expect({ maintainColumnOrder, arm, step: 'x1 placed after y1', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 placed after y1',
                    order: placed,
                });

                api.setRowGroupColumns([]);
                await waitFor(() => expect(order(api)).not.toContain(regionAuto));
                await settle();
                api.setRowGroupColumns(['region']);
                await waitFor(() => expect(order(api)).toContain(regionAuto));
                await settle();
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    order: placed,
                });
            }
        }
    });

    test('a column state putting a column added from an auto group column before it places it as a move does when row grouping is cleared and set again', async () => {
        async function run(arm: 'move' | 'state', maintainColumnOrder: boolean) {
            gridsManager.reset();
            const api = createGrid(`regroup-before-source-${arm}-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
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

        for (const maintainColumnOrder of [false, true]) {
            const move = await run('move', maintainColumnOrder);
            const state = await run('state', maintainColumnOrder);
            const placed = (x1: string) => ({
                afterCall: ['region', x1, regionAuto, countryAuto, 'country', 'revenue', 'cost'],
                regrouped: [regionAuto, countryAuto, 'region', x1, 'country', 'revenue', 'cost'],
            });
            expect({
                maintainColumnOrder,
                move: { afterCall: move.afterCall, regrouped: move.regrouped },
                state: { afterCall: state.afterCall, regrouped: state.regrouped },
            }).toEqual({ maintainColumnOrder, move: placed(move.x1), state: placed(state.x1) });
        }
    });

    test('columns added from an auto group column come back beside it when row grouping is cleared and set again after the auto group column itself was moved past the next one, unless an ordered column state moved it', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of MOVE_ARMS) {
                gridsManager.reset();
                const { api, x1, x2, expected } = await createRegroupGrid(
                    `regroup-auto-column-moved-${arm}-${maintainColumnOrder}`,
                    maintainColumnOrder,
                    LEAF_DEFS
                );

                const autoMoved = [x1, x2, countryAuto, regionAuto, 'region', 'country', 'revenue', 'cost'];
                moveColumn(api, arm, regionAuto, 3, autoMoved);
                expect({ maintainColumnOrder, arm, step: 'auto group column moved', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'auto group column moved',
                    order: autoMoved,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    // the state left x1 and x2 away from the auto group column: they stay after the group columns
                    order:
                        arm === 'api.moveColumns'
                            ? expected
                            : [regionAuto, countryAuto, x1, x2, 'region', 'country', 'revenue', 'cost'],
                });
            }
        }
    });

    test('a column added from an auto group column moved away comes back beside it when the pivot result columns reset the order to the definitions, and stays beside it when row grouping is cleared and set again; with maintainColumnOrder it stays where it was moved', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, x2, expected } = await createRegroupGrid(
                `regroup-moved-then-pivot-result-columns-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            const x1Last = [regionAuto, x2, countryAuto, 'region', 'country', 'revenue', 'cost', x1];
            api.moveColumns([x1], order(api).length - 1);
            expect({ maintainColumnOrder, step: 'x1 moved last', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'x1 moved last',
                order: x1Last,
            });

            const settled = maintainColumnOrder ? x1Last : expected;
            api.setPivotResultColumns([{ colId: 'pivotResult', field: 'revenue' }]);
            expect({ maintainColumnOrder, step: 'pivot result columns set', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'pivot result columns set',
                order: settled,
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: settled,
            });
        }
    });

    // Drags the header of colId from its centre through `[colId, fraction of its width]` positions, dropping on the
    // last; returns the column order after each move.
    async function dragHeaderThrough(api: GridApi, colId: string, through: [string, number][]): Promise<string[][]> {
        const displayed = api.getAllDisplayedColumns();
        const xOf = (target: string, fraction: number) => {
            let left = 0;
            for (const col of displayed) {
                if (col.getColId() === target) {
                    return left + col.getActualWidth() * fraction;
                }
                left += col.getActualWidth();
            }
            throw new Error(`column not displayed: ${target}`);
        };
        const grid = getGridElement(api);
        const source = grid?.querySelector(`.ag-header-cell[col-id="${colId}"]`);
        const viewport = grid?.querySelector('.ag-grid-viewport');
        if (!source || !viewport) {
            throw new Error(`header or viewport not found for ${colId}`);
        }
        const y = 100; // inside the body viewport rect (below the header)
        const seen: string[][] = [];
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        try {
            await dispatcher.startDrag(source, xOf(colId, 0.5), y);
            await dispatcher.movePointer(viewport, xOf(colId, 0.5), y);
            for (const [target, fraction] of through) {
                await dispatcher.movePointer(viewport, xOf(target, fraction), y);
                seen.push(order(api));
            }
            await dispatcher.finishDrag(viewport);
        } finally {
            dispatcher.reset();
        }
        return seen;
    }

    test('a column added from an auto group column dragged by its header off its place and back to it in one drag comes back beside it when row grouping is cleared and set again, as one never dragged', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const twin = await createRegroupGrid(
                `regroup-drag-away-and-back-twin-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );
            await regroup(twin.api);
            const neverDragged = order(twin.api);
            expect({ maintainColumnOrder, step: 'twin regrouped', order: neverDragged }).toEqual({
                maintainColumnOrder,
                step: 'twin regrouped',
                order: twin.expected,
            });

            gridsManager.reset();
            const { api, x1, x2, expected } = await createRegroupGrid(
                `regroup-drag-away-and-back-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );
            expect({ maintainColumnOrder, step: 'same start', order: expected }).toEqual({
                maintainColumnOrder,
                step: 'same start',
                order: twin.expected,
            });

            const seen = await dragHeaderThrough(api, x1, [
                ['revenue', 0.5],
                [x2, 0.5],
                [x1, 0.5],
            ]);
            expect({ maintainColumnOrder, step: 'moved away mid-drag', beside: seen[0].indexOf(x1) === 1 }).toEqual({
                maintainColumnOrder,
                step: 'moved away mid-drag',
                beside: false,
            });
            await waitFor(() => expect(order(api)).toEqual(expected));

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: neverDragged,
            });
        }
    });

    test('a column added from an auto group column dragged by its header to a different place keeps that place when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, x2 } = await createRegroupGrid(
                `regroup-drag-to-other-place-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            await dragHeaderThrough(api, x1, [
                ['revenue', 0.5],
                [x2, 0.9],
            ]);
            const swapped = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            await waitFor(() => expect(order(api)).toEqual(swapped));

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: swapped,
            });
        }
    });

    test('moveColumns with a negative index places a column from the end, with calculated columns added', async () => {
        const { api, x1, x2 } = await createRegroupGrid('regroup-negative-index', false, LEAF_DEFS);

        api.moveColumns(['cost'], -1);

        expect(order(api)).toEqual([regionAuto, x1, x2, countryAuto, 'region', 'country', 'cost', 'revenue']);
    });

    test('moveColumns with a negative index moving two calculated columns keeps both where it put them when row grouping is cleared and set again', async () => {
        const { api, x1, x2 } = await createRegroupGrid('regroup-negative-index-two', false, LEAF_DEFS);

        // each column is inserted at the same index from the end, so the two land reversed
        api.moveColumns([x1, x2], -1);
        const moved = [regionAuto, countryAuto, 'region', 'country', 'revenue', x2, x1, 'cost'];
        expect({ step: 'moved', order: order(api) }).toEqual({ step: 'moved', order: moved });

        await regroup(api);
        expect({ step: 'regrouped', order: order(api) }).toEqual({ step: 'regrouped', order: moved });
    });

    test('moveColumns with a fractional index places a calculated column at its whole part, and keeps it there when row grouping is cleared and set again', async () => {
        const { api, x1, x2 } = await createRegroupGrid('regroup-fractional-index', false, LEAF_DEFS);

        api.moveColumns([x1], 5.5);
        const moved = [regionAuto, x2, countryAuto, 'region', 'country', x1, 'revenue', 'cost'];
        expect({ step: 'moved', order: order(api) }).toEqual({ step: 'moved', order: moved });

        await regroup(api);
        expect({ step: 'regrouped', order: order(api) }).toEqual({ step: 'regrouped', order: moved });
    });
    test('a move with a fractional or negative index that changes no order leaves a placed column placed, as no move would', async () => {
        const run = async (noOpMove: number | null) => {
            gridsManager.reset();
            const api = createGrid(`regroup-no-op-move-${noOpMove}`, {
                groupDisplayType: 'multipleColumns',
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
            // placed by the user, then back at its seat by moving the others: still placed
            api.moveColumns([x1], 5);
            api.moveColumns(['region', 'country', 'revenue', 'cost'], 2);
            expect(order(api)).toEqual([regionAuto, x1, 'region', 'country', 'revenue', 'cost']);
            if (noOpMove !== null) {
                api.moveColumns([x1], noOpMove);
                expect(order(api)).toEqual([regionAuto, x1, 'region', 'country', 'revenue', 'cost']);
            }
            api.moveColumns([regionAuto], 5);
            await regroup(api);
            return order(api).map((id) => (id === x1 ? 'x1' : id));
        };
        const unmoved = await run(null);
        expect({ fractional: await run(1.5), negative: await run(-4) }).toEqual({
            fractional: unmoved,
            negative: unmoved,
        });
    });
});
