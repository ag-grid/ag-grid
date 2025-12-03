import { ServerSideRowModelModule, TextFilterModule, ValidationModule } from 'ag-grid-enterprise';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TextFilterModule, ValidationModule],
    });

    function hasLoadingIcon() {
        return !!document.querySelector('.ag-icon.ag-icon-loading');
    }

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
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }],
            rowModelType: 'serverSide',
            onGridReady: ({ api }) => {
                api.setGridOption('serverSideDatasource', {
                    getRows: async (p) => {
                        finishLoadData = () => {
                            api.hideOverlay();
                            response.rowCount = response.rowData.length;
                            p.success(response);
                            if (!response.rowData.length) {
                                api.showNoRowsOverlay();
                            }
                        };
                        firstLoad();
                    },
                });
            },
        });

        await firstLoadPromise;

        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasLoadingIcon()).toBe(true);

        finishLoadData!();

        expect(hasNoRowsOverlay()).toBe(true);
        expect(hasLoadingIcon()).toBe(false);

        // Try to change columnDefs, row data still empty, we must still show the no overlay
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: 'agTextColumnFilter' }, { field: 'sport' }]);
        expect(hasLoadingIcon()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);

        response.rowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];

        api.refreshServerSide({ route: [] });
        expect(hasLoadingIcon()).toBe(true);
        finishLoadData!();
        expect(hasLoadingIcon()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        response.rowData = [];
        api.refreshServerSide({ route: [] });
        finishLoadData!();
        expect(hasLoadingIcon()).toBe(false);
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
            rowModelType: 'serverSide',
            onGridReady: ({ api }) => {
                api.setGridOption('serverSideDatasource', {
                    getRows: async (p) => {
                        const response = { rowData: responseRowData, rowCount: responseRowData.length };
                        p.success(response);
                        firstLoad();
                        loadPromise = new Promise<void>((resolve) => {
                            firstLoad = resolve;
                        });
                    },
                });
            },
        });

        await loadPromise;

        expect(hasNoRowsOverlay()).toBe(true);
        expect(hasLoadingIcon()).toBe(false);

        responseRowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];

        api.refreshServerSide({ route: [] });
        expect(hasLoadingIcon()).toBe(true);

        await loadPromise;

        expect(hasLoadingIcon()).toBe(false);
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
        api.refreshServerSide({ route: [] });
        expect(hasLoadingIcon()).toBe(true);

        await loadPromise;

        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasNoMatchingRowsOverlay()).toBe(true);

        responseRowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Usain Bolt' }];
        api.setFilterModel(null);

        api.refreshServerSide({ route: [] });
        expect(hasLoadingIcon()).toBe(true);

        await loadPromise;
        expect(hasLoadingIcon()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);
        expect(hasNoMatchingRowsOverlay()).toBe(false);
    });
});
