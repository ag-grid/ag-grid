import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('ag-grid overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: MockInstance;

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
    });

    describe('deprecation warnings', () => {
        test('showLoadingOverlay', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            api.showLoadingOverlay();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });

        test('suppressLoadingOverlay initial property', () => {
            gridsManager.createGrid('myGrid', { columnDefs, suppressLoadingOverlay: true });
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('with loading unset, classic behaviour', () => {
        test('without rows should show the loading overlay', () => {
            gridsManager.createGrid('myGrid', { columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('with empty rows should show the no rows overlay', () => {
            gridsManager.createGrid('myGrid', { columnDefs, rowData: [] });
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('should not show any overlay if rows are present', () => {
            gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ athlete: 'foo', sport: 'bar', age: 20 }] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('should hide the loading overlay when rows are added', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('should hide the loading overlay when rows are added via a transaction', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            expect(hasLoadingOverlay()).toBeTruthy();

            api.applyTransaction({
                add: [{}, {}],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('should show no-rows overlay when empty rows are loaded', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('should show no-rows overlay when empty rows are loaded via a transaction', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.applyTransaction({
                add: [],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        describe('with suppressNoRowsOverlay', () => {
            test('should not show no-rows overlay with initial empty rows', () => {
                gridsManager.createGrid('myGrid', { columnDefs, suppressNoRowsOverlay: true, rowData: [] });
                expect(hasNoRowsOverlay()).toBeFalsy();
            });

            test('should not show no-rows overlay when empty rows are loaded', () => {
                const api = gridsManager.createGrid('myGrid', { columnDefs, suppressNoRowsOverlay: true });
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeTruthy();

                api.setGridOption('rowData', []);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();

                api.applyTransaction({ add: [] });
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();

                api.setGridOption('rowData', [{}]);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();
            });
        });

        describe('with suppressLoadingOverlay', () => {
            test('should not show loading overlay with initial empty rows', () => {
                gridsManager.createGrid('myGrid', { columnDefs, suppressLoadingOverlay: true, rowData: [] });
                expect(hasLoadingOverlay()).toBeFalsy();
            });

            test('should show no-rows overlay', () => {
                const api = gridsManager.createGrid('myGrid', { columnDefs, suppressLoadingOverlay: true });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs });
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

        test('it behaves correctly also when columns are set after rows', () => {
            const api = gridsManager.createGrid('myGrid', { rowData: [{ athlete: 'Michael Phelps', country: 'US' }] });
            expect(hasLoadingOverlay()).toBeTruthy();

            api.setGridOption('columnDefs', columnDefs);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', undefined);
            expect(hasLoadingOverlay()).toBeFalsy();
        });
    });

    describe('When loading=true:', () => {
        test('Loading overlay is displayed even if rowData=undefined', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('When rowData=null/undefined or empty array, no rows overlay is not displayed', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
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
            let api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [{}] });

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.destroy();

            api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

            api.setGridOption('rowData', [{}]);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.destroy();

            api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

            api.applyTransaction({ add: [{}] });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('loading=true has higher priority than suppressLoadingOverlay', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, suppressLoadingOverlay: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });

        test('Calls to api.showNoRowsOverlay() will have no effect', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will have no effect', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
        });
    });

    describe('When loading=false:', () => {
        test('Before rowData is set, grid is not showing the loading overlay and shows the no rows overlay', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('When rowData=null/undefined or empty array shows no rows overlay', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('rowData', undefined);
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('When rowData is an array, grid shows rows normally', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [{}] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('Calls to api.showNoRowsOverlay() will work normally and the no rows overlay shown', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('Calls to api.hideOverlay() will work normally to hide the no rows overlay if shown', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    describe('update, with loading initially set to true', () => {
        test('initial no rows, loading true has priority', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [] });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [{}, {}] });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, suppressLoadingOverlay: true });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [] });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [{}, {}] });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, suppressLoadingOverlay: true });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, suppressNoRowsOverlay: true });
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
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [] });
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

    describe('custom overlay components via gridOptions.components', () => {
        // Helper to reduce repetition: create component classes that capture the init params
        // capturedParams is provided per-test to avoid shared state between tests
        const makeCapturingComp = (capturedParams: Record<string, any>, key: string, className?: string) => {
            return class {
                private e: HTMLElement;
                constructor() {
                    this.e = document.createElement('div');
                    this.e.className = className ?? `my-capture-${key}`;
                    this.e.textContent = `comp ${key}`;
                }
                public getGui() {
                    return this.e;
                }
                public init(_params?: any) {
                    // store a shallow copy so later modifications don't affect assertions
                    capturedParams[key] = { ...(_params ?? {}) };
                }
            };
        };
        test('custom loading and no-rows overlays are rendered when provided via components map', () => {
            // per-test captured params map
            const capturedParams: Record<string, any> = {};
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                // register components under the grid's default overlay names (agLoadingOverlay/agNoRowsOverlay)
                components: {
                    agLoadingOverlay: makeCapturingComp(
                        capturedParams,
                        'agLoadingOverlay',
                        'my-custom-loading-overlay'
                    ),
                    agNoRowsOverlay: makeCapturingComp(capturedParams, 'agNoRowsOverlay', 'my-custom-no-rows-overlay'),
                },
                // do not set explicit loadingOverlayComponent/noRowsOverlayComponent or their params
            });

            // By default (no rowData set) classic behaviour shows loading overlay
            expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeFalsy();

            // when rowData set to empty array, no-rows overlay should be shown
            api.setGridOption('rowData', []);
            expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

            // verify components were instantiated and received the grid api
            expect(capturedParams.agLoadingOverlay).toBeDefined();
            expect(capturedParams.agLoadingOverlay.api).toBeDefined();

            expect(capturedParams.agNoRowsOverlay).toBeDefined();
            expect(capturedParams.agNoRowsOverlay.api).toBeDefined();
        });

        test('activeOverlay set to name renders custom active overlay and hides loading/no-rows', () => {
            // per-test captured params map
            const capturedParams: Record<string, any> = {};

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    myActiveOverlay: makeCapturingComp(capturedParams, 'myActiveOverlay', 'my-custom-active-overlay'),
                    agLoadingOverlay: makeCapturingComp(
                        capturedParams,
                        'agLoadingOverlay',
                        'my-custom-loading-overlay'
                    ),
                    agNoRowsOverlay: makeCapturingComp(capturedParams, 'agNoRowsOverlay', 'my-custom-no-rows-overlay'),
                },
                activeOverlayParams: { fromTest: 'activeParam' },
            });

            // ensure default loading overlay is shown first (no rowData set)
            expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
            // verify loading overlay got its params
            // verify loading overlay was instantiated and received api
            expect(capturedParams.agLoadingOverlay).toBeDefined();
            expect(capturedParams.agLoadingOverlay.api).toBeDefined();
            expect(capturedParams.agLoadingOverlay.fromTest).toBe('activeParam');

            // Now trigger no-rows by setting empty rowData
            api.setGridOption('rowData', []);
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
            // verify no-rows overlay was instantiated and received api
            expect(capturedParams.agNoRowsOverlay).toBeDefined();
            expect(capturedParams.agNoRowsOverlay.api).toBeDefined();
            expect(capturedParams.agNoRowsOverlay.fromTest).toBe('activeParam');

            // Clear overlays and ensure rows present so activeOverlay can take precedence
            api.setGridOption('rowData', [{}]);
            api.setGridOption('loading', false);

            // set activeOverlay to our custom name - should show active overlay instead
            api.setGridOption('activeOverlay', 'myActiveOverlay');
            expect(document.querySelector('.my-custom-active-overlay')).toBeTruthy();
            // loading and no-rows should not be rendered while active overlay is active
            expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeFalsy();

            // verify params were passed to the active component
            expect(capturedParams.myActiveOverlay).toBeDefined();
            expect(capturedParams.myActiveOverlay.api).toBeDefined();
            expect(capturedParams.myActiveOverlay.fromTest).toBe('activeParam');
        });

        test('activeOverlay that resolves to the loading overlay uses loading wrapper class', () => {
            const capturedParams: Record<string, any> = {};

            gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    // register our loading component under a custom key
                    myLoader: makeCapturingComp(capturedParams, 'myLoader', 'my-resolve-loader'),
                },
                // point the loading overlay option at the custom key
                loadingOverlayComponent: 'myLoader',
                // also set activeOverlay to the same key
                activeOverlay: 'myLoader',
                loading: false,
                rowData: [{}],
            });

            // since activeOverlay resolved to the same component as loadingOverlayComponent,
            // the overlay service should use the loading wrapper css class
            // show the active overlay by setting the option (already set), then check wrapper
            expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
            expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        });

        test('activeOverlay that resolves to the no-rows overlay uses no-rows wrapper class', () => {
            const capturedParams: Record<string, any> = {};

            gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    // register our no-rows component under a custom key
                    myNoRows: makeCapturingComp(capturedParams, 'myNoRows', 'my-resolve-norows'),
                },
                // point the no-rows overlay option at the custom key
                noRowsOverlayComponent: 'myNoRows',
                // ensure there are no rows so the overlay logic may choose no-rows
                rowData: [],
                // set activeOverlay to the same key so the active overlay resolves to the no-rows component
                activeOverlay: 'myNoRows',
                loading: false,
            });

            // the overlay service should use the no-rows wrapper css class
            expect(document.querySelector('.ag-overlay-no-rows-wrapper')).toBeTruthy();
            expect(document.querySelector('.my-resolve-norows')).toBeTruthy();
        });

        test('overlay-specific params take priority over activeOverlayParams', () => {
            const capturedParams: Record<string, any> = {};

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    agLoadingOverlay: makeCapturingComp(
                        capturedParams,
                        'agLoadingOverlay',
                        'my-custom-loading-overlay'
                    ),
                    agNoRowsOverlay: makeCapturingComp(capturedParams, 'agNoRowsOverlay', 'my-custom-no-rows-overlay'),
                },
                // provide both specific params and activeOverlayParams; specific should win
                loadingOverlayComponentParams: { fromTest: 'loadingSpecific' },
                noRowsOverlayComponentParams: { fromTest: 'noRowsSpecific' },
                activeOverlayParams: { fromTest: 'activeParam' },
            });

            // initial loading overlay should show and receive specific param
            expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
            expect(capturedParams.agLoadingOverlay).toBeDefined();
            expect(capturedParams.agLoadingOverlay.fromTest).toBe('loadingSpecific');

            // trigger no-rows and verify it receives its specific param
            api.setGridOption('rowData', []);
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
            expect(capturedParams.agNoRowsOverlay).toBeDefined();
            expect(capturedParams.agNoRowsOverlay.fromTest).toBe('noRowsSpecific');
        });

        test('loading=true has priority over activeOverlay', () => {
            const capturedParams: Record<string, any> = {};

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    agLoadingOverlay: makeCapturingComp(
                        capturedParams,
                        'agLoadingOverlay',
                        'my-priority-loading-overlay'
                    ),
                    myActiveOverlay: makeCapturingComp(capturedParams, 'myActiveOverlay', 'my-priority-active-overlay'),
                },
                // ensure rows exist so that after clearing `loading` there is no built-in no-rows overlay
                rowData: [{}],
                // set both activeOverlay and loading=true; loading should win
                activeOverlay: 'myActiveOverlay',
                activeOverlayParams: { fromTest: 'activeParam' },
                loading: true,
                loadingOverlayComponentParams: { fromTest: 'loadingParam' },
            });

            // loading overlay should be visible and active overlay should not
            expect(document.querySelector('.my-priority-loading-overlay')).toBeTruthy();
            expect(document.querySelector('.my-priority-active-overlay')).toBeFalsy();

            // loading overlay should receive its specific params
            expect(capturedParams.agLoadingOverlay).toBeDefined();
            expect(capturedParams.agLoadingOverlay.fromTest).toBe('loadingParam');

            // now clear loading and the active overlay should appear
            api.setGridOption('loading', false);
            expect(document.querySelector('.my-priority-loading-overlay')).toBeFalsy();
            expect(document.querySelector('.my-priority-active-overlay')).toBeTruthy();
            expect(capturedParams.myActiveOverlay).toBeDefined();
            expect(capturedParams.myActiveOverlay.fromTest).toBe('activeParam');
        });

        test('loading/no-rows overlay accepts string keys from components map', () => {
            const capturedParams: Record<string, any> = {};

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                // register components under custom keys
                components: {
                    customLoaderKey: makeCapturingComp(capturedParams, 'customLoaderKey', 'my-custom-loader-key'),
                    customNoRowsKey: makeCapturingComp(capturedParams, 'customNoRowsKey', 'my-custom-norows-key'),
                },
                // point the overlay options at the string keys
                loadingOverlayComponent: 'customLoaderKey',
                noRowsOverlayComponent: 'customNoRowsKey',
                // start with loading to test loading overlay resolution
                loading: true,
            });

            // loading overlay should be rendered via the component found by string key
            expect(document.querySelector('.my-custom-loader-key')).toBeTruthy();
            expect(capturedParams.customLoaderKey).toBeDefined();

            // clear loading and trigger no-rows by setting empty rows
            api.setGridOption('loading', false);
            api.setGridOption('rowData', []);

            expect(document.querySelector('.my-custom-norows-key')).toBeTruthy();
            expect(capturedParams.customNoRowsKey).toBeDefined();
        });

        test('activeOverlay can be switched between names and classes and unset', () => {
            // per-test captured params map
            const capturedParams: Record<string, any> = {};

            // create a named component and a class component
            const NamedComp = makeCapturingComp(capturedParams, 'namedComp', 'my-named-overlay');
            const ClassComp = makeCapturingComp(capturedParams, 'classComp', 'my-class-overlay');

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    namedComp: NamedComp,
                    classComp: ClassComp,
                },
                // don't set loading/no-rows to let activeOverlay show when we want it
                loading: false,
                rowData: [{}],
                activeOverlayParams: { fromTest: 'activeSwitch' },
            });

            // 1) set activeOverlay to the class component directly
            api.setGridOption('activeOverlay', ClassComp as any);
            expect(document.querySelector('.my-class-overlay')).toBeTruthy();
            expect(capturedParams.classComp).toBeDefined();

            // clear
            api.setGridOption('activeOverlay', null);
            expect(document.querySelector('.my-class-overlay')).toBeNull();

            // 2) switch to named component by name
            api.setGridOption('activeOverlay', 'namedComp');
            expect(document.querySelector('.my-named-overlay')).toBeTruthy();
            expect(capturedParams.namedComp).toBeDefined();

            // clear
            api.setGridOption('activeOverlay', undefined);
            expect(document.querySelector('.my-named-overlay')).toBeNull();

            // 3) switch back to the class component (by passing class again)
            api.setGridOption('activeOverlay', ClassComp as any);
            expect(document.querySelector('.my-class-overlay')).toBeTruthy();

            // 4) set activeOverlay to null to remove active overlay
            api.setGridOption('activeOverlay', null);
            expect(document.querySelector('.my-named-overlay')).toBeNull();

            // 5) set activeOverlay to the class constructor function via components map reference
            api.setGridOption('activeOverlay', 'classComp');
            expect(document.querySelector('.my-class-overlay')).toBeTruthy();

            // 6) clear again by setting activeOverlay to undefined
            api.setGridOption('activeOverlay', undefined);
            expect(document.querySelector('.my-class-overlay')).toBeNull();
        });

        test('activeOverlay can be set to a component directly and is shown/hidden when unset', () => {
            // per-test captured params map
            const capturedParams: Record<string, any> = {};

            // create an in-place component class
            class DirectComp {
                private e: HTMLElement;
                constructor() {
                    this.e = document.createElement('div');
                    this.e.className = 'my-direct-overlay';
                    this.e.textContent = 'direct';
                }
                public getGui() {
                    return this.e;
                }
                public init(_params?: any) {
                    capturedParams.direct = { ...(_params ?? {}) };
                }
            }

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                loading: false,
                rowData: [{}],
            });

            // set activeOverlay to the component class directly
            api.setGridOption('activeOverlay', DirectComp as any);
            expect(document.querySelector('.my-direct-overlay')).toBeTruthy();
            expect(capturedParams.direct).toBeDefined();

            // unset activeOverlay
            api.setGridOption('activeOverlay', null);
            expect(document.querySelector('.my-direct-overlay')).toBeNull();
        });
    });
});
