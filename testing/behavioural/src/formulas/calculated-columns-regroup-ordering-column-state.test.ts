import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, nextAnimationFrame } from 'ag-test-utils';

import { enableDevValidations } from 'ag-grid-community';

import {
    LEAF_DEFS,
    countryAuto,
    createGrid,
    createRegroupGrid,
    gridsManager,
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

    test('columns added from an auto group column come back beside it after the current column state is applied with applyOrder', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, expected } = await createRegroupGrid(
                `regroup-apply-current-state-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            api.applyColumnState({ state: api.getColumnState(), applyOrder: true });
            expect({ maintainColumnOrder, step: 'applied', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'applied',
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

    test('columns added from an auto group column come back beside it after the grid state is set again from itself', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, expected } = await createRegroupGrid(
                `regroup-set-current-grid-state-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            api.setState(api.getState());
            await nextAnimationFrame();

            await regroup(api);
            expect({ maintainColumnOrder, order: order(api) }).toEqual({ maintainColumnOrder, order: expected });
        }
    });

    test('columns added from an auto group column come back beside it after a column state that only reorders the group columns', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, x2, expected } = await createRegroupGrid(
                `regroup-reorder-group-columns-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            const reordered = [countryAuto, regionAuto, x1, x2, 'region', 'country', 'revenue', 'cost'];
            api.applyColumnState({ state: reordered.map((colId) => ({ colId })), applyOrder: true });
            expect({ maintainColumnOrder, step: 'reordered', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'reordered',
                order: reordered,
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: expected,
            });
        }
    });

    test('columns added from an auto group column come back beside it after one is moved to the index it already has', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const { api, x1, expected } = await createRegroupGrid(
                `regroup-move-to-same-index-${maintainColumnOrder}`,
                maintainColumnOrder,
                LEAF_DEFS
            );

            api.moveColumns([x1], order(api).indexOf(x1));
            expect({ maintainColumnOrder, step: 'moved', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'moved',
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

    test('columns added from an auto group column come back beside it after a column state refused for splitting a married column group', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [39] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            for (const maintainColumnOrder of [false, true]) {
                gridsManager.reset();
                warnSpy.mockClear();
                const { api, x1, x2, expected } = await createRegroupGrid(
                    `regroup-refused-split-married-group-${maintainColumnOrder}`,
                    maintainColumnOrder,
                    [
                        { field: 'region', rowGroup: true, hide: true },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            headerName: 'G',
                            marryChildren: true,
                            children: [
                                { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
                                { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
                            ],
                        },
                    ]
                );

                const splitting = [regionAuto, x1, x2, 'revenue', countryAuto, 'region', 'country', 'cost'];
                api.applyColumnState({ state: splitting.map((colId) => ({ colId })), applyOrder: true });
                expect({
                    maintainColumnOrder,
                    step: 'refused',
                    order: order(api),
                    warned: warnSpy.mock.calls.flat().join(' ').includes('#39'),
                }).toEqual({ maintainColumnOrder, step: 'refused', order: expected, warned: true });

                await regroup(api);
                expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    step: 'regrouped',
                    order: expected,
                });
            }
        } finally {
            warnSpy.mockRestore();
        }
    });

    test('columns added from an auto group column that a column state moved together to the end stay there when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            gridsManager.reset();
            const api = createGrid(`regroup-block-moved-to-end-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const x2 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const added = [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'];
            expect({ maintainColumnOrder, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'added',
                order: added,
            });

            const others = order(api).filter((id) => id !== x1 && id !== x2);
            api.applyColumnState({ state: [...others, x2, x1].map((colId) => ({ colId })), applyOrder: true });
            expect({ maintainColumnOrder, step: 'moved', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'moved',
                order: [...others, x2, x1],
            });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: [regionAuto, countryAuto, 'region', 'country', 'revenue', 'cost', x2, x1],
            });
        }
    });

    test('a column state moving one of two columns added from an auto group column to the end leaves the other beside it when row grouping is cleared and set again, as a move does', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of ['api.moveColumns', 'applyColumnState with applyOrder'] as const) {
                gridsManager.reset();
                const api = createGrid(`regroup-one-of-two-moved-to-end-${arm}-${maintainColumnOrder}`, {
                    groupDisplayType: 'multipleColumns',
                    maintainColumnOrder,
                    rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                    columnDefs: LEAF_DEFS,
                });
                await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
                const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
                const x2 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
                expect({ maintainColumnOrder, arm, step: 'added', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'added',
                    order: [regionAuto, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
                });

                const expected = [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost', x2];
                if (arm === 'api.moveColumns') {
                    api.moveColumns([x2], order(api).length - 1);
                } else {
                    const withoutX2 = order(api).filter((id) => id !== x2);
                    api.applyColumnState({ state: [...withoutX2, x2].map((colId) => ({ colId })), applyOrder: true });
                }
                expect({ maintainColumnOrder, arm, step: 'moved', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'moved',
                    order: expected,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    order: expected,
                });
            }
        }
    });

    test('a column state moving one of three columns added from an auto group column to the end leaves the other two beside it when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            const api = createGrid(`regroup-one-of-three-moved-to-end-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const x2 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            const x3 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            expect({ maintainColumnOrder, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'added',
                order: [regionAuto, x3, x2, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
            });

            const withoutX2 = order(api).filter((id) => id !== x2);
            api.applyColumnState({ state: [...withoutX2, x2].map((colId) => ({ colId })), applyOrder: true });

            await regroup(api);
            expect({ maintainColumnOrder, step: 'regrouped', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'regrouped',
                order: [regionAuto, x3, x1, countryAuto, 'region', 'country', 'revenue', 'cost', x2],
            });
        }
    });

    test('a column state ordering columns between an auto group column and a column added from it keeps that column where the state put it when row grouping is cleared and set again', async () => {
        for (const maintainColumnOrder of [false, true]) {
            const api = createGrid(`regroup-column-between-source-and-added-${maintainColumnOrder}`, {
                groupDisplayType: 'multipleColumns',
                maintainColumnOrder,
                rowData: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 }],
                columnDefs: LEAF_DEFS,
            });
            await waitFor(() => expect(order(api)).toEqual(expect.arrayContaining([regionAuto, countryAuto])));
            const x1 = await addViaDialog(api, regionAuto, '[Revenue] - [Cost]');
            expect({ maintainColumnOrder, step: 'added', order: order(api) }).toEqual({
                maintainColumnOrder,
                step: 'added',
                order: [regionAuto, x1, countryAuto, 'region', 'country', 'revenue', 'cost'],
            });

            api.moveColumns(['revenue'], 1);
            const moved = order(api);
            expect({
                maintainColumnOrder,
                step: 'moved',
                revenue: moved.indexOf('revenue'),
                x1: moved.indexOf(x1),
            }).toEqual({
                maintainColumnOrder,
                step: 'moved',
                revenue: 1,
                x1: 2,
            });

            const withoutCost = moved.filter((id) => id !== 'cost');
            const costAfterRevenue = [...withoutCost];
            costAfterRevenue.splice(costAfterRevenue.indexOf('revenue') + 1, 0, 'cost');
            api.applyColumnState({ state: costAfterRevenue.map((colId) => ({ colId })), applyOrder: true });

            await regroup(api);
            const regrouped = order(api);
            expect({ maintainColumnOrder, x1Index: regrouped.indexOf(x1) }).toEqual({
                maintainColumnOrder,
                x1Index: regrouped.indexOf('cost') + 1,
            });
        }
    });

    test('a column state putting a column added from an auto group column one place after the next group column keeps it there when row grouping is cleared and set again, as a move does', async () => {
        for (const maintainColumnOrder of [false, true]) {
            for (const arm of ['api.moveColumns', 'applyColumnState with applyOrder'] as const) {
                gridsManager.reset();
                const api = createGrid(`regroup-after-next-group-column-${arm}-${maintainColumnOrder}`, {
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

                const expected = [regionAuto, countryAuto, x1, 'region', 'country', 'revenue', 'cost'];
                if (arm === 'api.moveColumns') {
                    api.moveColumns([x1], 2);
                } else {
                    api.applyColumnState({ state: expected.map((colId) => ({ colId })), applyOrder: true });
                }
                expect({ maintainColumnOrder, arm, step: 'moved', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'moved',
                    order: expected,
                });

                await regroup(api);
                expect({ maintainColumnOrder, arm, step: 'regrouped', order: order(api) }).toEqual({
                    maintainColumnOrder,
                    arm,
                    step: 'regrouped',
                    order: expected,
                });
            }
        }
    });
});
