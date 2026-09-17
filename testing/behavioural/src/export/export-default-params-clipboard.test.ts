/**
 * Boundaries of `getDefaultCsvExportParams`: the clipboard bypasses default resolution entirely, and a
 * suppressed export never reaches the callback.
 *
 * The clipboard probe is `prependContent`, one of the few params `clipboardService` does not set itself —
 * a param it does set would be overridden anyway, so the copied text would match even if the bypass broke.
 */
import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, clipboardUtils } from 'ag-test-utils';

import { ClientSideRowModelModule, CsvExportModule, enableDevValidations } from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

describe('export default params callback and the clipboard', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ClipboardModule, CellSelectionModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'country' }];
    const rowData = [{ athlete: 'Amy', country: 'UK' }];

    beforeEach(() => {
        gridsManager.reset();
        clipboardUtils.init();
    });

    afterEach(() => {
        gridsManager.reset();
        clipboardUtils.reset();
    });

    test('copyToClipboard does not resolve the CSV export defaults', async () => {
        let invoked = 0;
        const api = await gridsManager.createGridAndWait('clipboard-bypasses-defaults', {
            columnDefs,
            rowData,
            cellSelection: true,
            getDefaultCsvExportParams: () => {
                invoked++;
                return { prependContent: 'LEAKED' };
            },
        });

        api.setFocusedCell(0, 'athlete');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['athlete', 'country'] });
        api.copyToClipboard();

        await waitFor(() => expect(clipboardUtils.getText()).toBe('Amy\tUK'));
        expect(clipboardUtils.getText()).not.toContain('LEAKED');
        expect(invoked).toBe(0);
    });

    test('a suppressed export never reaches the callback, but getDataAsCsv still does', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [51] });
        let invoked = 0;
        const api = await gridsManager.createGridAndWait('suppressed-csv-export', {
            columnDefs,
            rowData,
            suppressCsvExport: true,
            getDefaultCsvExportParams: () => {
                invoked++;
                return {};
            },
        });

        api.exportDataAsCsv();
        expect(invoked).toBe(0);

        api.getDataAsCsv();
        expect(invoked).toBe(1);
    });
});
