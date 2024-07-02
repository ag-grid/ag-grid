import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

describe('ag-grid case insensitive sorting state', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => consoleErrorSpy.mockRestore());

    beforeEach(() => {
        resetGrids();
    });

    describe('ClientSideRowModel sorting', () => {
        test('case insensitive sorting for alphanumeric characters', () => {
            const api = createMyGrid({
                columnDefs: [{ field: 'label', sort: 'asc' }],
                rowData: [{ label: 'ISIN' }, { label: 'Instrument ID' }, { label: 'AZ' }, { label: 'aa' }],
            });

            expect(api.getRenderedNodes().map((n) => n.data.label)).toEqual(['aa', 'AZ', 'Instrument ID', 'ISIN']);
        });

        test('case insensitive sorting for accented characters', () => {
            const api = createMyGrid({
                columnDefs: [{ field: 'label', sort: 'asc' }],
                rowData: [{ label: 'ISIN' }, { label: 'Instrument ID' }, { label: 'ÀZ' }, { label: 'àa' }],
                accentedSort: true,
            });

            expect(api.getRenderedNodes().map((n) => n.data.label)).toEqual(['àa', 'ÀZ', 'Instrument ID', 'ISIN']);
        });
    });

    describe('ServerSideRowModel sorting', () => {
        test('case insensitive sorting for alphanumeric characters', async () => {
            const api = createMyGrid({
                columnDefs: [{ field: 'label' }],
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows(params) {
                        params.success({
                            rowData: [{ label: 'ISIN' }, { label: 'Instrument ID' }, { label: 'AZ' }, { label: 'aa' }],
                        });
                    },
                },
                serverSideEnableClientSideSort: true,
            });

            await new Promise((resolve) => api.addEventListener('firstDataRendered', resolve));

            api.applyColumnState({ state: [{ colId: 'label', sort: 'asc' }], defaultState: { sort: null } });

            await new Promise(process.nextTick);

            expect(api.getRenderedNodes().map((n) => n.data.label)).toEqual(['aa', 'AZ', 'Instrument ID', 'ISIN']);
        });

        test('case insensitive sorting for accented characters', async () => {
            const api = createMyGrid({
                columnDefs: [{ field: 'label' }],
                accentedSort: true,
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows(params) {
                        params.success({
                            rowData: [{ label: 'ISIN' }, { label: 'Instrument ID' }, { label: 'ÀZ' }, { label: 'àa' }],
                        });
                    },
                },
                serverSideEnableClientSideSort: true,
            });

            await new Promise((resolve) => api.addEventListener('firstDataRendered', resolve));

            api.applyColumnState({ state: [{ colId: 'label', sort: 'asc' }], defaultState: { sort: null } });

            await new Promise(process.nextTick);

            expect(api.getRenderedNodes().map((n) => n.data.label)).toEqual(['àa', 'ÀZ', 'Instrument ID', 'ISIN']);
        });
    });
});
