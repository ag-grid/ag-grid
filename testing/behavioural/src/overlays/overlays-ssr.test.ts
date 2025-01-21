import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('ag-grid overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule],
    });

    function hasLoadingIcon() {
        return !!document.querySelector('.ag-icon.ag-icon-loading');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
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
            columnDefs: [{ field: 'athlete' }],
            rowModelType: 'serverSide',
            onGridReady: ({ api }) => {
                api.setGridOption('serverSideDatasource', {
                    getRows: async ({ success }) => {
                        finishLoadData = () => {
                            api.hideOverlay();
                            response.rowCount = response.rowData.length;
                            success(response);
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
        api.setGridOption('columnDefs', [{ field: 'athlete' }, { field: 'sport' }]);
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
});
