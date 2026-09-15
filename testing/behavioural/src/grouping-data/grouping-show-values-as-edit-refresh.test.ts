import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, NumberEditorModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

/**
 * A group row sits on the edited leaf's changed path, and showValuesAsSvc.refreshRenderedCellsExcept
 * skips those rows on the assumption endDeferred already refreshed them. Guards that assumption.
 */
describe('showValuesAs on a group row after an edit', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValuesAsModule, NumberEditorModule],
    });

    afterEach(() => gridsManager.reset());

    test('the group row transform follows a leaf edit', async () => {
        const api = await gridsManager.createGridAndWait('sva-edit-refresh', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', editable: true, aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 20 },
                { id: '3', country: 'B', amount: 50 },
            ],
        });

        const groupCell = (key: string) =>
            document.querySelector<HTMLElement>(
                `#sva-edit-refresh [row-id="row-group-country-${key}"] [col-id="amount"]`
            )!;

        // A = 50/100, B = 50/100.
        expect(groupCell('A')).toHaveTextContent('50.00%');
        expect(groupCell('B')).toHaveTextContent('50.00%');

        // A becomes 150 of a 200 grand total, so both group transforms move.
        api.getRowNode('1')!.setDataValue('amount', 130);

        await waitFor(() => expect(groupCell('A')).toHaveTextContent('75.00%'));
        expect(groupCell('B')).toHaveTextContent('25.00%');
    });
});
