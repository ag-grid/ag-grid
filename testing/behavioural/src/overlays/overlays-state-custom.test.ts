import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid modern overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    function hasLoadingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasLoadingOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-loading-wrapper');
    }

    function hasNoRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper');
    }

    function hasCustomOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-custom-wrapper');
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('custom loading and no-rows overlays are rendered when provided via components map', () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
        });

        // By default (no rowData set) classic behaviour shows loading overlay
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeFalsy();

        // when rowData set to empty array, no-rows overlay should be shown
        api.setGridOption('rowData', []);
        expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

        // verify components were instantiated and received the grid api
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].api).toBeDefined();

        // ensure refresh reacts to activeOverlayParams updates (current active overlay is the no-rows overlay)
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam2' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('activeParam2');
        // restore to undefined
        api.setGridOption('activeOverlayParams', undefined);

        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();
    });

    test('loading=true has priority over activeOverlay', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            activeOverlay: 'agNoRowsOverlay',
        });
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeFalsy();

        const capturedParams: Record<string, any> = {};
        api.setGridOption('activeOverlay', makeOverlayComp(capturedParams, 'my-active-overlay'));

        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(document.querySelector('.my-active-overlay')).toBeFalsy();
        expect(capturedParams['my-active-overlay']).toBeUndefined();

        api.setGridOption('loading', false);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(document.querySelector('.my-active-overlay')).toBeTruthy();
        expect(capturedParams['my-active-overlay']).toBeDefined();
    });

    test('activeOverlay set to name renders custom active overlay and hides loading/no-rows', () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myActiveOverlay: makeOverlayComp(capturedParams, 'my-custom-active-overlay'),
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
            activeOverlayParams: { fromTest: 'activeParam' },
        });
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();

        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].api).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('activeParam');

        // Now trigger no-rows by setting empty rowData
        api.setGridOption('rowData', []);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

        // verify no-rows overlay was instantiated and received api
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('activeParam');

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
        expect(capturedParams['my-custom-active-overlay']).toBeDefined();
        expect(capturedParams['my-custom-active-overlay'].api).toBeDefined();
        expect(capturedParams['my-custom-active-overlay'].fromTest).toBe('activeParam');

        // updating activeOverlayParams while active overlay is shown should call refresh
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam2' });
        expect(capturedParams['my-custom-active-overlay'].fromTest).toBe('activeParam2');
        // restore
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam' });
    });

    test('loading=true and custom component with loadingOverlayComponentParams', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            loadingOverlayComponentParams: { fromTest: 'loadingParam' },
            loading: true,
            rowData: [{}],
        });

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update loadingOverlayComponentParams should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingParam2' });
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
    });

    test('loading=true and custom component with activeOverlayParams', () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            activeOverlayParams: { fromTest: 'loadingParam' },
            loading: true,
            rowData: [{}],
        });

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // updating activeOverlayParams should refresh the shown loading overlay
        api.setGridOption('activeOverlayParams', { fromTest: 'loadingParam2' });
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
    });

    test('loading=true loadingOverlayComponent resolves to the loading overlay uses loading wrapper class', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myLoader: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            loadingOverlayComponent: 'myLoader',
            loadingOverlayComponentParams: { fromTest: 'loadingParam' },
            loading: true,
            rowData: [{}],
        });

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingParam2' });
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
    });

    test('activeOverlay that resolves to the loading overlay uses loading wrapper class', () => {
        const capturedParams: Record<string, any> = {};
        gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            activeOverlay: 'agLoadingOverlay',
            loading: false,
            rowData: [{}],
        });
        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
    });

    test('activeOverlay that resolves to the no-rows overlay uses no-rows wrapper class', () => {
        const capturedParams: Record<string, any> = {};
        gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-resolve-no-rows'),
            },
            rowData: [],
            activeOverlay: 'agNoRowsOverlay',
            loading: false,
        });
        expect(document.querySelector('.ag-overlay-no-rows-wrapper')).toBeTruthy();
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
        expect(document.querySelector('.my-resolve-no-rows')).toBeTruthy();
    });

    test('activeOverlay built-in keys without custom components show built-in overlays and not custom wrapper', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // start with rows present and loading false
            loading: false,
            rowData: [{}],
        });

        // show the built-in loading overlay via activeOverlay key
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // clearing activeOverlay should hide the loading overlay
        api.setGridOption('activeOverlay', null);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // trigger no-rows and show built-in no-rows overlay via activeOverlay key
        api.setGridOption('rowData', []);
        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        expect(hasNoRowsOverlay()).toBeTruthy();
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // clear again - ensure rows exist so the built-in no-rows overlay does not reappear
        api.setGridOption('rowData', [{}]);
        api.setGridOption('activeOverlay', undefined);
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('custom active overlay uses the custom wrapper css class', () => {
        const capturedParams: Record<string, any> = {};

        gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myCustom: makeOverlayComp(capturedParams, 'my-resolve-custom'),
            },
            activeOverlay: 'myCustom',
            loading: false,
            rowData: [{}],
        });

        // wrapper should be the custom wrapper class for active overlays
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-custom')).toBeTruthy();
    });

    test('activeOverlay set to a component class uses the custom wrapper class', () => {
        const capturedParams: Record<string, any> = {};
        const C = makeOverlayComp(capturedParams, 'my-class-custom');

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: false,
            rowData: [{}],
        });

        api.setGridOption('activeOverlay', C as any);
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-class-custom')).toBeTruthy();
    });

    test('overlay-specific params take priority over activeOverlayParams', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
            loadingOverlayComponentParams: { fromTest: 'loadingSpecific' },
            noRowsOverlayComponentParams: { fromTest: 'noRowsSpecific' },
            activeOverlayParams: { fromTest: 'activeParam' },
        });

        // initial loading overlay should show and receive specific param
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // activeOverlayParams should not override overlay-specific params
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam2' });
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // updating the specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingSpecific2' });
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific2');

        // trigger no-rows and verify it receives its specific param
        api.setGridOption('rowData', []);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // activeOverlayParams should not override no-rows specific params
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam3' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // updating the specific no-rows params should refresh the component
        api.setGridOption('noRowsOverlayComponentParams', { fromTest: 'noRowsSpecific2' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific2');
    });

    test('loading=true has priority over activeOverlay', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-priority-loading-overlay'),
                myActiveOverlay: makeOverlayComp(capturedParams, 'my-priority-active-overlay'),
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
        expect(capturedParams['my-priority-loading-overlay']).toBeDefined();
        expect(capturedParams['my-priority-loading-overlay'].fromTest).toBe('loadingParam');

        // now clear loading and the active overlay should appear
        api.setGridOption('loading', false);
        expect(document.querySelector('.my-priority-loading-overlay')).toBeFalsy();
        expect(document.querySelector('.my-priority-active-overlay')).toBeTruthy();
        expect(capturedParams['my-priority-active-overlay']).toBeDefined();
        expect(capturedParams['my-priority-active-overlay'].fromTest).toBe('activeParam');
    });

    test('loading/no-rows overlay accepts string keys from components map', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // register components under custom keys
            components: {
                customLoaderKey: makeOverlayComp(capturedParams, 'my-custom-loader-key'),
                customNoRowsKey: makeOverlayComp(capturedParams, 'my-custom-no-rows-key'),
            },
            // point the overlay options at the string keys
            loadingOverlayComponent: 'customLoaderKey',
            noRowsOverlayComponent: 'customNoRowsKey',
            // start with loading to test loading overlay resolution
            loading: true,
        });

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('loading', false);
        api.setGridOption('rowData', []);

        expect(document.querySelector('.my-custom-no-rows-key')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key']).toBeDefined();
    });

    test('activeOverlay can be switched between names and classes and unset', async () => {
        // per-test captured params map
        const capturedParams: Record<string, any> = {};

        // create a named component and a class component
        const NamedComp = makeOverlayComp(capturedParams, 'my-named-overlay');
        const ClassComp = makeOverlayComp(capturedParams, 'my-class-overlay');

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
        api.setGridOption('activeOverlay', ClassComp);
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-class-overlay']).toBeDefined();

        // clear
        api.setGridOption('activeOverlay', null);

        expect(document.querySelector('.my-class-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 2) switch to named component by name
        api.setGridOption('activeOverlay', 'namedComp');
        expect(document.querySelector('.my-named-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-named-overlay']).toBeDefined();

        // clear
        api.setGridOption('activeOverlay', undefined);
        expect(document.querySelector('.my-named-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 3) switch back to the class component (by passing class again)
        api.setGridOption('activeOverlay', ClassComp);
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();

        // 4) set activeOverlay to null to remove active overlay
        api.setGridOption('activeOverlay', null);
        expect(document.querySelector('.my-named-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 5) set activeOverlay to the class constructor function via components map reference
        api.setGridOption('activeOverlay', 'classComp');
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();

        // 6) clear again by setting activeOverlay to undefined
        api.setGridOption('activeOverlay', undefined);
        expect(document.querySelector('.my-class-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('activeOverlay can be set to a component directly and is shown/hidden when unset', async () => {
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
        api.setGridOption('activeOverlay', DirectComp);
        expect(document.querySelector('.my-direct-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams.direct).toBeDefined();

        // unset activeOverlay
        api.setGridOption('activeOverlay', null);

        expect(document.querySelector('.my-direct-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('activeOverlay accepts a component class and can be swapped live so only the new component is shown', async () => {
        const capturedParams: Record<string, any> = {};

        const First = makeOverlayComp(capturedParams, 'my-first-active');
        const Second = makeOverlayComp(capturedParams, 'my-second-active');

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: false,
            rowData: [{}],
        });

        // show first component directly
        api.setGridOption('activeOverlay', First);
        expect(document.querySelector('.my-first-active')).toBeTruthy();
        expect(document.querySelector('.my-second-active')).toBeFalsy();

        // swap to second component live
        api.setGridOption('activeOverlay', Second);
        expect(document.querySelector('.my-first-active')).toBeFalsy();
        expect(document.querySelector('.my-second-active')).toBeTruthy();

        // unset active overlay
        api.setGridOption('activeOverlay', null);

        expect(document.querySelector('.my-second-active')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('components.agNoRowsOverlay = false suppresses the no-rows overlay', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // disable the no-rows overlay component via components map
            components: { agNoRowsOverlay: false },
            rowData: [],
        });

        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        // showNoRowsOverlay should have no effect when component is disabled
        api.showNoRowsOverlay();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        // setting rowData to empty should not render the no-rows overlay
        api.setGridOption('rowData', []);
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        // explicitly setting activeOverlay to the no-rows key should not render it when suppressed
        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
    });

    test('components.<custom> = false prevents activeOverlay resolution and acts as suppress', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                mySuppressed: false,
            },
            // try to use suppressed component as active overlay
            activeOverlay: 'mySuppressed',
            loading: false,
            rowData: [{}],
        });

        // active overlay should not be rendered since component is disabled
        expect(document.querySelector('.my-suppressed-overlay')).toBeFalsy();
        // dynamic set of activeOverlay should also not render the suppressed component
        const api2 = gridsManager.createGrid('myGrid2', { columnDefs, components: { mySuppressed: false } });
        api2.setGridOption('activeOverlay', 'mySuppressed');
        expect(document.querySelector('.my-suppressed-overlay')).toBeFalsy();
    });

    test('components.agNoRowsOverlay = false suppresses the no-rows overlay even when showNoRowsOverlay/empty rows invoked', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: { agNoRowsOverlay: false },
            rowData: [],
        });

        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        api.showNoRowsOverlay();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        api.setGridOption('rowData', []);
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
    });

    test('components.<custom> = null prevents activeOverlay resolution and acts as suppress when set dynamically', () => {
        const apiSupp = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: { mySuppressedNull: null },
        });

        apiSupp.setGridOption('activeOverlay', 'mySuppressedNull');
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('refresh updates params for shown loading overlay when loadingOverlayComponentParams change', () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-refresh-loading'),
            },
            loadingOverlayComponentParams: { fromTest: 'v1' },
            loading: true,
            rowData: [{}],
        });

        expect(document.querySelector('.my-refresh-loading')).toBeTruthy();
        // initial params applied via init
        expect(capturedParams['my-refresh-loading']?.fromTest).toBe('v1');

        // update params and expect refresh to propagate
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'v2' });
        expect(capturedParams['my-refresh-loading']?.fromTest).toBe('v2');
    });

    test('refresh updates params for active overlay when activeOverlayParams change', () => {
        const capturedParams: Record<string, any> = {};

        const NamedComp = makeOverlayComp(capturedParams, 'my-refresh-active');

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                namedRefresh: NamedComp,
            },
            loading: false,
            rowData: [{}],
            activeOverlay: 'namedRefresh',
            activeOverlayParams: { fromTest: 'a1' },
        });

        expect(document.querySelector('.my-refresh-active')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-refresh-active']?.fromTest).toBe('a1');

        api.setGridOption('activeOverlayParams', { fromTest: 'a2' });
        expect(capturedParams['my-refresh-active']?.fromTest).toBe('a2');
    });

    test('loadingOverlayComponent=false disables loading overlay even when forced', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loadingOverlayComponent: false,
        });

        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', true);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', false);
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
    });

    test('noRowsOverlayComponent=false disables no-rows overlay even when forced', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            noRowsOverlayComponent: false,
            rowData: [],
        });

        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.showNoRowsOverlay();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
    });

    describe('with warning disabled', () => {
        let warnSpy: ReturnType<typeof vitest.spyOn>;

        beforeEach(() => {
            warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            warnSpy.mockRestore();
        });

        test('activeOverlay=false suppresses built-in and custom overlays', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    agLoadingOverlay: makeOverlayComp({}, 'my-suppress-loading'),
                    agNoRowsOverlay: makeOverlayComp({}, 'my-suppress-no-rows'),
                    mySuppressCustom: makeOverlayComp({}, 'my-suppress-custom'),
                },
            });

            // initial loading overlay is shown while data/columns load
            expect(document.querySelector('.my-suppress-loading')).toBeTruthy();

            api.setGridOption('activeOverlay', false);
            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            expect(document.querySelector('.my-suppress-loading')).toBeFalsy();

            api.setGridOption('loading', true);
            expect(hasLoadingOverlayWrapper()).toBeTruthy();

            api.setGridOption('loading', false);
            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlayWrapper()).toBeFalsy();
            expect(document.querySelector('.my-suppress-no-rows')).toBeFalsy();

            api.showLoadingOverlay();
            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlayWrapper()).toBeFalsy();

            api.setGridOption('rowData', [{}]);
            api.setGridOption('activeOverlay', 'mySuppressCustom');
            expect(document.querySelector('.my-suppress-custom')).toBeTruthy();

            api.setGridOption('activeOverlay', false);
            expect(hasCustomOverlayWrapper()).toBeFalsy();
            expect(document.querySelector('.my-suppress-custom')).toBeFalsy();
        });

        test('activeOverlay has higher priority than suppressLoadingOverlay and suppressNoRowsOverlay', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                suppressLoadingOverlay: true,
                suppressNoRowsOverlay: true,
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('activeOverlay', 'agLoadingOverlay');
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('activeOverlay', 'agNoRowsOverlay');
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('components.agLoadingOverlay = false suppresses the loading overlay even when loading/showLoadingOverlay invoked', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: { agLoadingOverlay: false },
            });

            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            api.setGridOption('loading', true);
            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            api.showLoadingOverlay();
            expect(hasLoadingOverlayWrapper()).toBeFalsy();
        });
    });
});

const makeOverlayComp = (paramsMap: Record<string, any>, className: string) => {
    return class {
        private e: HTMLElement;
        constructor() {
            this.e = document.createElement('div');
            this.e.className = className;
            this.e.textContent = `comp ${className}`;
        }
        public getGui() {
            return this.e;
        }
        public init(p?: any) {
            paramsMap[className] = p;
        }
        public refresh(p?: any) {
            paramsMap[className] = p;
        }
    };
};
