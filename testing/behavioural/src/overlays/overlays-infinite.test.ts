import type { ICellRendererParams } from 'ag-grid-community';
import { InfiniteRowModelModule } from 'ag-grid-community';
import { TextFilterModule, ValidationModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlays state for Infinite Row Model', () => {
    const gridsManager = new TestGridsManager({
        modules: [InfiniteRowModelModule, TextFilterModule, ValidationModule],
    });

    // function hasLoadingIcon() {
    //     return !!document.querySelector('.loading-row');
    // }

    // function hasLoadingOverlay() {
    //     return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    // }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasNoMatchingRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-matching-rows-center'));
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('should show loading and no rows overlay, also when changing columns', async () => {
        let finishLoadData: () => void;

        let firstLoad: () => void;
        const firstLoadPromise = new Promise<void>((resolve) => {
            firstLoad = resolve;
        });

        const response = { rowData: [] as any[], rowCount: 0 };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'Id',
                    valueGetter: 'node.id',
                    cellRenderer: (params: ICellRendererParams) => {
                        if (params.value !== undefined) {
                            return params.value;
                        } else {
                            return '<div class="loading-row" > Loading Row </div>';
                        }
                    },
                },
                { field: 'athlete', filter: 'agTextColumnFilter' },
            ],
            rowModelType: 'infinite',
            datasource: {
                getRows: async (p) => {
                    finishLoadData = () => {
                        api.hideOverlay();
                        // successCallback expects (rows, lastRow)
                        p.successCallback(response.rowData, response.rowCount);
                        if (!response.rowData.length) {
                            api.showNoRowsOverlay();
                        }
                    };
                    firstLoad();
                },
            },
        });
        await new GridColumns(api, `should show loading and no rows overlay, also when changing columns setup`)
            .checkColumns(`
                CENTER
                ├── 0 "Id" width:200
                └── athlete "Athlete" width:200
            `);
        await new GridRows(api, `should show loading and no rows overlay, also when changing columns setup`).check(`
            [no root row]
            └── filler id:rowIndex:0
        `);

        await firstLoadPromise;

        expect(hasNoRowsOverlay()).toBe(false);

        finishLoadData!();

        expect(hasNoRowsOverlay()).toBe(true);

        // Try to change columnDefs, row data still empty, we must still show the no overlay
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: 'agTextColumnFilter' }, { field: 'sport' }]);
        await new GridColumns(
            api,
            `should show loading and no rows overlay, also when changing columns after setGridOption columnDefs`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `should show loading and no rows overlay, also when changing columns after setGridOption columnDefs`
        ).check(`
            [no root row]
        `);
        expect(hasNoRowsOverlay()).toBe(true);

        response.rowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];

        api.purgeInfiniteCache();
        finishLoadData!();
        expect(hasNoRowsOverlay()).toBe(false);

        response.rowData = [];
        api.purgeInfiniteCache();
        finishLoadData!();
        expect(hasNoRowsOverlay()).toBe(true);
    });

    test('should show no rows and no matching rows when applying a filter', async () => {
        let responseRowData = [] as any[];

        let firstLoad: () => void;
        let loadPromise = new Promise<void>((resolve) => {
            firstLoad = resolve;
        });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }],
            rowModelType: 'infinite',
            datasource: {
                getRows: async (p) => {
                    p.successCallback(responseRowData, responseRowData.length);
                    firstLoad();
                    loadPromise = new Promise<void>((resolve) => {
                        firstLoad = resolve;
                    });
                },
            },
        });
        await new GridColumns(api, `should show no rows and no matching rows when applying a filter setup`)
            .checkColumns(`
                CENTER
                └── athlete "Athlete" width:200
            `);
        await new GridRows(api, `should show no rows and no matching rows when applying a filter setup`).check(`
            [no root row]
            └── filler id:rowIndex:0
        `);

        await loadPromise;

        expect(hasNoRowsOverlay()).toBe(true);

        responseRowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];

        api.purgeInfiniteCache();

        await loadPromise;

        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasNoMatchingRowsOverlay()).toBe(false);

        responseRowData = [];
        api.setFilterModel({
            athlete: {
                filterType: 'text',
                type: 'startsWith',
                filter: 'Test',
            },
        });
        await new GridRows(api, `should show no rows and no matching rows when applying a filter after setFilterModel`)
            .check(`
                [no root row]
                └── filler id:rowIndex:0
            `);

        await loadPromise;

        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasNoMatchingRowsOverlay()).toBe(true);

        responseRowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];
        api.setFilterModel(null);
        await new GridRows(
            api,
            `should show no rows and no matching rows when applying a filter after setFilterModel #2`
        ).check(`
            [no root row]
            └── filler id:rowIndex:0
        `);

        await loadPromise;
        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasNoMatchingRowsOverlay()).toBe(false);
    });
});
