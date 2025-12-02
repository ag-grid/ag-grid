import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlays state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];
    let consoleWarnSpy: MockInstance;

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
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    test('agLoadingOverlay only gets the loading property', () => {
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
        expect(capturedParams['my-resolve-loader']?.overlayType).toBe('loading');

        // update specific loading params should refresh the component
        api.setGridOption('loadingOverlayComponentParams', { fromTest: 'loadingParam2' });
        expect(capturedParams['my-resolve-loader']?.fromTest).toBe('loadingParam2');
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
