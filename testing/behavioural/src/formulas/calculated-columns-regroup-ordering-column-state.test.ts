import { waitFor } from '@testing-library/dom';

import {
    LEAF_DEFS,
    countryAuto,
    createGrid,
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
