import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

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
    function hasNoMatchingRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-matching-rows-wrapper');
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
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('custom loading and no-rows overlays are rendered when provided via components map', async () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
        });
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma setup`
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
            `custom loading and no-rows overlays are rendered when provided via components ma after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

        // verify components were instantiated and received the grid api
        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].api).toBeDefined();

        // ensure refresh reacts to activeOverlayParams updates (current active overlay is the no-rows overlay)
        api.setGridOption('overlayComponentParams', { fromTest: 'activeParam2' });
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('activeParam2');
        // restore to undefined
        api.setGridOption('overlayComponentParams', undefined);
        await new GridColumns(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma after setGridOption overlayComponentParams #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `custom loading and no-rows overlays are rendered when provided via components ma after setGridOption overlayComponentParams #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();
    });

    test('activeOverlay has priority over loading=true', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: true,
            activeOverlay: 'agNoRowsOverlay',
        });
        await new GridColumns(api, `activeOverlay has priority over loading=true setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `activeOverlay has priority over loading=true setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasNoRowsOverlay()).toBeTruthy();

        const capturedParams: Record<string, any> = {};
        api.setGridOption('activeOverlay', makeOverlayComp(capturedParams, 'my-active-overlay'));
        await new GridColumns(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );

        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(document.querySelector('.my-active-overlay')).toBeTruthy();
        expect(capturedParams['my-active-overlay']).toBeDefined();

        api.setGridOption('activeOverlay', undefined);
        await new GridColumns(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay #2`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay #2`)
            .check(`
                ROOT id:ROOT_NODE_ID
            `);
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(document.querySelector('.my-active-overlay')).toBeFalsy();
    });

    test('activeOverlay set to name renders custom active overlay and hides loading/no-rows', async () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                myActiveOverlay: makeOverlayComp(capturedParams, 'my-custom-active-overlay'),
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
            },
            overlayComponentParams: { fromTest: 'overlayParam' },
            activeOverlayParams: { fromTest: 'activeParam' },
        });
        await new GridColumns(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();

        expect(capturedParams['my-custom-loading-overlay']).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].api).toBeDefined();
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('overlayParam');

        // Now trigger no-rows by setting empty rowData
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();

        // verify no-rows overlay was instantiated and received api
        expect(capturedParams['my-custom-no-rows-overlay']).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].api).toBeDefined();
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('overlayParam');

        // Clear overlays and ensure rows present so activeOverlay can take precedence
        api.setGridOption('rowData', [{}]);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption rowData #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // set activeOverlay to our custom name - should show active overlay instead
        api.setGridOption('activeOverlay', 'myActiveOverlay');
        await new GridColumns(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
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
        await new GridColumns(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlayParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlayParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-custom-active-overlay'].fromTest).toBe('activeParam2');
        // restore
        api.setGridOption('activeOverlayParams', { fromTest: 'activeParam' });
        await new GridColumns(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlayParams #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay set to name renders custom active overlay and hides loading/no-row after setGridOption activeOverlayParams #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
    });

    test('loading=true and custom component with loadingOverlayComponentParams', async () => {
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
        await new GridColumns(api, `loading=true and custom component with loadingOverlayComponentParams setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `loading=true and custom component with loadingOverlayComponentParams setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update loadingOverlayComponentParams should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingParam2' });
        await new GridColumns(
            api,
            `loading=true and custom component with loadingOverlayComponentParams after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true and custom component with loadingOverlayComponentParams after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
    });

    test('loading=true and custom component with activeOverlayParams', async () => {
        const capturedParams: Record<string, any> = {};
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-resolve-loader'),
            },
            overlayComponentParams: { fromTest: 'loadingParam' },
            loading: true,
            rowData: [{}],
        });
        await new GridColumns(api, `loading=true and custom component with activeOverlayParams setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `loading=true and custom component with activeOverlayParams setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // updating overlayComponentParams should refresh the shown loading overlay
        api.setGridOption('overlayComponentParams', { fromTest: 'loadingParam2' });
        await new GridColumns(
            api,
            `loading=true and custom component with activeOverlayParams after setGridOption overlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true and custom component with activeOverlayParams after setGridOption overlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
    });

    test('loading=true loadingOverlayComponent resolves to the loading overlay uses loading wrapper class', async () => {
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
        await new GridColumns(
            api,
            `loading=true loadingOverlayComponent resolves to the loading overlay uses loadin setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true loadingOverlayComponent resolves to the loading overlay uses loadin setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.ag-overlay-loading-wrapper')).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(document.querySelector('.my-resolve-loader')).toBeTruthy();
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam');
        // update specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingParam2' });
        await new GridColumns(
            api,
            `loading=true loadingOverlayComponent resolves to the loading overlay uses loadin after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading=true loadingOverlayComponent resolves to the loading overlay uses loadin after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
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

    test('activeOverlay built-in keys without custom components show built-in overlays and not custom wrapper', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            // start with rows present and loading false
            loading: false,
            rowData: [{}],
        });
        await new GridColumns(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // show the built-in loading overlay via activeOverlay key
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        await new GridColumns(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(hasLoadingOverlay()).toBeTruthy();
        expect(hasLoadingOverlayWrapper()).toBeTruthy();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // clearing activeOverlay should hide the loading overlay
        api.setGridOption('activeOverlay', null);
        await new GridColumns(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // trigger no-rows and show built-in no-rows overlay via activeOverlay key
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        await new GridColumns(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #3`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasNoRowsOverlay()).toBeTruthy();
        expect(hasNoRowsOverlayWrapper()).toBeTruthy();
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // clear again - ensure rows exist so the built-in no-rows overlay does not reappear
        api.setGridOption('rowData', [{}]);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption rowData #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        api.setGridOption('activeOverlay', undefined);
        await new GridColumns(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #4`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay built-in keys without custom components show built-in overlays and after setGridOption activeOverlay #4`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
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
    });

    test('overlay-specific params take priority over activeOverlayParams', async () => {
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
        await new GridColumns(api, `overlay-specific params take priority over activeOverlayParams setup`).checkColumns(
            `
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `
        );
        await new GridRows(api, `overlay-specific params take priority over activeOverlayParams setup`).check(`
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
            `overlay-specific params take priority over activeOverlayParams after setGridOption activeOverlayParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption activeOverlayParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific');

        // updating the specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingSpecific2' });
        await new GridColumns(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-loading-overlay'].fromTest).toBe('loadingSpecific2');

        // trigger no-rows and verify it receives its specific param
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption rowData`
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
            `overlay-specific params take priority over activeOverlayParams after setGridOption activeOverlayParams #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption activeOverlayParams #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific');

        // updating the specific no-rows params should refresh the component
        api.setGridOption('noRowsOverlayComponentParams', { fromTest: 'noRowsSpecific2' });
        await new GridColumns(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption noRowsOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `overlay-specific params take priority over activeOverlayParams after setGridOption noRowsOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(capturedParams['my-custom-no-rows-overlay'].fromTest).toBe('noRowsSpecific2');
    });

    test('activeOverlay has priority over loading=true', async () => {
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp(capturedParams, 'my-priority-loading-overlay'),
                myActiveOverlay: makeOverlayComp(capturedParams, 'my-priority-active-overlay'),
            },
            // ensure rows exist so that after clearing `loading` there is no built-in no-rows overlay
            rowData: [{}],
            // set both activeOverlay and loading=true; activeOverlay should win
            activeOverlay: 'myActiveOverlay',
            activeOverlayParams: { fromTest: 'activeParam' },
            loading: true,
            loadingOverlayComponentParams: { fromTest: 'loadingParam' },
        });
        await new GridColumns(api, `activeOverlay has priority over loading=true setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `activeOverlay has priority over loading=true setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // active overlay should be visible and loading overlay should not
        expect(document.querySelector('.my-priority-active-overlay')).toBeTruthy();
        expect(document.querySelector('.my-priority-loading-overlay')).toBeFalsy();

        // active overlay should receive its specific params
        expect(capturedParams['my-priority-active-overlay']).toBeDefined();
        expect(capturedParams['my-priority-active-overlay'].fromTest).toBe('activeParam');

        // now clear active overlay and loading should appear and the active overlay should appear
        api.setGridOption('activeOverlay', undefined);
        await new GridColumns(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `activeOverlay has priority over loading=true after setGridOption activeOverlay`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `
        );
        expect(document.querySelector('.my-priority-loading-overlay')).toBeTruthy();
        expect(document.querySelector('.my-priority-active-overlay')).toBeFalsy();
        expect(capturedParams['my-priority-loading-overlay']).toBeDefined();
        expect(capturedParams['my-priority-loading-overlay'].fromTest).toBe('loadingParam');
    });

    test('loading/no-rows overlay accepts string keys from components map', async () => {
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
        await new GridColumns(api, `loading/no-rows overlay accepts string keys from components map setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `loading/no-rows overlay accepts string keys from components map setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // loading overlay should be rendered via the component found by string key
        expect(document.querySelector('.my-custom-loader-key')).toBeTruthy();
        expect(capturedParams['my-custom-loader-key']).toBeDefined();

        // clear loading and trigger no-rows by setting empty rows
        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `loading/no-rows overlay accepts string keys from components map after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loading/no-rows overlay accepts string keys from components map after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('rowData', []);
        await new GridRows(
            api,
            `loading/no-rows overlay accepts string keys from components map after setGridOption rowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(document.querySelector('.my-custom-no-rows-key')).toBeTruthy();
        expect(capturedParams['my-custom-no-rows-key']).toBeDefined();
    });

    test('activeOverlay can be switched between names and classes and unset', async () => {
        // per-test captured params map
        const capturedParams: Record<string, any> = {};

        // create a named component and a class component
        const NamedComp = makeOverlayComp(capturedParams, 'my-named-overlay');
        const ClassComp = makeOverlayComp(capturedParams, 'my-class-overlay');
        const ClassComp2 = makeOverlayComp(capturedParams, 'my-class-overlay-2');

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
        await new GridColumns(api, `activeOverlay can be switched between names and classes and unset setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `activeOverlay can be switched between names and classes and unset setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // 1) set activeOverlay to the class component directly
        api.setGridOption('activeOverlay', ClassComp);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-class-overlay']).toBeDefined();

        // clear
        api.setGridOption('activeOverlay', null);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.my-class-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 2) switch to named component by name
        api.setGridOption('activeOverlay', 'namedComp');
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #3`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-named-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-named-overlay']).toBeDefined();

        // clear
        api.setGridOption('activeOverlay', undefined);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #4`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #4`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-named-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 3) switch back to the class component (by passing class again)
        api.setGridOption('activeOverlay', ClassComp);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #5`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #5`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();

        // 3.1) switch to a different class component (by passing a different class)
        api.setGridOption('activeOverlay', ClassComp2);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #6`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #6`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-class-overlay-2')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();

        // 4) set activeOverlay to null to remove active overlay
        api.setGridOption('activeOverlay', null);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #7`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #7`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-named-overlay')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();

        // 5) set activeOverlay to the class constructor function via components map reference
        api.setGridOption('activeOverlay', 'classComp');
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #8`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #8`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-class-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();

        // 6) clear again by setting activeOverlay to undefined
        api.setGridOption('activeOverlay', undefined);
        await new GridColumns(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #9`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be switched between names and classes and unset after setGridOption activeOverlay #9`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
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
        await new GridColumns(
            api,
            `activeOverlay can be set to a component directly and is shown/hidden when unset setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `activeOverlay can be set to a component directly and is shown/hidden when unset setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

        // set activeOverlay to the component class directly
        api.setGridOption('activeOverlay', DirectComp);
        await new GridColumns(
            api,
            `activeOverlay can be set to a component directly and is shown/hidden when unset after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be set to a component directly and is shown/hidden when unset after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-direct-overlay')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams.direct).toBeDefined();

        // unset activeOverlay
        api.setGridOption('activeOverlay', null);
        await new GridColumns(
            api,
            `activeOverlay can be set to a component directly and is shown/hidden when unset after setGridOption activeOverlay #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay can be set to a component directly and is shown/hidden when unset after setGridOption activeOverlay #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

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
        await new GridColumns(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // show first component directly
        api.setGridOption('activeOverlay', First);
        await new GridColumns(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-first-active')).toBeTruthy();
        expect(document.querySelector('.my-second-active')).toBeFalsy();

        // swap to second component live
        api.setGridOption('activeOverlay', Second);
        await new GridColumns(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(document.querySelector('.my-first-active')).toBeFalsy();
        expect(document.querySelector('.my-second-active')).toBeTruthy();

        // unset active overlay
        api.setGridOption('activeOverlay', null);
        await new GridColumns(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay #3`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `activeOverlay accepts a component class and can be swapped live so only the new  after setGridOption activeOverlay #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.my-second-active')).toBeNull();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('refresh updates params for shown loading overlay when loadingOverlayComponentParams change', async () => {
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
        await new GridColumns(
            api,
            `refresh updates params for shown loading overlay when loadingOverlayComponentPar setup`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `refresh updates params for shown loading overlay when loadingOverlayComponentPar setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(document.querySelector('.my-refresh-loading')).toBeTruthy();
        // initial params applied via init
        expect(capturedParams['my-refresh-loading']?.fromTest).toBe('v1');

        // update params and expect refresh to propagate
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'v2' });
        await new GridColumns(
            api,
            `refresh updates params for shown loading overlay when loadingOverlayComponentPar after setGridOption loadingOverlayComponentParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `refresh updates params for shown loading overlay when loadingOverlayComponentPar after setGridOption loadingOverlayComponentParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-refresh-loading']?.fromTest).toBe('v2');
    });

    test('refresh updates params for active overlay when activeOverlayParams change', async () => {
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
        await new GridColumns(api, `refresh updates params for active overlay when activeOverlayParams change setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `refresh updates params for active overlay when activeOverlayParams change setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

        expect(document.querySelector('.my-refresh-active')).toBeTruthy();
        expect(hasCustomOverlayWrapper()).toBeTruthy();
        expect(capturedParams['my-refresh-active']?.fromTest).toBe('a1');

        api.setGridOption('activeOverlayParams', { fromTest: 'a2' });
        await new GridColumns(
            api,
            `refresh updates params for active overlay when activeOverlayParams change after setGridOption activeOverlayParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `refresh updates params for active overlay when activeOverlayParams change after setGridOption activeOverlayParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);
        expect(capturedParams['my-refresh-active']?.fromTest).toBe('a2');
    });

    test('active overlay refreshes only when activeOverlayParams change', async () => {
        const initCalls: Array<{ id: number; params?: any }> = [];
        const refreshCalls: Array<{ id: number; params?: any }> = [];
        const destroyedIds: number[] = [];

        class TrackingActiveOverlay {
            private static nextId = 0;
            private readonly id = TrackingActiveOverlay.nextId++;
            private readonly eGui: HTMLElement;

            constructor() {
                this.eGui = document.createElement('div');
                this.eGui.className = 'tracking-active-overlay';
            }

            public init(params?: any) {
                initCalls.push({ id: this.id, params });
            }

            public refresh(params?: any) {
                refreshCalls.push({ id: this.id, params });
            }

            public getGui() {
                return this.eGui;
            }

            public destroy() {
                destroyedIds.push(this.id);
            }
        }

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            components: {
                agLoadingOverlay: makeOverlayComp({}, 'tracking-loading-overlay'),
                agNoRowsOverlay: makeOverlayComp({}, 'tracking-no-rows-overlay'),
                myActiveOverlay: TrackingActiveOverlay as any,
            },
            activeOverlay: 'myActiveOverlay',
            activeOverlayParams: { fromTest: 'active-initial' },
            rowData: [{}],
            loading: false,
        });
        await new GridColumns(api, `active overlay refreshes only when activeOverlayParams change setup`).checkColumns(
            `
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `
        );
        await new GridRows(api, `active overlay refreshes only when activeOverlayParams change setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(initCalls).toHaveLength(1);
        expect(initCalls[0]?.params?.fromTest).toBe('active-initial');
        expect(refreshCalls).toHaveLength(0);
        expect(destroyedIds).toHaveLength(0);

        api.setGridOption('activeOverlayParams', { fromTest: 'active-updated' });
        await new GridColumns(
            api,
            `active overlay refreshes only when activeOverlayParams change after setGridOption activeOverlayParams`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `active overlay refreshes only when activeOverlayParams change after setGridOption activeOverlayParams`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(refreshCalls).toHaveLength(1);
        expect(refreshCalls[0]?.params?.fromTest).toBe('active-updated');
        expect(initCalls).toHaveLength(1);
        expect(destroyedIds).toHaveLength(0);

        api.setGridOption('activeOverlay', false);
        await new GridColumns(
            api,
            `active overlay refreshes only when activeOverlayParams change after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `active overlay refreshes only when activeOverlayParams change after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        expect(destroyedIds).toHaveLength(1);
        expect(destroyedIds[0]).toBe(initCalls[0].id);
    });

    test('loadingOverlayComponent=false disables loading overlay even when forced', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loadingOverlayComponent: false,
        });
        await new GridColumns(api, `loadingOverlayComponent=false disables loading overlay even when forced setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `loadingOverlayComponent=false disables loading overlay even when forced setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );

        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', true);
        await new GridColumns(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption loading`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption loading`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();

        api.setGridOption('loading', false);
        await new GridColumns(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption loading #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption loading #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('activeOverlay', 'agLoadingOverlay');
        await new GridColumns(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `loadingOverlayComponent=false disables loading overlay even when forced after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(hasLoadingOverlay()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
    });

    test('noRowsOverlayComponent=false disables no-rows overlay even when forced', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            noRowsOverlayComponent: false,
            rowData: [],
        });
        await new GridColumns(api, `noRowsOverlayComponent=false disables no-rows overlay even when forced setup`)
            .checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
        await new GridRows(api, `noRowsOverlayComponent=false disables no-rows overlay even when forced setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );

        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.showNoRowsOverlay();
        expect(hasNoRowsOverlay()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();

        api.setGridOption('activeOverlay', 'agNoRowsOverlay');
        await new GridColumns(
            api,
            `noRowsOverlayComponent=false disables no-rows overlay even when forced after setGridOption activeOverlay`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `noRowsOverlayComponent=false disables no-rows overlay even when forced after setGridOption activeOverlay`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
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

        test('suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                components: {
                    agLoadingOverlay: makeOverlayComp({}, 'my-suppress-loading'),
                    agNoRowsOverlay: makeOverlayComp({}, 'my-suppress-no-rows'),
                    mySuppressCustom: makeOverlayComp({}, 'my-suppress-custom'),
                },
                suppressOverlays: ['loading', 'noRows'],
            });
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(document.querySelector('.my-suppress-loading')).toBeFalsy();

            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            expect(document.querySelector('.my-suppress-loading')).toBeFalsy();

            api.setGridOption('loading', true);
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption loading`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption loading`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlayWrapper()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption loading #2`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption loading #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            api.setGridOption('rowData', []);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption rowData`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlayWrapper()).toBeFalsy();
            expect(document.querySelector('.my-suppress-no-rows')).toBeFalsy();

            api.showLoadingOverlay();
            expect(hasLoadingOverlayWrapper()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlayWrapper()).toBeFalsy();

            // Only built-in overlays are suppressed via suppressOverlays; custom ones should not require suppressing as they are trigged by the application
            // Also suppressOverlays only takes a string so we cannot suppress activeOverlays by class/function reference
            api.setGridOption('rowData', [{}]);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption rowData #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            api.setGridOption('activeOverlay', 'mySuppressCustom');
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            expect(document.querySelector('.my-suppress-custom')).toBeTruthy();

            // When activeOverlay is re-using the built in overlays they should ignore suppressOverlays
            // This enables devs to suppress grid state triggering overlays but enable the provided overlays when they want to show them manually via activeOverlay
            api.setGridOption('activeOverlay', 'agLoadingOverlay');
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #2`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            expect(hasLoadingOverlayWrapper()).toBeTruthy();

            api.setGridOption('activeOverlay', 'agNoRowsOverlay');
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #3`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #3`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            expect(hasNoRowsOverlayWrapper()).toBeTruthy();

            api.setGridOption('activeOverlay', 'agNoMatchingRowsOverlay');
            await new GridColumns(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #4`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `suppressOverlays: [loading, noRows] suppresses built-in but not custom overlays after setGridOption activeOverlay #4`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
            expect(hasNoMatchingRowsOverlayWrapper()).toBeTruthy();
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
