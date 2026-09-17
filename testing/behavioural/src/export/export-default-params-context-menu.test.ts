/**
 * A context-menu export reports `source: 'contextMenu'` to the `getDefault*ExportParams` callbacks.
 *
 * All three formats are driven through the real menu: a subclass may implement `export(userParams)`
 * against `export(userParams, source)` without a type error, so a dropped `source` in one creator is
 * invisible to the compiler.
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, clickMenuOption, objectUrls, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';

import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule, PdfExportModule } from 'ag-grid-enterprise';

describe('export default params callback from the context menu', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ContextMenuModule, CsvExportModule, ExcelExportModule, PdfExportModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'country' }];
    const rowData = [{ athlete: 'Amy', country: 'UK' }];

    let restoreOffsetParent: (() => void) | undefined;
    const originalBlobArrayBuffer = (Blob.prototype as any).arrayBuffer;

    beforeEach(() => {
        gridsManager.reset();
        objectUrls.init();
        if (typeof (Blob.prototype as any).arrayBuffer !== 'function') {
            (Blob.prototype as any).arrayBuffer = function (this: Blob) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsArrayBuffer(this);
                });
            };
        }
    });

    afterEach(() => {
        gridsManager.reset();
        objectUrls.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        (Blob.prototype as any).arrayBuffer = originalBlobArrayBuffer;
    });

    const createGrid = async (id: string, options: Partial<GridOptions>): Promise<GridApi> => {
        const api = await gridsManager.createGridAndWait(id, {
            columnDefs,
            rowData,
            getContextMenuItems: () => ['export'],
            ...options,
        });
        restoreOffsetParent = polyfillOffsetParent();
        return api;
    };

    const openExportSubMenu = async (api: GridApi): Promise<void> => {
        api.showContextMenu({
            rowNode: api.getDisplayedRowAtIndex(0),
            column: api.getColumn('athlete'),
            value: 'Amy',
            source: 'ui',
        });
        // The submenu is built on hover of the parent entry; a click alone never renders the leaves.
        await userEvent.hover(await openMenuOption('Export'));
    };

    test('CSV export reports source contextMenu', async () => {
        const seen: string[] = [];
        const api = await createGrid('csv-context-menu', {
            getDefaultCsvExportParams: (params) => {
                seen.push(params.source);
                return {};
            },
        });

        await openExportSubMenu(api);
        await clickMenuOption('CSV Export');

        await waitFor(() => expect(seen).toEqual(['contextMenu']));
    });

    test('Excel export reports source contextMenu', async () => {
        const seen: string[] = [];
        const api = await createGrid('excel-context-menu', {
            getDefaultExcelExportParams: (params) => {
                seen.push(params.source);
                return {};
            },
        });

        await openExportSubMenu(api);
        await clickMenuOption('Excel Export');

        await waitFor(() => expect(seen).toEqual(['contextMenu']));
    });

    test('PDF export reports source contextMenu', async () => {
        const seen: string[] = [];
        const api = await createGrid('pdf-context-menu', {
            getDefaultPdfExportParams: (params) => {
                seen.push(params.source);
                return {};
            },
        });

        await openExportSubMenu(api);
        await clickMenuOption('PDF Export');

        await waitFor(() => expect(seen).toEqual(['contextMenu']));
    });
});
