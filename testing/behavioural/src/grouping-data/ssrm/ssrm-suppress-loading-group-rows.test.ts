import type { MockInstance } from 'vitest';

import type { IServerSideDatasource, RowGroupingDisplayType } from 'ag-grid-community';
import { ValidationModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../test-utils';

/**
 * Tests for suppressServerSideFullWidthLoadingRow combined with groupDisplayType and groupHideOpenParents.
 *
 * The row type assigned to a stub group row depends on three options:
 *
 *   isStub              = stub && !suppress && !groupHideOpenParents
 *   isSuppressedGroupStub = suppress && stub && !groupHideOpenParents
 *
 *   if (isStub)                                  → FullWidthLoading
 *   else if (isFullWidthGroup && !isSuppressedGroupStub) → FullWidthGroup
 *   else                                          → Normal
 *
 * isFullWidthGroup is only true when groupDisplayType='groupRows'. For all other display
 * types (multipleColumns, singleColumn) isFullWidthGroup=false, so the FullWidthGroup
 * path is never reached.
 *
 * Truth table for stub group rows:
 *
 *   groupDisplayType   suppress  groupHideOpenParents  rowType
 *   ────────────────   ────────  ────────────────────  ──────────────
 *   groupRows          false     false                 FullWidthLoading
 *   groupRows          true      false                 Normal          ← fix
 *   groupRows          false     true                  FullWidthGroup (invalid)
 *   groupRows          true      true                  FullWidthGroup (invalid)
 *   multipleColumns    false     false                 FullWidthLoading
 *   multipleColumns    true      false                 Normal
 *   multipleColumns    false     true                  Normal          ← differs from groupRows
 *   multipleColumns    true      true                  Normal
 *
 * Observable CSS classes:
 *   ag-row-loading:    always present on stub rows
 *   ag-full-width-row: present for FullWidthLoading and FullWidthGroup; absent for Normal
 */

const columnDefs = [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'medals' },
];

/** A datasource that never responds, keeping rows in stub state indefinitely. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

function getStubRows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('.ag-row-loading'));
}

function assertStubRowsAreFullWidth() {
    const stubRows = getStubRows();
    expect(stubRows.length).toBeGreaterThan(0);
    for (const row of stubRows) {
        expect(row.classList.contains('ag-full-width-row')).toBe(true);
    }
}

function assertStubRowsAreNormal() {
    const stubRows = getStubRows();
    expect(stubRows.length).toBeGreaterThan(0);
    for (const row of stubRows) {
        expect(row.classList.contains('ag-full-width-row')).toBe(false);
    }
}

describe('SSRM suppressServerSideFullWidthLoadingRow with groupDisplayType', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, RowGroupingModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridManager.reset();
        consoleWarnSpy.mockRestore();
    });

    describe("groupDisplayType='groupRows'", () => {
        const groupDisplayType: RowGroupingDisplayType = 'groupRows';

        test('default: stub group rows are full-width (FullWidthLoading)', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                groupDisplayType,
                serverSideDatasource: createHangingDatasource(),
            });

            assertStubRowsAreFullWidth();
        });

        test('suppressServerSideFullWidthLoadingRow=true: stub group rows are Normal (per-cell, not full-width)', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                groupDisplayType,
                suppressServerSideFullWidthLoadingRow: true,
                serverSideDatasource: createHangingDatasource(),
            });

            assertStubRowsAreNormal();
        });

        test('groupHideOpenParents=true: warns that groupHideOpenParents has no effect', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                groupDisplayType,
                groupHideOpenParents: true,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #315'),
                expect.stringContaining('`groupHideOpenParents` requires `groupDisplayType`'),
                expect.any(String)
            );
        });

        test('suppressServerSideFullWidthLoadingRow=true + groupHideOpenParents=true: warns that groupHideOpenParents has no effect', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                groupDisplayType,
                suppressServerSideFullWidthLoadingRow: true,
                groupHideOpenParents: true,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #315'),
                expect.stringContaining('`groupHideOpenParents` requires `groupDisplayType`'),
                expect.any(String)
            );
        });
    });

    describe.each<RowGroupingDisplayType>(['multipleColumns', 'singleColumn'])(
        "groupDisplayType='%s'",
        (groupDisplayType) => {
            // For multipleColumns and singleColumn, isFullWidthGroup is always false (groups use an
            // auto-group column, not the entire row). The FullWidthGroup path is therefore never
            // reached for stubs, and groupHideOpenParents=true gives Normal rather than FullWidthGroup.

            test('default: stub rows are full-width (FullWidthLoading)', () => {
                gridManager.createGrid('myGrid', {
                    columnDefs,
                    rowModelType: 'serverSide',
                    groupDisplayType,
                    serverSideDatasource: createHangingDatasource(),
                });

                assertStubRowsAreFullWidth();
            });

            test('suppressServerSideFullWidthLoadingRow=true: stub rows are Normal (per-cell, not full-width)', () => {
                gridManager.createGrid('myGrid', {
                    columnDefs,
                    rowModelType: 'serverSide',
                    groupDisplayType,
                    suppressServerSideFullWidthLoadingRow: true,
                    serverSideDatasource: createHangingDatasource(),
                });

                assertStubRowsAreNormal();
            });

            test('groupHideOpenParents=true: stub rows are Normal (not FullWidthGroup, unlike groupRows)', () => {
                // Without isFullWidthGroup, groupHideOpenParents only suppresses FullWidthLoading;
                // stubs fall to Normal rather than FullWidthGroup.
                gridManager.createGrid('myGrid', {
                    columnDefs,
                    rowModelType: 'serverSide',
                    groupDisplayType,
                    groupHideOpenParents: true,
                    serverSideDatasource: createHangingDatasource(),
                });

                assertStubRowsAreNormal();
            });

            test('suppressServerSideFullWidthLoadingRow=true + groupHideOpenParents=true: stub rows are Normal', () => {
                gridManager.createGrid('myGrid', {
                    columnDefs,
                    rowModelType: 'serverSide',
                    groupDisplayType,
                    suppressServerSideFullWidthLoadingRow: true,
                    groupHideOpenParents: true,
                    serverSideDatasource: createHangingDatasource(),
                });

                assertStubRowsAreNormal();
            });
        }
    );
});
