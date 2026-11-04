/**
 * Issue: on a `dateString` column, the Advanced Filter's "is blank" / "is not blank" conditions are reported not
 * to filter correctly.
 *
 * Setup: a column with `cellDataType: 'dateString'`, with rows holding `null`, an empty string and valid
 * `yyyy-mm-dd` strings, and `enableAdvancedFilter: true`. The model is set with `setAdvancedFilterModel` using
 * `type: 'blank'` and `type: 'notBlank'`.
 *
 * Expected: the Advanced Filter docs (column conditions page) list `blank` and `notBlank` as supported for
 * `dateString`. `blank` should keep the rows with no value (`null` and empty string) and `notBlank` the rows
 * that have a date.
 *
 * Actual: reported that the conditions return all rows or none, while `equals` works.
 *
 * Reported on: react 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search (React 35.1.0, March 2026): "advanced
 * filter dateString blank notBlank works equals not working".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { AdvancedFilterModel, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

describe('Advanced Filter blank and notBlank on a dateString column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, DateFilterModule, AdvancedFilterModule],
    });

    afterEach(() => gridsManager.reset());

    async function expectFilteredValues(type: 'blank' | 'notBlank', expected: Array<string | null>): Promise<void> {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'd', cellDataType: 'dateString' }],
            rowData: [{ d: null }, { d: '' }, { d: '2024-01-15' }],
            enableAdvancedFilter: true,
        });
        api.setAdvancedFilterModel({ filterType: 'dateString', colId: 'd', type } as AdvancedFilterModel);
        await waitFor(() => {
            const values: Array<string | null> = [];
            api.forEachNodeAfterFilter((n) => values.push(n.data.d));
            expect(values).toEqual(expected);
        });
    }

    test('blank shows the rows with no date', async () => {
        await expectFilteredValues('blank', [null, '']);
    });

    test('notBlank shows the rows with a date', async () => {
        await expectFilteredValues('notBlank', ['2024-01-15']);
    });
});
