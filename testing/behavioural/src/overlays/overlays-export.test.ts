import { waitFor } from '@testing-library/dom';

import type { IOverlayParams } from 'ag-grid-community';
import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid export overlay', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    // Store original implementations for cleanup
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalMouseEvent = (global as any).MouseEvent;
    const originalCompressionStream = (window as any).CompressionStream;
    const originalBlobArrayBuffer = (Blob.prototype as any).arrayBuffer;

    // function hasLoadingOverlay() {
    //     return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    // }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasExportingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-exporting-center'));
    }

    function hasLoadingOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-loading-wrapper');
    }

    function hasNoRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper');
    }
    function hasExportingOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-exporting-wrapper');
    }

    function hasCustomOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-modal-wrapper');
    }

    beforeEach(() => {
        gridsManager.reset();
        // Mock URL.createObjectURL to prevent actual blob URL creation
        URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        URL.revokeObjectURL = jest.fn(() => 'blob:mock-url');
        // Polyfill Blob.arrayBuffer if missing in the test environment
        if (typeof (Blob.prototype as any).arrayBuffer !== 'function') {
            (Blob.prototype as any).arrayBuffer = function () {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsArrayBuffer(this as Blob);
                });
            };
        }
        // Mock MouseEvent to handle window parameter
        (global as any).MouseEvent = jest.fn(function (type: string, init?: any) {
            return new Event(type, { bubbles: init?.bubbles, cancelable: init?.cancelable });
        });
        // Mock CompressionStream to a pass-through TransformStream (if available)
        (window as any).CompressionStream = jest.fn((_format: string) => {
            if (typeof (global as any).TransformStream === 'function') {
                return new (global as any).TransformStream({
                    transform(chunk: any, controller: any) {
                        controller.enqueue(chunk);
                    },
                });
            }

            // Fallback: provide a minimal object with readable/writable that will allow pipeThrough to be called
            return {
                readable: {} as any,
                writable: {} as any,
            };
        });
    });

    afterEach(() => {
        gridsManager.reset();
        // Restore original implementations
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        (global as any).MouseEvent = originalMouseEvent;
        (window as any).CompressionStream = originalCompressionStream;
        // Restore Blob.arrayBuffer if we polyfilled it
        (Blob.prototype as any).arrayBuffer = originalBlobArrayBuffer;
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    describe('CSV', () => {
        test('csv export shows the export overlay', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
            });
            await new GridColumns(api, `csv export shows the export overlay setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `csv export shows the export overlay setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // Initially no overlay should be shown
            expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();

            // When CSV export starts, loading overlay should be shown
            api.exportDataAsCsv();
            await waitFor(() => {
                expect(hasExportingOverlay()).toBeTruthy();
                expect(hasExportingOverlayWrapper()).toBeTruthy();
            });

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

            await waitFor(() => {
                expect(hasExportingOverlay()).toBeFalsy();
                expect(hasExportingOverlayWrapper()).toBeFalsy();
            });
            await new GridRows(api, `csv export shows the export overlay final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('csv export shows a custom export overlay', async () => {
            const capturedParams: Record<string, any> = {};
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
                components: {
                    agExportingOverlay: makeOverlayComp(capturedParams, 'my-custom-loading-overlay'),
                },
            });
            await new GridColumns(api, `csv export shows a custom export overlay setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `csv export shows a custom export overlay setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // Initially no overlay should be shown
            expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();

            // When CSV export starts, loading overlay should be shown
            api.exportDataAsCsv();
            await waitFor(() => {
                expect(document.querySelector('.my-custom-loading-overlay')).toBeTruthy();
            });

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());
            await waitFor(() => {
                expect(document.querySelector('.my-custom-loading-overlay')).toBeFalsy();
            });
            await new GridRows(api, `csv export shows a custom export overlay final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('csv export suppressed via suppressOverlays', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
                suppressOverlays: ['exporting'],
            });
            await new GridColumns(api, `csv export suppressed via suppressOverlays setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `csv export suppressed via suppressOverlays setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // Initially no overlay should be shown
            expect(hasExportingOverlay()).toBeFalsy();

            // When CSV export starts, loading overlay should be shown
            api.exportDataAsCsv();
            await waitFor(() => {
                expect(hasExportingOverlay()).toBeFalsy();
            });

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());
            await waitFor(() => {
                expect(hasExportingOverlay()).toBeFalsy();
            });
            await new GridRows(api, `csv export suppressed via suppressOverlays final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('export overlay does not override an overlay shown via api.showNoRowsOverlay', async () => {
            // Test is to show we don't break an existing implementation where a dev has used the noRowsOverlay to show
            // a custom overlay during the export of the csv
            const capturedParams: Record<string, any> = {};
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
                components: {
                    agNoRowsOverlay: makeOverlayComp(capturedParams, 'my-custom-no-rows-overlay'),
                },
            });
            await new GridColumns(
                api,
                `export overlay does not override an overlay shown via api.showNoRowsOverlay setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `export overlay does not override an overlay shown via api.showNoRowsOverlay setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
                `);

            // Show the no rows overlay explicitly
            api.showNoRowsOverlay();
            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
            expect(hasExportingOverlay()).toBeFalsy();

            // When CSV export starts, no-rows overlay should still be shown
            api.exportDataAsCsv();

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeTruthy();
            expect(hasExportingOverlay()).toBeFalsy();

            api.hideOverlay();

            expect(document.querySelector('.my-custom-no-rows-overlay')).toBeFalsy();
            expect(hasExportingOverlay()).toBeFalsy();
            await new GridRows(
                api,
                `export overlay does not override an overlay shown via api.showNoRowsOverlay final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('csv export overlay calls overlayComponentSelector', async () => {
            let selectorCallParams: any;
            const capturedParams: Record<string, any> = {};

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
                overlayComponentSelector: (params: IOverlayParams) => {
                    if (params.overlayType === 'exporting') {
                        selectorCallParams = params;
                        return {
                            component: makeOverlayComp(capturedParams, 'my-custom-exporting-overlay'),
                            params: { exportName: 'csv' },
                        };
                    }
                },
            });
            await new GridColumns(api, `csv export overlay calls overlayComponentSelector setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `csv export overlay calls overlayComponentSelector setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // When CSV export starts
            api.exportDataAsCsv();
            expect(document.querySelector('.my-custom-exporting-overlay')).toBeTruthy();

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

            // Verify overlayComponentSelector was called with csv export params
            expect(selectorCallParams).toBeDefined();
            expect(selectorCallParams.overlayType).toBe('exporting');

            expect(capturedParams['my-custom-exporting-overlay'].exportName).toBe('csv');

            await waitFor(() => expect(document.querySelector('.my-custom-exporting-overlay')).toBeFalsy());
            await new GridRows(api, `csv export overlay calls overlayComponentSelector final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('export overlay does not override an activeOverlay', async () => {
            const capturedParams: Record<string, any> = {};
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
                activeOverlay: makeOverlayComp(capturedParams, 'my-active-overlay'),
            });
            await new GridColumns(api, `export overlay does not override an activeOverlay setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `export overlay does not override an activeOverlay setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // Active overlay should be shown
            expect(document.querySelector('.my-active-overlay')).toBeTruthy();

            // When CSV export starts, active overlay should still be shown
            api.exportDataAsCsv();

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

            expect(document.querySelector('.my-active-overlay')).toBeTruthy();
            await new GridRows(api, `export overlay does not override an activeOverlay final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });

        test('csv export shows the export overlay and reverts to no rows if that was shown before', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [],
            });
            await new GridColumns(
                api,
                `csv export shows the export overlay and reverts to no rows if that was shown bef setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `csv export shows the export overlay and reverts to no rows if that was shown bef setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Initially no rows overlay should be shown
            expect(hasNoRowsOverlay).toBeTruthy();

            // When CSV export starts, loading overlay should be shown
            api.exportDataAsCsv();
            await waitFor(() => {
                expect(hasExportingOverlay()).toBeTruthy();
                expect(hasExportingOverlayWrapper()).toBeTruthy();
                expect(hasNoRowsOverlay()).toBeFalsy();
            });

            await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
            await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

            await waitFor(() => {
                expect(hasExportingOverlay()).toBeFalsy();
                expect(hasExportingOverlayWrapper()).toBeFalsy();
                expect(hasNoRowsOverlay()).toBeTruthy();
            });
            await new GridRows(
                api,
                `csv export shows the export overlay and reverts to no rows if that was shown bef final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('Excel', () => {
        test('excel export shows the export overlay', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
            });
            await new GridColumns(api, `excel export shows the export overlay setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── sport "Sport" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `excel export shows the export overlay setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);

            // When excel export starts, exporting overlay should be shown
            api.exportDataAsExcel();

            await waitFor(() => {
                expect(hasExportingOverlay()).toBeTruthy();
                expect(hasExportingOverlayWrapper()).toBeTruthy();
            });

            await waitFor(() => expect((window as any).CompressionStream).toHaveBeenCalled());

            await waitFor(() => {
                expect(hasExportingOverlay()).toBeFalsy();
                expect(hasExportingOverlayWrapper()).toBeFalsy();
            });
            await new GridRows(api, `excel export shows the export overlay final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
            `);
        });
    });

    test('excel export overlay calls overlayComponentSelector', async () => {
        let selectorCallParams: any;
        const capturedParams: Record<string, any> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ athlete: 'John', sport: 'Tennis', age: 25 }],
            overlayComponentSelector: (params: IOverlayParams) => {
                if (params.overlayType === 'exporting') {
                    selectorCallParams = params;
                    return {
                        component: makeOverlayComp(capturedParams, 'my-custom-exporting-overlay'),
                        params: { exportName: 'excel' },
                    };
                }
            },
        });
        await new GridColumns(api, `excel export overlay calls overlayComponentSelector setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── sport "Sport" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `excel export overlay calls overlayComponentSelector setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
        `);

        // When CSV export starts
        api.exportDataAsExcel();
        expect(document.querySelector('.my-custom-exporting-overlay')).toBeTruthy();

        await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
        await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());

        // Verify overlayComponentSelector was called with csv export params
        expect(selectorCallParams).toBeDefined();
        expect(selectorCallParams.overlayType).toBe('exporting');

        expect(capturedParams['my-custom-exporting-overlay'].exportName).toBe('excel');

        await waitFor(() => expect(document.querySelector('.my-custom-exporting-overlay')).toBeFalsy());
        await new GridRows(api, `excel export overlay calls overlayComponentSelector final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"John" sport:"Tennis" age:25
        `);
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
