import type { GridApi, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Tests that SSRM loading/stub rows are indented to match their group hierarchy depth.
 *
 * Two loading modes exist:
 *
 *   1. Full-width loading rows (default) — a single spinner spanning the row.
 *      Indentation is applied via the --ag-indentation-level CSS variable set on the
 *      **row element** by rowCtrl.setupLoadingRowIndent().
 *
 *   2. Skeleton rows (suppressServerSideFullWidthLoadingRow=true) — per-cell loading
 *      indicators rendered as Normal-type rows. Indentation is applied via the
 *      --ag-indentation-level CSS variable set on the **row element** by
 *      rowCtrl.setupLoadingRowIndent(), which cascades to cells via the .ag-cell
 *      padding rule.
 *
 * Both modes are tested at multiple group depths (level 0, 1, 2).
 */

const columnDefs = [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'medals' },
];

/**
 * Creates a datasource that responds with group rows up to `respondUpToDepth`,
 * then hangs (never calls success) for deeper levels — keeping child stubs visible.
 */
function createPartialDatasource(respondUpToDepth: number): IServerSideDatasource {
    const countryGroups = ['Ireland', 'Spain'];
    const yearGroups = ['2000', '2001'];

    return {
        getRows(params: IServerSideGetRowsParams) {
            const { groupKeys } = params.request;

            if (groupKeys.length > respondUpToDepth) {
                return; // hang — never respond, keeping stubs in loading state
            }

            setTimeout(() => {
                if (groupKeys.length === 0) {
                    params.success({
                        rowData: countryGroups.map((country) => ({ country })),
                        rowCount: countryGroups.length,
                    });
                } else if (groupKeys.length === 1) {
                    params.success({
                        rowData: yearGroups.map((year) => ({ country: groupKeys[0], year })),
                        rowCount: yearGroups.length,
                    });
                } else {
                    params.success({
                        rowData: [{ country: groupKeys[0], year: groupKeys[1], medals: 1 }],
                        rowCount: 1,
                    });
                }
            }, 0);
        },
    };
}

/** A datasource that never responds, keeping rows in stub state indefinitely. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

function getStubRows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('.ag-row-loading'));
}

function getIndentationLevel(element: HTMLElement): string {
    return element.style.getPropertyValue('--ag-indentation-level');
}

async function waitForNonStubRow(api: GridApi, rowIndex: number): Promise<void> {
    for (let i = 0; i < 50; i++) {
        const row = api.getDisplayedRowAtIndex(rowIndex);
        if (row && !row.stub) {
            return;
        }
        await asyncSetTimeout(1);
    }
    throw new Error(`Row at index ${rowIndex} is still a stub after waiting`);
}

describe('SSRM loading row indentation', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridManager.reset();
    });

    describe('full-width loading rows (default)', () => {
        test('top-level stub rows have indentation level 0', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createHangingDatasource(),
            });

            const stubRows = getStubRows();
            expect(stubRows.length).toBeGreaterThan(0);

            for (const row of stubRows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(true);
                expect(getIndentationLevel(row)).toBe('0');
            }
        });

        test('child stub rows at depth 1 have indentation level 1', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createPartialDatasource(0),
            });

            await waitForNonStubRow(api, 0);

            const firstRowNode = api.getDisplayedRowAtIndex(0)!;
            api.setRowNodeExpanded(firstRowNode, true);

            const stubRows = getStubRows();
            expect(stubRows.length).toBeGreaterThan(0);

            for (const row of stubRows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(true);
                expect(getIndentationLevel(row)).toBe('1');
            }
        });

        test('child stub rows at depth 2 have indentation level 2', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createPartialDatasource(1),
            });

            await waitForNonStubRow(api, 0);

            const countryRow = api.getDisplayedRowAtIndex(0)!;
            api.setRowNodeExpanded(countryRow, true);

            // Wait for year groups to load inside the expanded country
            await waitForNonStubRow(api, 1);

            const yearRow = api.getDisplayedRowAtIndex(1)!;
            api.setRowNodeExpanded(yearRow, true);

            const stubRows = getStubRows();
            expect(stubRows.length).toBeGreaterThan(0);

            for (const row of stubRows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(true);
                expect(getIndentationLevel(row)).toBe('2');
            }
        });
    });

    describe('skeleton rows (suppressServerSideFullWidthLoadingRow=true)', () => {
        test('top-level skeleton rows have indentation level 0', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                suppressServerSideFullWidthLoadingRow: true,
                serverSideDatasource: createHangingDatasource(),
            });

            const stubRows = getStubRows();
            expect(stubRows.length).toBeGreaterThan(0);

            for (const row of stubRows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(false);
                expect(getIndentationLevel(row)).toBe('0');
            }
        });

        test('child skeleton rows at depth 1 have indentation level 1', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                suppressServerSideFullWidthLoadingRow: true,
                serverSideDatasource: createPartialDatasource(0),
            });

            await waitForNonStubRow(api, 0);

            const firstRowNode = api.getDisplayedRowAtIndex(0)!;
            api.setRowNodeExpanded(firstRowNode, true);

            const stubRows = getStubRows();
            expect(stubRows.length).toBeGreaterThan(0);

            for (const row of stubRows) {
                expect(row.classList.contains('ag-full-width-row')).toBe(false);
                expect(getIndentationLevel(row)).toBe('1');
            }
        });
    });
});
