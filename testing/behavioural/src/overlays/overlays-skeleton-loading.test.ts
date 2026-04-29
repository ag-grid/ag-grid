import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible, setRowDataChecked } from '../test-utils';

/**
 * Tests for skeleton loading cells (skeletonRows).
 *
 * AG-12723: skeletonRows — CSRM shows per-cell shimmer rows instead of the
 *           full-screen loading overlay. Accepts boolean or { rowCount, columns } object.
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

    describe('object form — rowCount', () => {
        test('shows N skeleton rows when rowCount=N', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: { rowCount: 5 },
            });

            expect(getSkeletonRows()).toHaveLength(5);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('shows no skeleton rows and no overlay when rowCount=0', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: { rowCount: 0 },
            });

            expect(getSkeletonRows()).toHaveLength(0);
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('updating rowCount via setGridOption refreshes skeleton row count', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: { rowCount: 3 },
            });

            expect(getSkeletonRows()).toHaveLength(3);

            api.setGridOption('skeletonRows', { rowCount: 7 });

            expect(getSkeletonRows()).toHaveLength(7);
        });

        test('rowCount callback receives parentNode=null and level=0 for CSRM', () => {
            let capturedParams: any;
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: {
                    rowCount: (params) => {
                        capturedParams = params;
                        return 4;
                    },
                },
            });

            expect(getSkeletonRows()).toHaveLength(4);
            expect(capturedParams).toBeDefined();
            expect(capturedParams.parentNode).toBeNull();
            expect(capturedParams.level).toBe(0);
            expect(capturedParams.api).toBeDefined();
        });
    });

    describe('object form — columns', () => {
        test('skeleton columns are used when columnDefs is absent at startup', () => {
            const skeletonCols = [
                { field: 'name', width: 200 },
                { field: 'age', width: 100 },
            ];
            gridsManager.createGrid('myGrid', {
                skeletonRows: { columns: skeletonCols },
            });

            expect(getSkeletonRows()).toHaveLength(1);
            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2);
        });

        test('real columnDefs take priority over skeleton columns at startup', () => {
            const skeletonCols = [{ field: 'name', width: 200 }];
            gridsManager.createGrid('myGrid', {
                columnDefs,
                skeletonRows: { columns: skeletonCols },
            });

            // Two real columns, not one skeleton column
            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2);
        });

        test('setting real columnDefs after startup replaces skeleton columns', () => {
            const skeletonCols = [{ field: 'name', width: 200 }];
            const api = gridsManager.createGrid('myGrid', {
                skeletonRows: { columns: skeletonCols },
            });

            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(1);

            api.setGridOption('columnDefs', columnDefs);

            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2);
        });

        test('skeleton columns are only used as initial placeholder: real columns persist through loading state', () => {
            // 1 skeleton column, 2 real columns — used to distinguish which column set is active
            const skeletonCols = [{ field: 'skeleton' }];
            const api = gridsManager.createGrid('myGrid', {
                skeletonRows: { columns: skeletonCols },
            });

            // Phase 1: skeleton columns active, skeleton rows shown
            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(1);
            expect(getSkeletonRows()).toHaveLength(1);

            // Phase 2: real columnDefs arrive — real columns replace skeleton columns
            api.setGridOption('columnDefs', columnDefs);

            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2);
            expect(getSkeletonRows()).toHaveLength(1); // still loading (no rowData yet)

            // Phase 3: rowData arrives — skeleton rows cleared
            setRowDataChecked(api, [
                { name: 'Alice', age: 30 },
                { name: 'Bob', age: 25 },
            ]);

            expect(getSkeletonRows()).toHaveLength(0);
            expect(api.getDisplayedRowCount()).toBe(2);

            // Phase 4: loading=true — skeleton rows return with REAL columns, not skeleton columns
            api.setGridOption('loading', true);

            expect(getSkeletonRows()).toHaveLength(1);
            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(2);
        });
    });
});
