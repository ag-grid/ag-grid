import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout, objectUrls } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule, enableDevValidations, getGridElement } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    PdfExportModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from '../columnToolPanel/toolPanelContextMenuHarness';

describe('export start and end events', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CsvExportModule,
            ExcelExportModule,
            PdfExportModule,
            ContextMenuModule,
            ColumnMenuModule,
            ColumnsToolPanelModule,
            ToolbarModule,
        ],
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

    const clickMenuItem = async (name: string) => {
        const item = await waitFor(() => {
            const options = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option'));
            const option = options.find((el) => el.querySelector('.ag-menu-option-text')?.textContent === name);
            expect(option).toBeDefined();
            return option!;
        });
        item.click();
    };

    const expectMenuExportEvents = async (events: any[], format: string, source: string) => {
        await waitFor(() => expect(events.map((event) => event.type)).toEqual(['exportStart', 'exportEnd']));
        expect(events[0]).toMatchObject({ format, source });
        expect(events[1]).toMatchObject({ format, source, success: true });
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

    test('pdf export from the api fires start then end with the file name', async () => {
        const { api, calls, events } = await createGrid();

        const exported = api.exportDataAsPdf({ fileName: 'athletes.pdf' });
        expect(calls).toEqual(['start']);
        expect(events[0]).toMatchObject({ format: 'pdf', source: 'api' });

        await exported;
        await waitFor(() => expect(calls).toEqual(['start', 'end']));
        expect(events[1]).toMatchObject({ format: 'pdf', source: 'api', success: true, fileName: 'athletes.pdf' });
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
        { item: 'csvExport', name: 'CSV Export', format: 'csv' },
        { item: 'excelExport', name: 'Excel Export', format: 'excel' },
        { item: 'pdfExport', name: 'PDF Export', format: 'pdf' },
    ] as const)('the $item context menu item reports source ui', async ({ item, name, format }) => {
        const { api, events } = await createGrid({ getContextMenuItems: () => [item] });

        api.showContextMenu();
        await clickMenuItem(name);

        await expectMenuExportEvents(events, format, 'ui');
    });

    test('an export item in the column menu reports source ui', async () => {
        const { api, events } = await createGrid({
            columnDefs: [{ field: 'athlete', mainMenuItems: ['csvExport'] }],
        });

        api.showColumnMenu('athlete');
        await clickMenuItem('CSV Export');

        await expectMenuExportEvents(events, 'csv', 'ui');
    });

    test('an export item in the columns tool panel menu reports source ui', async () => {
        const { api, events } = await createGrid({
            columnDefs: [{ field: 'athlete', columnMenuItems: ['csvExport'] }],
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });

        await openToolPanelContextMenu(
            api.getToolPanelInstance('columns'),
            getGridElement(api)! as HTMLElement,
            'Athlete'
        );
        await clickMenuItem('CSV Export');

        await expectMenuExportEvents(events, 'csv', 'ui');
    });

    test('an export item in a toolbar menu reports source ui', async () => {
        const { api, events } = await createGrid({
            toolbar: {
                items: [
                    {
                        toolbarItem: 'agMenuToolbarItem',
                        label: 'Export',
                        toolbarItemParams: { menuItems: ['excelExport'] },
                    },
                ],
            },
        });

        getGridElement(api)!.querySelector<HTMLButtonElement>('.ag-toolbar-button')!.click();
        await clickMenuItem('Excel Export');

        await expectMenuExportEvents(events, 'excel', 'ui');
    });
});
