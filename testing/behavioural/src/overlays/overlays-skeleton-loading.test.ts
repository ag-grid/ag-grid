import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible, setRowDataChecked } from '../test-utils';

/**
 * Tests for skeleton loading cells (skeletonRows).
 *
 * AG-12723: skeletonRows — CSRM shows per-cell shimmer rows instead of the
 *           full-screen loading overlay. Accepts boolean, number, or a rowCount callback.
 */

const columnDefs = [{ field: 'name' }, { field: 'age' }];

function getSkeletonRows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('.ag-row-loading'));
}

function hasLoadingOverlay(): boolean {
    return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
}

describe('CSRM skeleton loading cells', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('skeletonRows', () => {
        test('shows 1 skeleton row by default when no rowData is provided', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
            });

            expect(getSkeletonRows()).toHaveLength(1);
        });

        test('loading overlay is suppressed when skeleton is active', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
            });

            expect(hasLoadingOverlay()).toBeFalsy();
            expect(getSkeletonRows()).toHaveLength(1);
        });

        test('skeleton rows are Normal row type (per-cell, not full-width)', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
            });

            const rows = getSkeletonRows();
            expect(rows).toHaveLength(1);
            for (const row of rows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(false);
            }
        });

        test('skeleton rows shown when loading=true, even with rowData present', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
                loading: true,
                rowData: [{ name: 'Alice', age: 30 }],
            });

            expect(getSkeletonRows()).toHaveLength(1);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('skeleton rows replaced by real rows when rowData is set', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
            });

            expect(getSkeletonRows()).toHaveLength(1);

            setRowDataChecked(api, [
                { name: 'Alice', age: 30 },
                { name: 'Bob', age: 25 },
            ]);

            expect(getSkeletonRows()).toHaveLength(0);
            expect(api.getDisplayedRowCount()).toBe(2);
        });

        test('skeleton rows removed when loading set to false', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: true,
                loading: true,
            });

            expect(getSkeletonRows()).toHaveLength(1);

            api.setGridOption('loading', false);

            expect(getSkeletonRows()).toHaveLength(0);
        });

        test('without skeletonRows the standard loading overlay is used', () => {
            gridsManager.createGrid('myGrid', { columnDefs });

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(getSkeletonRows()).toHaveLength(0);
        });
    });

    describe('numeric form — rowCount', () => {
        test('shows N skeleton rows when skeletonRows=N', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: 5,
            });

            expect(getSkeletonRows()).toHaveLength(5);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('skeletonRows=0 is falsy — disables the feature and shows the standard overlay', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: 0,
            });

            expect(getSkeletonRows()).toHaveLength(0);
            expect(hasLoadingOverlay()).toBeTruthy();
        });

        test('updating count via setGridOption refreshes skeleton row count', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: 3,
            });

            expect(getSkeletonRows()).toHaveLength(3);

            api.setGridOption('skeletonRows', 7);

            expect(getSkeletonRows()).toHaveLength(7);
        });

        test('callback receives currentRowCount=0 on initial load', () => {
            let capturedParams: any;
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: (params) => {
                    capturedParams = params;
                    return 4;
                },
            });

            expect(getSkeletonRows()).toHaveLength(4);
            expect(capturedParams).toBeDefined();
            expect(capturedParams.currentRowCount).toBe(0);
            expect(capturedParams.api).toBeDefined();
        });
    });
});
