import { waitFor } from '@testing-library/dom';

import type { ColDef } from 'ag-grid-community';

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
} from './calculatedColumnsRegroupHarness';
import { addViaDialog, order } from './calculatedColumnsStateHarness';

describe('calculated columns - placement after row grouping is cleared and set again', () => {
    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('two columns added from an auto group column and swapped with each other by api.moveColumns come back beside it in the swapped order when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, x2 } = await createRegroupGrid(
                `regroup-swap-added-move-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            const swapped = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            api.moveColumns([x2], 1);
            expect({ maintainColumnOrder, step: 'swapped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'swapped',
                order: swapped,
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: swapped,
            });
        }
    });

    test('two columns added from an auto group column and swapped with each other by a column state with applyOrder come back beside it in the swapped order when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, x2 } = await createRegroupGrid(
                `regroup-swap-added-state-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            const swapped = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            api.applyColumnState({ state: swapped.map((colId) => ({ colId })), applyOrder: true });
            expect({ maintainColumnOrder, step: 'swapped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'swapped',
                order: swapped,
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: swapped,
            });
        }
    });

    test('a column added from an auto group column moved away and moved back beside it comes back beside it when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, expected } = await createRegroupGrid(
                `regroup-moved-away-and-back-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            api.moveColumns([x1], order(api).length - 1);
            expect({ maintainColumnOrder, step: 'moved away', last: order(api).at(-1) }).toEqual({
                maintainColumnOrder,
                step: 'moved away',
                last: x1,
            });

            api.moveColumns([x1], 1);
            expect({ maintainColumnOrder, step: 'moved back', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'moved back',
                order: expected,
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: expected,
            });
        }
    });

    test('a column added from an auto group column moved back beside it, past a calculated column declared in columnDefs, comes back beside it when row grouping is cleared and set again, whether api.moveColumns or a column state with applyOrder moved it', async () => {
        const declaredDef: ColDef = {
            colId: 'declared',
            headerName: 'Declared',
            calculatedExpression: '[revenue] + [cost]',
        };
        for (const maintainColumnOrder of [false, true]) {
            const regroupedByArm: string[][] = [];
            for (const arm of MOVE_ARMS) {
                gridsManager.reset();
                const api = createGrid(`regroup-declared-between-${arm}-${maintainColumnOrder}`, {
                    groupDisplayType: 'multipleColumns',
                    maintainColumnOrder,
                    rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                    columnDefs: [...LEAF_DEFS, declaredDef],
                });
                await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));

                api.moveColumns(['declared'], 1);
                expect({ maintainColumnOrder, arm, step: 'declared placed', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'declared placed',
                    order: [regionAuto, 'declared', countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
                expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'added',
                    order: [regionAuto, x1, 'declared', countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                api.moveColumns([x1], 2);
                expect({ maintainColumnOrder, arm, step: 'x1 moved after declared', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved after declared',
                    order: [regionAuto, 'declared', x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                const x1Back = [regionAuto, x1, 'declared', countryAuto, 'region', 'country', 'revenue', 'cost'];
                moveColumn(api, arm, x1, 1, x1Back);
                expect({ maintainColumnOrder, arm, step: 'x1 moved back', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved back',
                    order: x1Back,
                });

                await regroup(api);
                const regrouped = order(api);
                regroupedByArm.push(regrouped);
                // the recreated auto group columns are placed apart from the declared column; x1 follows its own
                expect({ maintainColumnOrder, arm, step: 'regrouped', besideAuto: regrouped.indexOf(x1) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    besideAuto: regrouped.indexOf(regionAuto) + 1,
                });
            }
            expect({ maintainColumnOrder, state: regroupedByArm[1] }).toEqual({
                maintainColumnOrder,
                state: regroupedByArm[0],
            });
        }
    });

    test('a column added from one added from an auto group column and moved beside it comes back beside it when row grouping is cleared and set again, unless an ordered column state left it away from it', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of MOVE_ARMS) {
                gridsManager.reset();
                const { api, x1, x2, expected } = await createRegroupGrid(
                    `regroup-chain-moved-beside-source-${arm}-${maintainColumnOrder}`,
                    maintainColumnOrder,
                    LEAF_DEFS
                );

                const x1Last = [regionAuto, x2, countryAuto, 'region', 'country', 'revenue', 'cost', x1];
                moveColumn(api, arm, x1, order(api).length - 1, x1Last);
                expect({ maintainColumnOrder, arm, step: 'x1 moved last', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved last',
                    order: x1Last,
                });

                const x2AfterX1 = [regionAuto, countryAuto, 'region', 'country', 'revenue', 'cost', x1, x2];
                moveColumn(api, arm, x2, order(api).length - 1, x2AfterX1);
                expect({ maintainColumnOrder, arm, step: 'x2 moved beside x1', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x2 moved beside x1',
                    order: x2AfterX1,
                });

                const x1Back = [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost', x2];
                moveColumn(api, arm, x1, 1, x1Back);
                expect({ maintainColumnOrder, arm, step: 'x1 moved back', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved back',
                    order: x1Back,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    // the last state left x2 away from x1; the last move was of x1 alone
                    order: arm === 'api.moveColumns' ? expected : x1Back,
                });
            }
        }
    });

    test('a column added from one added from an auto group column and never moved comes back beside the auto group column when row grouping is cleared and set again, while the one it was added from stays where it was moved', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of MOVE_ARMS) {
                gridsManager.reset();
                const { api, x1, x2 } = await createRegroupGrid(
                    `regroup-chain-source-moved-away-${arm}-${maintainColumnOrder}`,
                    maintainColumnOrder,
                    LEAF_DEFS
                );

                const x1Last = [regionAuto, x2, countryAuto, 'region', 'country', 'revenue', 'cost', x1];
                moveColumn(api, arm, x1, order(api).length - 1, x1Last);
                expect({ maintainColumnOrder, arm, step: 'x1 moved last', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'x1 moved last',
                    order: x1Last,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    order: x1Last,
                });
            }
        }
    });
});
