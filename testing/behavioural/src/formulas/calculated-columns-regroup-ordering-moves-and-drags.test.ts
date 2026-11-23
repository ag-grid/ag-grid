import { waitFor } from '@testing-library/dom';

import {
    LEAF_DEFS,
    MOVE_ARMS,
    countryAuto,
    createGrid,
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
});
