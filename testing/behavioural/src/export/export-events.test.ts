import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout, objectUrls } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule } from 'ag-grid-enterprise';

describe('export start and end events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, ContextMenuModule],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = async (gridOptions: GridOptions = {}) => {
        const calls: string[] = [];
        const events: any[] = [];
        const api = await gridsManager.createGridAndWait('export-events', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'John' }],
            ...gridOptions,
            onExportStart: (event) => {
                calls.push('start');
                events.push(event);
            },
            onExportEnd: (event) => {
                calls.push('end');
                events.push(event);
            },
        });
        return { api, calls, events };
    };

    test('csv export from the api fires start synchronously, then end with the file name', async () => {
        const { api, calls, events } = await createGrid();

        const exported = api.exportDataAsCsv();
        expect(calls).toEqual(['start']);
        expect(events[0]).toMatchObject({ type: 'exportStart', format: 'csv', source: 'api' });

        await exported;
        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({
            type: 'exportEnd',
            format: 'csv',
            source: 'api',
            success: true,
            fileName: 'export.csv',
        });
        expect(events[1].api).toBe(api);
    });

    test('excel export from the api fires start then end with the file name', async () => {
        const { api, calls, events } = await createGrid();

        const exported = api.exportDataAsExcel({ fileName: 'athletes.xlsx' });
        expect(calls).toEqual(['start']);
        expect(events[0]).toMatchObject({ format: 'excel', source: 'api' });

        await exported;
        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({ format: 'excel', source: 'api', success: true, fileName: 'athletes.xlsx' });
    });

    test('multi sheet excel export fires start then end', async () => {
        const { api, calls, events } = await createGrid();

        const sheet = api.getSheetDataForExcel()!;

        const exported = api.exportMultipleSheetsAsExcel({ data: [sheet], fileName: 'sheets.xlsx' });
        expect(calls).toEqual(['start']);

        await exported;
        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({ format: 'excel', source: 'api', success: true, fileName: 'sheets.xlsx' });
    });

    test('a failing export fires end with success false and rejects the awaited call', async () => {
        const { api, calls, events } = await createGrid();

        await expect(
            api.exportDataAsCsv({
                processCellCallback: () => {
                    throw new Error('processCellCallback failed');
                },
            })
        ).rejects.toThrow('processCellCallback failed');

        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({ success: false });
        expect(events[1].fileName).toBeUndefined();
    });

    test('a failing export with the overlay suppressed throws synchronously and fires end with success false', async () => {
        const { api, calls, events } = await createGrid({ suppressOverlays: ['exporting'] });

        expect(() =>
            api.exportDataAsCsv({
                processCellCallback: () => {
                    throw new Error('processCellCallback failed');
                },
            })
        ).toThrow('processCellCallback failed');

        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({ success: false });
    });

    test('no events are fired when the export is suppressed', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [51, 160] });
        const { api, calls } = await createGrid({ suppressCsvExport: true, suppressExcelExport: true });

        await api.exportDataAsCsv();
        await api.exportDataAsExcel();
        await asyncSetTimeout(0);

        expect(calls).toEqual([]);
    });

    test('data getters do not fire events', async () => {
        const { api, calls } = await createGrid();

        api.getDataAsCsv();
        api.getDataAsExcel();
        await asyncSetTimeout(0);

        expect(calls).toEqual([]);
    });

    test.each([
        { item: 'csvExport', format: 'csv' },
        { item: 'excelExport', format: 'excel' },
    ] as const)('the $item context menu item reports source contextMenu', async ({ item, format }) => {
        const { api, events } = await createGrid({ getContextMenuItems: () => [item] });

        api.showContextMenu();
        const menuItem = document.querySelector<HTMLElement>('[role="menuitem"]')!;
        menuItem.click();

        await waitFor(() => expect(events.map((event) => event.type)).toEqual(['exportStart', 'exportEnd']));
        expect(events[0]).toMatchObject({ format, source: 'contextMenu' });
        expect(events[1]).toMatchObject({ format, source: 'contextMenu', success: true });
    });
});
