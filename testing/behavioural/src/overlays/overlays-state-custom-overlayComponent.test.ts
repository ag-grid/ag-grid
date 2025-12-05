import type { OverlayType } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

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

    test('custom loading and no-rows overlays are rendered when provided via overlayComponentSelector', () => {
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

        // ensure refresh reacts to overlayComponentParams updates (current active overlay is the no-rows overlay)
        api.setGridOption('overlayComponentParams', { fromTest: 'activeParam2' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('activeParam2');
        // restore to undefined
        api.setGridOption('overlayComponentParams', undefined);

        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();

        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 2 });
    });

    test('loading=true and custom loading component with overlayComponentSelector', () => {
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

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update overlayComponentParams should refresh the component
        api.setGridOption('overlayComponentParams', { fromTest: 'loadingParam2' });
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');

        expect(capturedParams['my-resolve-loader_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedCallbacks).toEqual({
            loading: 1,
        });
    });

    test('loading=true overlayComponent resolves to the loading overlay uses loading wrapper class', () => {
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

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        expect(capturedParams['my-resolve-loader']?.overlayType).toBe('loading');
        // update specific loading params should refresh the component
        api.setGridOption('overlayComponentParams', { fromTest: 'loadingParam2' });

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
        expect(capturedParams['my-class-custom_Counts']).toEqual({ init: 1 });
    });

    test('provided overlays params should not mix with activeOverlayParams', () => {
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

        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
    });

    test('overlayComponentParams should not override loadingOverlayComponentParams or noRowsOverlayComponentParams to ease migration', () => {
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

        // initial loading overlay should show and receive specific param
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // updating the specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingSpecific2' });
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific2');

        // trigger no-rows and verify it receives its specific param
        api.setGridOption('rowData', []);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // overlayComponentParams should not override no-rows specific params
        api.setGridOption('overlayComponentParams', { fromTest: 'overlayComponent2' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // updating the specific no-rows params should refresh the component
        api.setGridOption('noRowsOverlayComponentParams', { fromTest: 'noRowsSpecific2' });
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific2');

        expect(capturedParams['my-custom-loading-overlay_Counts']).toEqual({ init: 1, refresh: 1 });
        expect(capturedParams['my-custom-no-rows-overlay_Counts']).toEqual({ init: 1, refresh: 2 });
    });

    test('loading/no-rows overlayComponentSelector accepts string keys from components map', () => {
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

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('loading', false);
        api.setGridOption('rowData', []);

        expect(document.querySelector('.my-custom-no-rows-key')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key']).toBeDefined();

        expect(capturedParams['my-custom-loader-key_Counts']).toEqual({ init: 1 });
        expect(capturedParams['my-custom-no-rows-key_Counts']).toEqual({ init: 1 });
        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
    });

    test('overlayComponentSelector takes priority over loadingOverlayComponent ', () => {
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

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key-2')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key-2']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('rowData', []);
        api.setGridOption('loading', false);

        expect(document.querySelector('.my-custom-no-rows-key-1')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key-1']).toBeDefined();

        expect(capturedCallbacks).toEqual({
            loading: 1,
            noRows: 1,
        });
    });

    test('suppressOverlays: [loading] does not disables loading overlay forced via activeOverlay', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            suppressOverlays: ['loading'],
        });

        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', true);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', false);
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
    });

    test('suppressOverlays: [noRows] disables no-rows overlay unless forced via activeOverlay', () => {
        expect(document.querySelector('.my-custom-no-rows-overlay1')).toBeFalsy();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [],
            suppressOverlays: ['noRows'],
        });

        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.showNoRowsOverlay();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeTruthy();
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
