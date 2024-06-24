import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

describe('ag-grid overlays state', () => {
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        resetGrids();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe('deprecation warnings', () => {
        test('showLoadingOverlay', () => {
            const api = createMyGrid({ columnDefs });
            api.showLoadingOverlay();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });

        test('suppressLoadingOverlay initial property', () => {
            createMyGrid({ columnDefs, suppressLoadingOverlay: true });
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('with loading unset, classic behaviour', () => {
        test('without rows should show the loading overlay', () => {
            createMyGrid({ columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('with empty rows should show the no rows overlay', () => {
            createMyGrid({ columnDefs, rowData: [] });
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('should not show any overlay if rows are present', () => {
            createMyGrid({ columnDefs, rowData: [{ athlete: 'foo', sport: 'bar', age: 20 }] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('should hide the loading overlay when rows are added', () => {
            const api = createMyGrid({ columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('should show no-rows overlay when empty rows are loaded', () => {
            const api = createMyGrid({ columnDefs });
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        describe('with suppressNoRowsOverlay', () => {
            test('should not show no-rows overlay with initial empty rows', () => {
                createMyGrid({ columnDefs, suppressNoRowsOverlay: true, rowData: [] });
                expect(hasNoRowsOverlay()).toBeFalsy();
            });

            test('should not show no-rows overlay when empty rows are loaded', () => {
                const api = createMyGrid({ columnDefs, suppressNoRowsOverlay: true });
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeTruthy();

                api.setGridOption('rowData', []);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();

                api.setGridOption('rowData', [{}]);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();
            });
        });

        describe('with suppressLoadingOverlay', () => {
            test('should not show loading overlay with initial empty rows', () => {
                createMyGrid({ columnDefs, suppressLoadingOverlay: true, rowData: [] });
                expect(hasLoadingOverlay()).toBeFalsy();
            });

            test('should show no-rows overlay', () => {
                const api = createMyGrid({ columnDefs, suppressLoadingOverlay: true });
                expect(hasNoRowsOverlay()).toBeTruthy();
                expect(hasLoadingOverlay()).toBeFalsy();

                api.setGridOption('rowData', []);
                expect(hasLoadingOverlay()).toBeFalsy();
                expect(hasNoRowsOverlay()).toBeTruthy();

                api.setGridOption('rowData', [{}]);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();
            });
        });

        test('setting the rowdata and coldefs to undefined does not cause loading to reappear', () => {
            const api = createMyGrid({ columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{ athlete: 'Michael Phelps', country: 'US' }]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', undefined);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('rowData', undefined);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', columnDefs);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{ athlete: 'Michael Phelps', country: 'US' }]);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    describe('When loading=true:', () => {
        test('Loading overlay is displayed even if rowData=undefined', () => {
            createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('When rowData=null/undefined or empty array, no rows overlay is not displayed', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', undefined);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('When rowData is an array, rows are shown in the grid and the loading overlay on top of them', () => {
            createMyGrid({ columnDefs, loading: true, rowData: [{}] });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            resetGrids();
            createMyGrid({ columnDefs, loading: true }).setGridOption('rowData', [{}]);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('loading=true has higher priority than suppressLoadingOverlay', () => {
            const api = createMyGrid({ columnDefs, loading: true, suppressLoadingOverlay: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });

        test('Calls to api.showNoRowsOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });
    });

    describe('When loading=false:', () => {
        test('Before rowData is set, grid is not showing the loading overlay and shows the no rows overlay', () => {
            createMyGrid({ columnDefs, loading: false });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('When rowData=null/undefined or empty array shows no rows overlay', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', undefined);
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('When rowData is an array, grid shows rows normally', () => {
            createMyGrid({ columnDefs, loading: false, rowData: [{}] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('Calls to api.showNoRowsOverlay() will work normally and the no rows overlay shown', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will work normally to hide the no rows overlay if shown', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    describe('update, with loading initially set to true', () => {
        test('initial no rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('initial empty rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, rowData: [] });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('initial rows, loading true has priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, rowData: [{}, {}] });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('suppressLoadingOverlay has less priority', () => {
            const api = createMyGrid({ columnDefs, loading: true, suppressLoadingOverlay: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            api.setGridOption('rowData', []);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', [{}]);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    describe('update, with loading initially set to false', () => {
        test('initial no rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('initial empty rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false, rowData: [] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('initial rows, loading false', () => {
            const api = createMyGrid({ columnDefs, loading: false, rowData: [{}, {}] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('suppressLoadingOverlay has no effect', () => {
            const api = createMyGrid({ columnDefs, loading: false, suppressLoadingOverlay: true });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('suppressNoRowsOverlay has priority', () => {
            const api = createMyGrid({ columnDefs, loading: false, suppressNoRowsOverlay: true });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', [{}]);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    describe('changing suppressNoRowsOverlay option', () => {
        test('it gets applied next time the no-rows is shown and cannot be used to hide the current no-rows overlay (partially reactive)', () => {
            const api = createMyGrid({ columnDefs, rowData: [] });
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('suppressNoRowsOverlay', true);
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('suppressNoRowsOverlay', false);
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();
        });
    });
});
