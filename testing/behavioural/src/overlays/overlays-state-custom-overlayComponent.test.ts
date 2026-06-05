import type { OverlayType } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlayComponent', () => {
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
        return isAgHtmlElementVisible('.ag-overlay-modal-wrapper');
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('custom loading and no-rows overlays are rendered when provided via overlayComponentSelector', async () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'loading') {
                    return {
                        component: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                    };
                } else if (params.overlayType === 'noRows') {
                    return {
                        component: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
                    };
                }
                return undefined;
            },
        });
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // By default (no rowData set) classic behaviour shows loading overlay
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeFalsy();

        // when rowData set to empty array, no-rows overlay should be shown
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

        // verify components were instantiated and received the grid api
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].api).toBeDefined();

        // ensure refresh reacts to overlayComponentParams updates (current active overlay is the no-rows overlay)
        api.setGridOption('overlayComponentParams', { fromTest: 'activeParam2' });
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('activeParam2');
        // restore to undefined
        api.setGridOption('overlayComponentParams', undefined);
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon after setGridOption overlayComponentParams #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via overlayCompon after setGridOption overlayComponentParams #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();

        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 2 });
    });

    test('loading=true and custom loading component with overlayComponentSelector', async () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'loading') {
                    return {
                        component: makeOverlayComp(capturedParams, 'my-resolve-loader'),
                        params: { fromTest: 'loadingParam' },
                    };
                }
                return undefined;
            },
            loading: true,
            rowData: [{}],
        });
        await new GridColumns(api, `loading=true and custom loading component with overlayComponentSelector setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `loading=true and custom loading component with overlayComponentSelector setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `
        );

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update overlayComponentParams should refresh the component
        api.setGridOption('overlayComponentParams', { fromTest: 'loadingParam2' });
        await new GridColumns(
            api,
            `loading=true and custom loading component with overlayComponentSelector after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true and custom loading component with overlayComponentSelector after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');

        expect(capturedParams['my-resolve-loader_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedCallbacks).toEqual({
            loading: 1,
        });
    });

    test('loading=true overlayComponent resolves to the loading overlay uses loading wrapper class', async () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myLoader: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            overlayComponent: 'myLoader',
            overlayComponentParams: { fromTest: 'loadingParam' },
            loading: true,
            rowData: [{}],
        });
        await new GridColumns(
            api,
            `loading=true overlayComponent resolves to the loading overlay uses loading wrapp setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true overlayComponent resolves to the loading overlay uses loading wrapp setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        expect(capturedParams['my-resolve-loader']?.overlayType).toBe('loading');
        // update specific loading params should refresh the component
        api.setGridOption('overlayComponentParams', { fromTest: 'loadingParam2' });
        await new GridColumns(
            api,
            `loading=true overlayComponent resolves to the loading overlay uses loading wrapp after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true overlayComponent resolves to the loading overlay uses loading wrapp after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
        expect(capturedParams['my-resolve-loader']?.overlayType).toBe('loading');

        expect(capturedParams['my-resolve-loader_Counts']).toEqual({ init: 1, refresh: 1 });
    });

    test('activeOverlay that resolves to a built in loading overlay triggers the overlayComponentSelector', () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            columnDefs,
            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'loading') {
                    return {
                        component: makeOverlayComp(capturedParams, 'my-resolve-loader'),
                        params: { fromTest: 'loadingParam' },
                    };
                }
                return undefined;
            },
            activeOverlay: 'agLoadingOverlay',
            loading: false,
            rowData: [{}],
        });
        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();

        expect(capturedParams['my-resolve-loader_Counts']).toEqual({ init: 1 });
        expect(capturedCallbacks).toEqual({
            loading: 1,
        });
    });

    test('activeOverlay that resolves to the no-rows overlay uses no-rows wrapper class', () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;
        gridsManager.createGrid('myGrid', {
            columnDefs,
            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'noRows') {
                    return {
                        component: makeOverlayComp(capturedParams, 'my-resolve-no-rows'),
                    };
                }
                return undefined;
            },
            rowData: [],
            activeOverlay: 'agNoRowsOverlay',
            loading: false,
        });
        expect(document.querySelector('.ag-overlay-no-rows-wrapper')).toBeTruthy();
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
        expect(document.querySelector('.my-resolve-no-rows')).toBeTruthy();

        expect(capturedCallbacks).toEqual({
            noRows: 1,
        });
        expect(capturedParams['my-resolve-no-rows_Counts']).toEqual({ init: 1 });
    });

    test('custom active overlay uses the custom wrapper css class', () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myCustom: makeOverlayComp(capturedParams, 'my-resolve-custom'),
            },
            overlayComponentSelector: (_) => {
                throw new Error('Should not be called');
            },
            activeOverlay: 'myCustom',
            loading: false,
            rowData: [{}],
        });

        // wrapper should be the custom wrapper class for active overlays
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-custom')).toBeTruthy();

        expect(capturedParams['my-resolve-custom_Counts']).toEqual({ init: 1 });
        expect(capturedCallbacks).toEqual({});
    });

    test('activeOverlay set to a component class uses the custom wrapper class', async () => {
        const capturedParams: Record<string, any> = {};
        const C = makeOverlayComp(capturedParams, 'my-class-custom');

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: false,
            rowData: [{}],
        });
        await new GridColumns(api, `activeOverlay set to a component class uses the custom wrapper class setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `activeOverlay set to a component class uses the custom wrapper class setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        api.setGridOption('activeOverlay', C as any);
        await new GridColumns(
            api,
            `activeOverlay set to a component class uses the custom wrapper class after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to a component class uses the custom wrapper class after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-class-custom')).toBeTruthy();
        expect(capturedParams['my-class-custom_Counts']).toEqual({ init: 1 });
    });

    test('provided overlays params should not mix with activeOverlayParams', async () => {
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
        await new GridColumns(api, `provided overlays params should not mix with activeOverlayParams setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `provided overlays params should not mix with activeOverlayParams setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // initial loading overlay should show and receive specific param
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // activeOverlayParams should not override overlay-specific params
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam2' });
        await new GridColumns(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption activeOverlayParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption activeOverlayParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // updating the specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingSpecific2' });
        await new GridColumns(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific2');

        // trigger no-rows and verify it receives its specific param
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // activeOverlayParams should not override no-rows specific params
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam3' });
        await new GridColumns(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption activeOverlayParams #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption activeOverlayParams #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // updating the specific no-rows params should refresh the component
        api.setGridOption('noRowsOverlayComponentParams', { fromTest: 'noRowsSpecific2' });
        await new GridColumns(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption noRowsOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `provided overlays params should not mix with activeOverlayParams after setGridOption noRowsOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific2');

        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
    });

    test('overlayComponentParams should not override loadingOverlayComponentParams or noRowsOverlayComponentParams to ease migration', async () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
            overlayComponentParams: { fromTest: 'overlayParam' },
            loadingOverlayComponentParams: { fromTest: 'loadingSpecific' },
            noRowsOverlayComponentParams: { fromTest: 'noRowsSpecific' },
        });
        await new GridColumns(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // initial loading overlay should show and receive specific param
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // updating the specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingSpecific2' });
        await new GridColumns(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific2');

        // trigger no-rows and verify it receives its specific param
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // overlayComponentParams should not override no-rows specific params
        api.setGridOption('overlayComponentParams', { fromTest: 'overlayComponent2' });
        await new GridColumns(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // updating the specific no-rows params should refresh the component
        api.setGridOption('noRowsOverlayComponentParams', { fromTest: 'noRowsSpecific2' });
        await new GridColumns(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption noRowsOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlayComponentParams should not override loadingOverlayComponentParams or noRo after setGridOption noRowsOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific2');

        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 2 });
    });

    test('loading/no-rows overlayComponentSelector accepts string keys from components map', async () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // register components under custom keys
            components: {
                customLoaderKey: makeOverlayComp(capturedParams, 'my-custom-loader-key'),
                customNoRowsKey: makeOverlayComp(capturedParams, 'my-custom-no-rows-key'),
            },

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'noRows') {
                    return {
                        component: 'customNoRowsKey',
                    };
                } else if (params.overlayType === 'loading') {
                    return {
                        component: 'customLoaderKey',
                    };
                }
                return undefined;
            },
            // start with loading to test loading overlay resolution
            loading: true,
        });
        await new GridColumns(
            api,
            `loading/no-rows overlayComponentSelector accepts string keys from components map setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading/no-rows overlayComponentSelector accepts string keys from components map setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `loading/no-rows overlayComponentSelector accepts string keys from components map after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading/no-rows overlayComponentSelector accepts string keys from components map after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `loading/no-rows overlayComponentSelector accepts string keys from components map after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(document.querySelector('.my-custom-no-rows-key')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key']).toBeDefined();

        expect(capturedParams['my-custom-loader-key_Counts']).toEqual({ init: 1 });
        expect(capturedParams['my-custom-no-rows-key_Counts']).toEqual({ init: 1 });
        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
    });

    test('overlayComponentSelector takes priority over loadingOverlayComponent ', async () => {
        const capturedParams: Record<string, any> = {};
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // register components under custom keys
            components: {
                customLoaderKey1: makeOverlayComp(capturedParams, 'my-custom-loader-key-1'),
                customNoRowsKey1: makeOverlayComp(capturedParams, 'my-custom-no-rows-key-1'),
                customLoaderKey2: makeOverlayComp(capturedParams, 'my-custom-loader-key-2'),
                customNoRowsKey2: makeOverlayComp(capturedParams, 'my-custom-no-rows-key-2'),
            },

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                if (params.overlayType === 'loading') {
                    return {
                        component: 'customLoaderKey2',
                    };
                }
                return undefined;
            },

            // point the overlay options at the string keys
            loadingOverlayComponent: 'customLoaderKey1',
            noRowsOverlayComponent: 'customNoRowsKey1',
            // start with loading to test loading overlay resolution
            loading: true,
            rowData: [],
        });
        await new GridColumns(api, `overlayComponentSelector takes priority over loadingOverlayComponent  setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `overlayComponentSelector takes priority over loadingOverlayComponent  setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key-2')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key-2']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `overlayComponentSelector takes priority over loadingOverlayComponent  after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `overlayComponentSelector takes priority over loadingOverlayComponent  after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlayComponentSelector takes priority over loadingOverlayComponent  after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(document.querySelector('.my-custom-no-rows-key-1')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key-1']).toBeDefined();

        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
    });

    test('suppressOverlays: [loading] does not disables loading overlay forced via activeOverlay', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            suppressOverlays: ['loading'],
        });
        await new GridColumns(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', true);
        await new GridColumns(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption loading #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption loading #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        await new GridColumns(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [loading] does not disables loading overlay forced via activeO after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
    });

    test('suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOverlay', async () => {
        expect(document.querySelector('.my-custom-no-rows-overlay1')).toBeFalsy();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            suppressOverlays: ['noRows'],
        });
        await new GridColumns(
            api,
            `suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOver setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOver setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.showNoRowsOverlay();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        await new GridColumns(
            api,
            `suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOver after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOver after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeTruthy();
    });

    test('noRows is not shown while the grid is getting ready and has rowData', async () => {
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ athlete: 'Test' }],

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                return undefined;
            },
        });

        await asyncSetTimeout(10);

        expect(capturedCallbacks).toEqual({
            // loading should not be shown as columnDefs and rowData is provided
            // noRows should not have been called
        });
    });

    test('noRows or loading is not shown while the grid is getting ready and has rowData and empty columns', async () => {
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            rowData: [{ athlete: 'Test' }],
            columnDefs: [],

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                return undefined;
            },
        });

        await asyncSetTimeout(10);

        expect(capturedCallbacks).toEqual({
            // loading should not be shown as columnDefs and rowData is provided
            // noRows should not have been called
        });
    });

    test('loading is shown while the grid is getting ready and has rowData but no columns', async () => {
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            columnDefs: undefined,
            rowData: [{ athlete: 'Test' }],

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                return undefined;
            },
        });

        await asyncSetTimeout(10);

        expect(capturedCallbacks).toEqual({
            loading: 1,
            // noRows should not have been called
        });
    });

    test('loading is shown while the grid is getting ready and has columns but no rowData', async () => {
        const capturedCallbacks: Record<OverlayType, number> = {} as any;

        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: undefined,

            overlayComponentSelector: (params) => {
                updateCallbackCounts(capturedCallbacks, params.overlayType);
                return undefined;
            },
        });

        await asyncSetTimeout(10);

        expect(capturedCallbacks).toEqual({
            loading: 1,
            // noRows should not have been called
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
            paramsMap[className] = { ...paramsMap[className + '_Counts'], ...p };
            paramsMap[className + '_Counts'] = {
                ...paramsMap[className + '_Counts'],
                init: (paramsMap[className + '_Counts']?.init ?? 0) + 1,
            };
        }
        public refresh(p?: any) {
            paramsMap[className] = { ...paramsMap[className + '_Counts'], ...p };
            paramsMap[className + '_Counts'] = {
                ...paramsMap[className + '_Counts'],
                refresh: (paramsMap[className + '_Counts']?.refresh ?? 0) + 1,
            };
        }
        public destroy() {
            this.e.remove();
        }
    };
};
const updateCallbackCounts = (callbackCounts: Record<OverlayType, number>, overlayType: OverlayType) => {
    if (!callbackCounts[overlayType]) {
        callbackCounts[overlayType] = 1;
    } else {
        callbackCounts[overlayType]++;
    }
};
