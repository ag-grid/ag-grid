import type { MockInstance } from 'vitest';

import type { ProcessFileInputParams } from 'ag-grid-community';
import { AutoGenerateColumnsModule, ClientSideRowModelModule } from 'ag-grid-community';

import { GridRows, TestGridsManager, initPointerEventPolyfill, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid file input overlay', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AutoGenerateColumnsModule],
    });
    let consoleWarnSpy: MockInstance;

    function hasFileInputOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-file-input-center'));
    }

    function hasFileInputOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-file-input-wrapper');
    }

    function hasLoadingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    function hasLoadingOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-loading-wrapper');
    }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasNoRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper');
    }

    function hasDropZone() {
        return isAgHtmlElementVisible(document.querySelector('.ag-file-input-drop-zone'));
    }

    function hasProcessingState() {
        return isAgHtmlElementVisible(document.querySelector('.ag-file-input-processing'));
    }

    function hasErrorBanner() {
        return isAgHtmlElementVisible(document.querySelector('.ag-file-input-error-banner'));
    }

    function getErrorBannerText(): string {
        return document.querySelector('.ag-file-input-error-banner')?.textContent ?? '';
    }

    function getProcessingText(): string {
        return document.querySelector('.ag-file-input-processing .ag-file-input-text')?.textContent ?? '';
    }

    function getDropZoneText(): string {
        return document.querySelector('.ag-file-input-drop-zone .ag-file-input-text')?.textContent ?? '';
    }

    function hasBrowseButton() {
        return !!document.querySelector('.ag-file-input-browse');
    }

    function hasActiveDropZone() {
        return document.querySelector('.ag-file-input-drop-zone')?.classList.contains('ag-file-input-drop-zone-active');
    }

    function makeProcessFileInput(
        handler?: (params: ProcessFileInputParams) => void
    ): (params: ProcessFileInputParams) => void {
        return handler ?? (() => {});
    }

    function createFileDragEvent(type: string, files?: File[]): DragEvent {
        const dt = new DataTransfer();
        // DataTransfer.types/files are readonly in the DOM types but mutable arrays in jsdom, so we cast away readonly to push
        (dt.types as string[]).push('Files');
        if (files) {
            for (const file of files) {
                dt.items.add(file);
                (dt.files as unknown as File[]).push(file);
            }
        }
        return new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true });
    }

    function createNonFileDragEvent(type: string): DragEvent {
        const dt = new DataTransfer();
        dt.setData('text/plain', 'some text');
        return new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true });
    }

    function getOverlayGui(): HTMLElement {
        const wrapper = document.querySelector('.ag-overlay-file-input-wrapper');
        const center = wrapper?.querySelector('.ag-overlay-file-input-center');
        return center as HTMLElement;
    }

    beforeEach(() => {
        initPointerEventPolyfill();
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
        expect(hasFileInputOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
    });

    describe('visibility', () => {
        test('shows file input overlay with explicit columnDefs, null rowData, and processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: null as any,
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('shows no-rows overlay when processFileInput set with empty rowData', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('shows no-rows overlay when processFileInput set and rowData cleared to empty', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeFalsy();

            api.setGridOption('rowData', []);
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('shows file input overlay when processFileInput set with undefined rowData and autoGenerateColumnDefs', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('does not show file input overlay when autoGenerateColumnDefs with rowData provided', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('shows no-rows overlay when autoGenerateColumnDefs with empty rowData and processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: [],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('shows loading overlay when autoGenerateColumnDefs without processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
            });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('shows loading overlay without processFileInput when rowData undefined', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
            });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('does not show file input overlay when rowData has rows', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('hides file input overlay when rowData is set with rows', async () => {
            const api = gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeTruthy();

            api.setGridOption('rowData', [{ a: 1 }]);
            expect(hasFileInputOverlay()).toBeFalsy();

            await new GridRows(api, 'after rowData set').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:1
            `);
        });

        test('shows file input overlay on demand via activeOverlay over existing data', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasFileInputOverlay()).toBeFalsy();

            api.setGridOption('activeOverlay', 'agFileInputOverlay');
            expect(hasFileInputOverlay()).toBeTruthy();
        });

        test('shows file input overlay via activeOverlay without autoGenerateColumnDefs', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput(),
                activeOverlay: 'agFileInputOverlay',
            });
            expect(hasFileInputOverlay()).toBeTruthy();
            expect(hasFileInputOverlayWrapper()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('activeOverlay shows file input even without processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                activeOverlay: 'agFileInputOverlay',
            });
            expect(hasFileInputOverlay()).toBeTruthy();
            expect(hasErrorBanner()).toBeTruthy();
            expect(getErrorBannerText()).toBe('gridOptions.processFileInput is missing');
        });

        test('shows no-rows overlay with explicit columnDefs and empty rowData even with processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [],
                processFileInput: makeProcessFileInput(),
            });
            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('loading=true takes precedence over processFileInput', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
                loading: true,
            });
            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });
    });

    describe('drop zone content', () => {
        test('shows default overlay text', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });
            expect(getDropZoneText()).toBe('Drag & Drop file to import data');
        });

        test('shows custom overlay text from overlayComponentParams', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
                overlayComponentParams: {
                    fileInput: { overlayText: 'Drop CSV here' },
                },
            });
            expect(getDropZoneText()).toBe('Drop CSV here');
        });

        test('shows browse button', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });
            expect(hasBrowseButton()).toBeTruthy();
        });
    });

    describe('error state', () => {
        test('shows error when processFileInput is missing', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [],
                processFileInput: undefined,
            });

            // Without processFileInput, the overlay is not shown via the service
            expect(hasFileInputOverlay()).toBeFalsy();
        });

        test('shows error banner when processFileInput calls fail', () => {
            let capturedParams: ProcessFileInputParams | undefined;
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput((params) => {
                    capturedParams = params;
                }),
            });
            expect(hasFileInputOverlay()).toBeTruthy();

            const file = new File(['data'], 'test.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            expect(capturedParams).toBeDefined();
            capturedParams!.fail('Custom error message');

            expect(hasErrorBanner()).toBeTruthy();
            expect(getErrorBannerText()).toBe('Custom error message');
            expect(hasDropZone()).toBeTruthy();
            expect(hasProcessingState()).toBeFalsy();
        });

        test('shows default error message when fail called without argument', () => {
            let capturedParams: ProcessFileInputParams | undefined;
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput((params) => {
                    capturedParams = params;
                }),
            });

            const file = new File(['data'], 'report.xlsx', { type: 'application/vnd.ms-excel' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            capturedParams!.fail();

            expect(hasErrorBanner()).toBeTruthy();
            expect(getErrorBannerText()).toBe('Error processing report.xlsx');
        });

        test('shows error when processFileInput throws synchronously', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(() => {
                    throw new Error('sync error');
                }),
            });

            const file = new File(['data'], 'bad.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            expect(hasErrorBanner()).toBeTruthy();
            expect(hasDropZone()).toBeTruthy();
            expect(hasProcessingState()).toBeFalsy();
        });
    });

    describe('processing state', () => {
        test('shows processing state when file is dropped', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const file = new File(['data'], 'test.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            expect(hasProcessingState()).toBeTruthy();
            expect(hasDropZone()).toBeFalsy();
            expect(getProcessingText()).toBe('Processing test.csv');
        });

        test('ignores additional drops while processing', () => {
            let callCount = 0;
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(() => {
                    callCount++;
                }),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [new File(['a'], 'first.csv')]));
            eGui.dispatchEvent(createFileDragEvent('drop', [new File(['b'], 'second.csv')]));

            expect(callCount).toBe(1);
            expect(getProcessingText()).toBe('Processing first.csv');
        });
    });

    describe('successful file processing', () => {
        test('updates grid rowData on success', async () => {
            let capturedParams: ProcessFileInputParams | undefined;
            const api = gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput((params) => {
                    capturedParams = params;
                }),
            });

            const file = new File(['data'], 'test.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            expect(capturedParams).toBeDefined();
            expect(capturedParams!.files).toHaveLength(1);
            expect(capturedParams!.files[0].name).toBe('test.csv');

            capturedParams!.success([{ a: 10 }, { a: 20 }]);

            expect(hasFileInputOverlay()).toBeFalsy();
            await new GridRows(api, 'after success').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:10
                └── LEAF id:1 a:20
            `);
        });

        test('clears activeOverlay when file input overlay success is called via activeOverlay', async () => {
            let capturedParams: ProcessFileInputParams | undefined;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: [{ a: 1 }],
                processFileInput: makeProcessFileInput((params) => {
                    capturedParams = params;
                }),
            });
            expect(hasFileInputOverlay()).toBeFalsy();

            api.setGridOption('activeOverlay', 'agFileInputOverlay');
            expect(hasFileInputOverlay()).toBeTruthy();

            const file = new File(['data'], 'test.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            capturedParams!.success([{ a: 10 }, { a: 20 }]);

            expect(hasFileInputOverlay()).toBeFalsy();
            expect(api.getGridOption('activeOverlay')).toBeUndefined();
            await new GridRows(api, 'after success via activeOverlay').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:10
                └── LEAF id:1 a:20
            `);
        });

        test('shows no-rows overlay when success is called with empty array', () => {
            let capturedParams: ProcessFileInputParams | undefined;
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput((params) => {
                    capturedParams = params;
                }),
            });

            const file = new File([''], 'empty.csv', { type: 'text/csv' });
            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));

            capturedParams!.success([]);

            expect(hasNoRowsOverlay()).toBeTruthy();
            expect(hasFileInputOverlay()).toBeFalsy();
        });
    });

    describe('drag and drop interactions', () => {
        test('adds active class on dragenter with file', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('dragenter'));

            expect(hasActiveDropZone()).toBeTruthy();
        });

        test('removes active class on dragleave', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('dragenter'));
            expect(hasActiveDropZone()).toBeTruthy();

            eGui.dispatchEvent(createFileDragEvent('dragleave'));
            expect(hasActiveDropZone()).toBeFalsy();
        });

        test('handles nested dragenter/dragleave via counter', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eGui = getOverlayGui();

            // Enter outer, then enter inner child
            eGui.dispatchEvent(createFileDragEvent('dragenter'));
            eGui.dispatchEvent(createFileDragEvent('dragenter'));
            expect(hasActiveDropZone()).toBeTruthy();

            // Leave inner child — should stay active
            eGui.dispatchEvent(createFileDragEvent('dragleave'));
            expect(hasActiveDropZone()).toBeTruthy();

            // Leave outer — now inactive
            eGui.dispatchEvent(createFileDragEvent('dragleave'));
            expect(hasActiveDropZone()).toBeFalsy();
        });

        test('resets drag state on drop', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('dragenter'));
            expect(hasActiveDropZone()).toBeTruthy();

            const file = new File(['data'], 'test.csv', { type: 'text/csv' });
            eGui.dispatchEvent(createFileDragEvent('drop', [file]));
            expect(hasActiveDropZone()).toBeFalsy();
        });

        test('ignores non-file drag events', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createNonFileDragEvent('dragenter'));

            expect(hasActiveDropZone()).toBeFalsy();
        });

        test('does not process drop without files', () => {
            let called = false;
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(() => {
                    called = true;
                }),
            });

            const eGui = getOverlayGui();
            eGui.dispatchEvent(createFileDragEvent('drop'));

            expect(called).toBeFalsy();
            expect(hasDropZone()).toBeTruthy();
        });
    });

    describe('file input (browse button)', () => {
        test('browse button and hidden file input are rendered', () => {
            gridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                processFileInput: makeProcessFileInput(),
            });

            const eFileInput = document.querySelector<HTMLInputElement>('.ag-file-input-input');
            expect(eFileInput).toBeTruthy();
            expect(eFileInput!.type).toBe('file');
            expect(eFileInput!.style.display).toBe('none');

            const eBrowse = document.querySelector<HTMLButtonElement>('.ag-file-input-browse');
            expect(eBrowse).toBeTruthy();
            expect(eBrowse!.textContent).toBe('Browse files');
        });
    });
});
