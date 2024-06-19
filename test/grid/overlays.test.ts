import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

const OVERLAY = '.ag-overlay-loading-center';
const NO_ROWS = '.ag-overlay-no-rows-center';

describe('ag-grid overlays', () => {
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        resetGrids();
    });

    describe('with loading unset, classic behaviour', () => {
        test('without rows should show the loading overlay', () => {
            createMyGrid({ columnDefs });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('with empty rows should show the no rows overlay', () => {
            createMyGrid({ columnDefs, rowData: [] });
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('should not show any overlay if rows are present', () => {
            createMyGrid({ columnDefs, rowData: [{ athlete: 'foo', sport: 'bar', age: 20 }] });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('should hide the overlay when rows are added', () => {
            const api = createMyGrid({ columnDefs });
            expect(document.querySelector(OVERLAY)).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
        });

        test('should show no-rows overlay when empty rows are loaded', () => {
            const api = createMyGrid({ columnDefs });
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        describe('with suppressNoRowsOverlay', () => {
            test('should not show no-rows overlay with initial empty rows', () => {
                createMyGrid({ columnDefs, suppressNoRowsOverlay: true, rowData: [] });
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
            });

            test('should not show no-rows overlay when empty rows are loaded', () => {
                const api = createMyGrid({ columnDefs, suppressNoRowsOverlay: true });
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
                expect(document.querySelector(OVERLAY)).toBeTruthy();

                api.setGridOption('rowData', []);
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
                expect(document.querySelector(OVERLAY)).toBeFalsy();

                api.setGridOption('rowData', [{}]);
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
                expect(document.querySelector(OVERLAY)).toBeFalsy();
            });
        });

        describe('with suppressLoadingOverlay', () => {
            test('should not show loading overlay with initial empty rows', () => {
                createMyGrid({ columnDefs, suppressLoadingOverlay: true, rowData: [] });
                expect(document.querySelector(OVERLAY)).toBeFalsy();
            });

            test('should not show no-rows overlay', () => {
                const api = createMyGrid({ columnDefs, suppressLoadingOverlay: true });
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
                expect(document.querySelector(OVERLAY)).toBeFalsy();

                api.setGridOption('rowData', []);
                expect(document.querySelector(OVERLAY)).toBeFalsy();
                expect(document.querySelector(NO_ROWS)).toBeTruthy();

                api.setGridOption('rowData', [{}]);
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
                expect(document.querySelector(OVERLAY)).toBeFalsy();
            });

            test('should not show loading overlay when empty rows are loaded', () => {
                const api = createMyGrid({ columnDefs, suppressLoadingOverlay: true });
                expect(document.querySelector(OVERLAY)).toBeFalsy();
                expect(document.querySelector(NO_ROWS)).toBeFalsy();

                api.setGridOption('rowData', []);
                expect(document.querySelector(OVERLAY)).toBeFalsy();
                expect(document.querySelector(NO_ROWS)).toBeTruthy();

                api.setGridOption('rowData', [{}]);
                expect(document.querySelector(OVERLAY)).toBeFalsy();
                expect(document.querySelector(NO_ROWS)).toBeFalsy();
            });
        });
    });

    describe('When loading=true:', () => {
        test('Loading overlay is displayed even if rowData=undefined', () => {
            createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('When rowData=null/undefined or empty array, no rows overlay is not displayed', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', undefined);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('When rowData is an array, rows are shown in the grid and the loading overlay on top of them', () => {
            createMyGrid({ columnDefs, loading: true, rowData: [{}] });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            resetGrids();
            createMyGrid({ columnDefs, loading: true }).setGridOption('rowData', [{}]);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('if gridOptions.suppressLoadingOverlay = true, and loading=true, the loading property value is ignored and a console warning is shown', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            createMyGrid({ columnDefs, loading: true, suppressLoadingOverlay: true });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            consoleWarnSpy.mockRestore();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            api.showLoadingOverlay();
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            api.hideOverlay();
            expect(document.querySelector(OVERLAY)).toBeTruthy();
        });

        test('Calls to api.showNoRowsOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            api.showNoRowsOverlay();
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            api.hideOverlay();
            expect(document.querySelector(OVERLAY)).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            api.hideOverlay();
            expect(document.querySelector(OVERLAY)).toBeTruthy();
        });
    });

    describe('When loading=false:', () => {
        test('Before rowData is set, grid is not showing the loading overlay and shows the no rows overlay', () => {
            createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('When rowData=null/undefined or empty array shows no rows overlay', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('rowData', []);
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('rowData', undefined);
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('When rowData is an array, grid shows rows normally', () => {
            createMyGrid({ columnDefs, loading: false, rowData: [{}] });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect and produce a console warn', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
            api.showLoadingOverlay();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            consoleWarnSpy.mockRestore();
        });

        test('Calls to api.showNoRowsOverlay() will work normally and the no rows overlay shown', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
            api.showNoRowsOverlay();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will work normally to hide the no rows overlay if shown', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
            api.hideOverlay();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });
    });

    describe('update, with loading initially set to true', () => {
        test('initial no rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', [{}, {}]);
            expect(document.querySelector(OVERLAY)).toBeFalsy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();

            api.setGridOption('loading', false);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
        });

        test('initial empty rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, rowData: [] });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(document.querySelector(OVERLAY)).toBeFalsy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', false);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
        });

        test('initial rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, rowData: [{}, {}] });
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();

            api.setGridOption('loading', false);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
        });

        test('suppressLoadingOverlay has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, suppressLoadingOverlay: true });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', true);
            api.setGridOption('rowData', []);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', [{}]);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', false);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });
    });

    describe('update, with loading initially set to false', () => {
        test('initial no rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('initial empty rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false, rowData: [] });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('initial rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false, rowData: [{}, {}] });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeTruthy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('loading', undefined);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });

        test('suppressLoadingOverlay has priority', () => {
            const api = createMyGrid({ columnDefs, loading: false, suppressLoadingOverlay: true });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('loading', true);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();

            api.setGridOption('loading', false);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeTruthy();
        });

        test('suppressNoRowsOverlay has priority', () => {
            const api = createMyGrid({ columnDefs, loading: false, suppressNoRowsOverlay: true });
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();

            api.setGridOption('rowData', [{}]);
            expect(document.querySelector(OVERLAY)).toBeFalsy();
            expect(document.querySelector(NO_ROWS)).toBeFalsy();
        });
    });
});
