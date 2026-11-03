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

    const rowData = [
        { id: 'null', d: null },
        { id: 'empty', d: '' },
        { id: 'jan', d: '2024-01-15' },
        { id: 'mar', d: '2024-03-20' },
    ];

    async function expectDisplayedIds(type: 'blank' | 'notBlank', expected: string[]): Promise<void> {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'id' }, { field: 'd', cellDataType: 'dateString' }],
            rowData,
            enableAdvancedFilter: true,
            getRowId: (p) => p.data.id,
        });
        api.setAdvancedFilterModel({ filterType: 'dateString', colId: 'd', type } as AdvancedFilterModel);
        await waitFor(() => {
            const ids: string[] = [];
            api.forEachNodeAfterFilter((n) => ids.push(n.data.id));
            expect(ids).toEqual(expected);
        });
    }

    test('blank shows the rows with no date', async () => {
        await expectDisplayedIds('blank', ['null', 'empty']);
    });

    test('notBlank shows the rows with a date', async () => {
        await expectDisplayedIds('notBlank', ['jan', 'mar']);
    });
});
