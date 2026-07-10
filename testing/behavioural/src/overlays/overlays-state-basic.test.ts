import { waitFor } from '@testing-library/dom';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, TextFilterModule, enableDevValidations } from 'ag-grid-community';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    isAgHtmlElementVisible,
    setRowDataChecked,
} from '../test-utils';

describe('ag-grid overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: MockInstance;

    function hasLoadingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasNoMatchingRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-matching-rows-center'));
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

    function getOverlayWrapperPadding(): number {
        const wrapper = document.querySelector<HTMLElement>('.ag-overlay-wrapper');
        if (!wrapper) {
            return 0;
        }
        const padding = wrapper.style.getPropertyValue('padding-top');
        return padding ? Number.parseFloat(padding) : 0;
    }

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
        // These tests assert the functional loading/no-rows overlays; disable the dev validation
        // overlay so a deprecation/warning diagnostic does not mask them.
        enableDevValidations({ overlay: 'none' });
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    describe('deprecation warnings', () => {
        test('showLoadingOverlay', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `showLoadingOverlay setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `showLoadingOverlay setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            api.showLoadingOverlay();
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            await new GridRows(api, `showLoadingOverlay final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

        test('should hide the loading overlay when rows are added', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `should hide the loading overlay when rows are added setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `should hide the loading overlay when rows are added setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();

            setRowDataChecked(api, [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();
            await new GridRows(api, `should hide the loading overlay when rows are added final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);
        });

        test('should hide the loading overlay when rows are added via a transaction', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `should hide the loading overlay when rows are added via a transaction setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `should hide the loading overlay when rows are added via a transaction setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            expect(hasLoadingOverlay()).toBeTruthy();

            applyTransactionChecked(api, {
                add: [{}, {}],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            await new GridRows(api, `should hide the loading overlay when rows are added via a transaction final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `);
        });

        test('should show no-rows overlay when empty rows are loaded', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `should show no-rows overlay when empty rows are loaded setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `should show no-rows overlay when empty rows are loaded setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasNoRowsOverlay()).toBeTruthy();
            await new GridRows(api, `should show no-rows overlay when empty rows are loaded final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('should show no-rows overlay when empty rows are loaded via a transaction', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `should show no-rows overlay when empty rows are loaded via a transaction setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `should show no-rows overlay when empty rows are loaded via a transaction setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            expect(hasNoRowsOverlay()).toBeFalsy();

            applyTransactionChecked(api, {
                add: [],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
            await new GridRows(
                api,
                `should show no-rows overlay when empty rows are loaded via a transaction final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        describe('with suppressNoRowsOverlay', () => {
            test('should not show no-rows overlay with initial empty rows', () => {
                gridsManager.createGrid('myGrid', { columnDefs, suppressNoRowsOverlay: true, rowData: [] });
                expect(hasNoRowsOverlay()).toBeFalsy();
            });

            test('should not show no-rows overlay when empty rows are loaded', async () => {
                const api = gridsManager.createGrid('myGrid', { columnDefs, suppressNoRowsOverlay: true });
                await new GridColumns(api, `should not show no-rows overlay when empty rows are loaded setup`)
                    .checkColumns(`
                        CENTER
                        ├── athlete "Athlete" width:200
                        ├── sport "Sport" width:200
                        └── age "Age" width:200
                    `);
                await new GridRows(api, `should not show no-rows overlay when empty rows are loaded setup`).check(`
                    ROOT id:ROOT_NODE_ID
                `);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeTruthy();

                setRowDataChecked(api, []);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();

                applyTransactionChecked(api, { add: [] });
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();

                setRowDataChecked(api, [{}]);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();
                await new GridRows(api, `should not show no-rows overlay when empty rows are loaded final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        └── LEAF id:0
                    `
                );
            });
        });

        describe('with suppressLoadingOverlay', () => {
            test('should not show loading overlay with initial empty rows', () => {
                gridsManager.createGrid('myGrid', { columnDefs, suppressLoadingOverlay: true, rowData: [] });
                expect(hasLoadingOverlay()).toBeFalsy();
                expect(hasNoRowsOverlay()).toBeTruthy();
            });

            test('should show no-rows overlay', async () => {
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    suppressLoadingOverlay: true,
                });
                await new GridColumns(api, `should show no-rows overlay setup`).checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
                await new GridRows(api, `should show no-rows overlay setup`).check(`
                    ROOT id:ROOT_NODE_ID
                `);

                expect(hasLoadingOverlay()).toBeFalsy();
                expect(hasNoRowsOverlay()).toBeTruthy();

                setRowDataChecked(api, []);
                expect(hasLoadingOverlay()).toBeFalsy();
                expect(hasNoRowsOverlay()).toBeTruthy();

                setRowDataChecked(api, [{}]);
                expect(hasNoRowsOverlay()).toBeFalsy();
                expect(hasLoadingOverlay()).toBeFalsy();
                await new GridRows(api, `should show no-rows overlay final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `);
            });
        });

        test('setting the rowdata and coldefs to undefined does not cause loading to reappear', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();

            setRowDataChecked(api, [{ athlete: 'Michael Phelps', country: 'US' }]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', undefined);
            await new GridColumns(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps"
            `);
            expect(hasLoadingOverlay()).toBeFalsy();

            setRowDataChecked(api, undefined);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear after setGridOption columnDefs #2`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `setting the rowdata and coldefs to undefined does not cause loading to reappear after setGridOption columnDefs #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps"
            `);
            expect(hasLoadingOverlay()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            setRowDataChecked(api, [{ athlete: 'Michael Phelps', country: 'US' }]);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();
        });

        test('it behaves correctly also when columns are set after rows', async () => {
            const api = gridsManager.createGrid('myGrid', { rowData: [{ athlete: 'Michael Phelps', country: 'US' }] });
            await new GridColumns(api, `it behaves correctly also when columns are set after rows setup`).checkColumns(
                ``
            );
            await new GridRows(api, `it behaves correctly also when columns are set after rows setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();

            api.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                api,
                `it behaves correctly also when columns are set after rows after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `it behaves correctly also when columns are set after rows after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps"
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            api.setGridOption('columnDefs', undefined);
            await new GridColumns(
                api,
                `it behaves correctly also when columns are set after rows after setGridOption columnDefs #2`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `it behaves correctly also when columns are set after rows after setGridOption columnDefs #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps"
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();
        });
    });

    describe('When loading=true:', () => {
        test('Loading overlay is displayed even if rowData=undefined', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('loading = true has precedence over rowData=[]', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(api, `loading = true has precedence over rowData=[] setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `loading = true has precedence over rowData=[] setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            await new GridRows(api, `loading = true has precedence over rowData=[] after setGridOption rowData`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', columnDefs);
            await new GridColumns(api, `loading = true has precedence over rowData=[] after setGridOption columnDefs`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading = true has precedence over rowData=[] after setGridOption columnDefs`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `); // to force a refresh

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `loading = true has precedence over rowData=[] after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading = true has precedence over rowData=[] after setGridOption loading`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('When rowData=null/undefined or empty array, no rows overlay is not displayed', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(
                api,
                `When rowData=null/undefined or empty array, no rows overlay is not displayed setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `When rowData=null/undefined or empty array, no rows overlay is not displayed setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, undefined);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            await new GridRows(
                api,
                `When rowData=null/undefined or empty array, no rows overlay is not displayed final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('When rowData is an array, rows are shown in the grid and the loading overlay on top of them', async () => {
            let api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [{}] });
            await new GridColumns(
                api,
                `When rowData is an array, rows are shown in the grid and the loading overlay on  setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `When rowData is an array, rows are shown in the grid and the loading overlay on  setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.destroy();

            api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

            setRowDataChecked(api, [{}]);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.destroy();

            api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

            applyTransactionChecked(api, { add: [{}] });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();
            await new GridRows(
                api,
                `When rowData is an array, rows are shown in the grid and the loading overlay on  final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('loading=true has higher priority than suppressLoadingOverlay', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, suppressLoadingOverlay: true });
            await new GridColumns(api, `loading=true has higher priority than suppressLoadingOverlay setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading=true has higher priority than suppressLoadingOverlay setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            await new GridRows(api, `loading=true has higher priority than suppressLoadingOverlay final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('Calls to api.showLoadingOverlay() will have no effect', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(api, `Calls to api.showLoadingOverlay() will have no effect setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `Calls to api.showLoadingOverlay() will have no effect setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            await new GridRows(api, `Calls to api.showLoadingOverlay() will have no effect final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('Calls to api.showNoRowsOverlay() will have no effect', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(api, `Calls to api.showNoRowsOverlay() will have no effect setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `Calls to api.showNoRowsOverlay() will have no effect setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            await new GridRows(api, `Calls to api.showNoRowsOverlay() will have no effect final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('Calls to api.hideOverlay() will have no effect', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(api, `Calls to api.hideOverlay() will have no effect setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `Calls to api.hideOverlay() will have no effect setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeTruthy();
            await new GridRows(api, `Calls to api.hideOverlay() will have no effect final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('When loading=false:', () => {
        test('Before rowData is set, grid is not showing the loading overlay and shows the no rows overlay', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('When rowData=null/undefined or empty array shows no rows overlay', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            await new GridColumns(api, `When rowData=null/undefined or empty array shows no rows overlay setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `When rowData=null/undefined or empty array shows no rows overlay setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();

            setRowDataChecked(api, []);
            expect(hasNoRowsOverlay()).toBeTruthy();

            setRowDataChecked(api, undefined);
            expect(hasNoRowsOverlay()).toBeTruthy();
            await new GridRows(api, `When rowData=null/undefined or empty array shows no rows overlay final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        test('When rowData is an array, grid shows rows normally', () => {
            gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [{}] });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('Calls to api.showLoadingOverlay() will have no effect', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            await new GridColumns(api, `Calls to api.showLoadingOverlay() will have no effect setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `Calls to api.showLoadingOverlay() will have no effect setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showLoadingOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
            await new GridRows(api, `Calls to api.showLoadingOverlay() will have no effect final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('Calls to api.showNoRowsOverlay() will work normally and the no rows overlay shown', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            await new GridColumns(
                api,
                `Calls to api.showNoRowsOverlay() will work normally and the no rows overlay show setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `Calls to api.showNoRowsOverlay() will work normally and the no rows overlay show setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();
            await new GridRows(
                api,
                `Calls to api.showNoRowsOverlay() will work normally and the no rows overlay show final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('Calls to api.hideOverlay() will work normally to hide the no rows overlay if shown', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            await new GridColumns(
                api,
                `Calls to api.hideOverlay() will work normally to hide the no rows overlay if sho setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `Calls to api.hideOverlay() will work normally to hide the no rows overlay if sho setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
            await new GridRows(
                api,
                `Calls to api.hideOverlay() will work normally to hide the no rows overlay if sho final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('update, with loading initially set to true', () => {
        test('initial no rows, loading true has priority', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });
            await new GridColumns(api, `initial no rows, loading true has priority setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial no rows, loading true has priority setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial no rows, loading true has priority after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial no rows, loading true has priority after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            setRowDataChecked(api, [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial no rows, loading true has priority after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial no rows, loading true has priority after setGridOption loading #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `
            );
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial no rows, loading true has priority after setGridOption loading #3`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial no rows, loading true has priority after setGridOption loading #3`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `
            ); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `initial no rows, loading true has priority after setGridOption loading #4`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial no rows, loading true has priority after setGridOption loading #4`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `
            );
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();
        });

        test('initial empty rows, loading true has priority', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [] });
            await new GridColumns(api, `initial empty rows, loading true has priority setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial empty rows, loading true has priority setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial empty rows, loading true has priority after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial empty rows, loading true has priority after setGridOption loading`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            ); // undefined is coerced to false
            expect(hasNoRowsOverlay()).toBeTruthy();

            setRowDataChecked(api, [{}, {}]);
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial empty rows, loading true has priority after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial empty rows, loading true has priority after setGridOption loading #2`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial empty rows, loading true has priority after setGridOption loading #3`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial empty rows, loading true has priority after setGridOption loading #3`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `initial empty rows, loading true has priority after setGridOption loading #4`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial empty rows, loading true has priority after setGridOption loading #4`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0
                    └── LEAF id:1
                `);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('initial rows, loading true has priority', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, rowData: [{}, {}] });
            await new GridColumns(api, `initial rows, loading true has priority setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial rows, loading true has priority setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial rows, loading true has priority after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial rows, loading true has priority after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial rows, loading true has priority after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial rows, loading true has priority after setGridOption loading #2`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial rows, loading true has priority after setGridOption loading #3`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial rows, loading true has priority after setGridOption loading #3`).check(`
                ROOT id:ROOT_NODE_ID
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `initial rows, loading true has priority after setGridOption loading #4`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `initial rows, loading true has priority after setGridOption loading #4`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('suppressLoadingOverlay has less priority', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true, suppressLoadingOverlay: true });
            await new GridColumns(api, `suppressLoadingOverlay has less priority setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `suppressLoadingOverlay has less priority setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `suppressLoadingOverlay has less priority after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `suppressLoadingOverlay has less priority after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `suppressLoadingOverlay has less priority after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `suppressLoadingOverlay has less priority after setGridOption loading #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            setRowDataChecked(api, []);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, [{}]);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `suppressLoadingOverlay has less priority after setGridOption loading #3`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `suppressLoadingOverlay has less priority after setGridOption loading #3`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0
                `
            );
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });
    });

    // If the user has called api.showNoRowsOverlay(), we respect that choice and do not show the provided overlays until
    // the user calls api.hideOverlay()
    describe('user shows no rows overlay manually', () => {
        test('loading true has priority over user action', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `loading true has priority over user action setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `loading true has priority over user action setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();

            api.hideOverlay();
            expect(hasLoadingOverlay()).toBeFalsy();

            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `loading true has priority over user action after setGridOption loading`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading true has priority over user action after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `loading true has priority over user action after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading true has priority over user action after setGridOption loading #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();

            api.hideOverlay();

            // No overlay should be shown
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();

            api.setGridOption('columnDefs', columnDefs);
            await new GridColumns(api, `loading true has priority over user action after setGridOption columnDefs`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading true has priority over user action after setGridOption columnDefs`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            ); // to force a refresh which triggers overlay logic to run

            // This is potentially not what the user would expect but this is where the activeOverlay feature will work
            // a lot cleaner for them if they want to take control of overlays.
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('manual hide priority over user action', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{}] });
            await new GridColumns(api, `manual hide priority over user action setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `manual hide priority over user action setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            expect(hasLoadingOverlay()).toBeFalsy();
            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.hideOverlay();

            expect(hasNoRowsOverlay()).toBeFalsy();
            await new GridRows(api, `manual hide priority over user action final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('update, with loading initially set to false', () => {
        test('initial no rows, loading false', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false });
            await new GridColumns(api, `initial no rows, loading false setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial no rows, loading false setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial no rows, loading false after setGridOption loading`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial no rows, loading false after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial no rows, loading false after setGridOption loading #2`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `initial no rows, loading false after setGridOption loading #2`).check(`
                ROOT id:ROOT_NODE_ID
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('initial empty rows, loading false', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [] });
            await new GridColumns(api, `initial empty rows, loading false setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial empty rows, loading false setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial empty rows, loading false after setGridOption loading`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `initial empty rows, loading false after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial empty rows, loading false after setGridOption loading #2`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `initial empty rows, loading false after setGridOption loading #2`).check(`
                ROOT id:ROOT_NODE_ID
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('initial rows, loading false', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, rowData: [{}, {}] });
            await new GridColumns(api, `initial rows, loading false setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial rows, loading false setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `initial rows, loading false after setGridOption loading`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial rows, loading false after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', undefined);
            await new GridColumns(api, `initial rows, loading false after setGridOption loading #2`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `initial rows, loading false after setGridOption loading #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0
                └── LEAF id:1
            `); // undefined is coerced to false
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('suppressLoadingOverlay has no effect', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, suppressLoadingOverlay: true });
            await new GridColumns(api, `suppressLoadingOverlay has no effect setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `suppressLoadingOverlay has no effect setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);
            await new GridColumns(api, `suppressLoadingOverlay has no effect after setGridOption loading`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `suppressLoadingOverlay has no effect after setGridOption loading`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('loading', false);
            await new GridColumns(api, `suppressLoadingOverlay has no effect after setGridOption loading #2`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `suppressLoadingOverlay has no effect after setGridOption loading #2`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('suppressNoRowsOverlay has priority', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, loading: false, suppressNoRowsOverlay: true });
            await new GridColumns(api, `suppressNoRowsOverlay has priority setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `suppressNoRowsOverlay has priority setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            setRowDataChecked(api, [{}]);
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            await new GridRows(api, `suppressNoRowsOverlay has priority final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('changing suppressNoRowsOverlay option', () => {
        test('it gets applied next time the no-rows is shown and cannot be used to hide the current no-rows overlay (partially reactive)', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [] });
            await new GridColumns(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            api.setGridOption('suppressNoRowsOverlay', true);
            await new GridColumns(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu after setGridOption suppressNoRowsOverlay`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu after setGridOption suppressNoRowsOverlay`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            setRowDataChecked(api, []);
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            api.setGridOption('suppressNoRowsOverlay', false);
            await new GridColumns(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu after setGridOption suppressNoRowsOverlay #2`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu after setGridOption suppressNoRowsOverlay #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();

            api.setGridOption('rowData', []);
            await new GridRows(
                api,
                `it gets applied next time the no-rows is shown and cannot be used to hide the cu after setGridOption rowData`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasCustomOverlayWrapper()).toBeFalsy();
        });
    });

    describe('overlay wrapper padding', () => {
        test('no rows overlay applies header padding when first shown', async () => {
            const headerHeight = 64;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23 }],
                headerHeight,
            });
            await new GridColumns(api, `no rows overlay applies header padding when first shown setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `no rows overlay applies header padding when first shown setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" sport:"Swimming" age:23
            `);

            expect(getOverlayWrapperPadding()).toBe(0);

            api.setGridOption('rowData', []);
            await new GridRows(
                api,
                `no rows overlay applies header padding when first shown after setGridOption rowData`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            await waitFor(() => expect(hasNoRowsOverlay()).toBeTruthy());
            await waitFor(() => expect(getOverlayWrapperPadding()).toBe(headerHeight));
        });

        test('no rows overlay applies header padding after loading overlay', async () => {
            const headerHeight = 72;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                loading: true,
                headerHeight,
            });
            await new GridColumns(api, `no rows overlay applies header padding after loading overlay setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `no rows overlay applies header padding after loading overlay setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            await waitFor(() => expect(hasLoadingOverlay()).toBeTruthy());
            expect(getOverlayWrapperPadding()).toBe(0);

            api.setGridOption('rowData', []);
            await new GridRows(
                api,
                `no rows overlay applies header padding after loading overlay after setGridOption rowData`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await waitFor(() => expect(hasLoadingOverlay()).toBeTruthy());
            expect(getOverlayWrapperPadding()).toBe(0);

            api.setGridOption('loading', false);
            await new GridColumns(
                api,
                `no rows overlay applies header padding after loading overlay after setGridOption loading`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `no rows overlay applies header padding after loading overlay after setGridOption loading`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            await waitFor(() => expect(hasNoRowsOverlay()).toBeTruthy());
            await waitFor(() => expect(getOverlayWrapperPadding()).toBe(headerHeight));
        });
    });

    describe('Updating data transactions hide noRows when providing data', () => {
        test('loading is hidden when data provided via applyTransaction', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: undefined,
                defaultColDef: { filter: true },
                getRowId: (params) => {
                    return params.data.athlete;
                },
            });
            await new GridColumns(api, `loading is hidden when data provided via applyTransaction setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `
            );
            await new GridRows(api, `loading is hidden when data provided via applyTransaction setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.applyTransaction({
                add: [{ athlete: 'Test' }],
            });
            await new GridRows(api, `loading is hidden when data provided via applyTransaction after applyTransaction`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:Test athlete:"Test"
                `);

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.applyTransaction({
                remove: [{ athlete: 'Test' }],
            });
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransaction after applyTransaction #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.applyTransaction({
                add: [{ athlete: 'One' }, { athlete: 'Two' }],
            });
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransaction after applyTransaction #3`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:One athlete:"One"
                └── LEAF id:Two athlete:"Two"
            `);

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setFilterModel({ athlete: { type: 'contains', filter: 'NoMatch' } });
            await new GridRows(api, `loading is hidden when data provided via applyTransaction after setFilterModel`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('no rows is shown when transactions remove all rows provided via rowData', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'One' }, { athlete: 'Two' }],
                getRowId: (params) => {
                    return params.data.athlete;
                },
            });
            await new GridColumns(api, `no rows is shown when transactions remove all rows provided via rowData setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `no rows is shown when transactions remove all rows provided via rowData setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:One athlete:"One"
                    └── LEAF id:Two athlete:"Two"
                `);

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.applyTransaction({
                remove: [{ athlete: 'One' }, { athlete: 'Two' }],
            });
            await new GridRows(
                api,
                `no rows is shown when transactions remove all rows provided via rowData after applyTransaction`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasLoadingOverlay()).toBeFalsy();
            // No Rows is still shown even gos.get('rowData') will return 2 rows
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('loading is hidden when data provided via applyTransactionAsync', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: undefined,
                getRowId: (params) => {
                    return params.data.athlete;
                },
                defaultColDef: {
                    filter: true,
                },
            });
            await new GridColumns(api, `loading is hidden when data provided via applyTransactionAsync setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── sport "Sport" width:200
                    └── age "Age" width:200
                `);
            await new GridRows(api, `loading is hidden when data provided via applyTransactionAsync setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            let transactionApplied: any = undefined;
            let promise = new Promise((resolve) => (transactionApplied = resolve));

            api.applyTransactionAsync(
                {
                    add: [{ athlete: 'Test' }],
                },
                () => {
                    transactionApplied();
                }
            );
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransactionAsync after applyTransactionAsync`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await promise;

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            promise = new Promise((resolve) => (transactionApplied = resolve));
            api.applyTransactionAsync(
                {
                    remove: [{ athlete: 'Test' }],
                },
                () => {
                    transactionApplied();
                }
            );
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransactionAsync after applyTransactionAsync #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:Test athlete:"Test"
            `);
            await promise;

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();

            promise = new Promise((resolve) => (transactionApplied = resolve));
            api.applyTransactionAsync(
                {
                    add: [{ athlete: 'One' }, { athlete: 'Two' }],
                },
                () => {
                    transactionApplied();
                }
            );
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransactionAsync after applyTransactionAsync #3`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await promise;

            api.setFilterModel({ athlete: { type: 'contains', filter: 'NoMatch' } });
            await new GridRows(
                api,
                `loading is hidden when data provided via applyTransactionAsync after setFilterModel`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });
    });
});
