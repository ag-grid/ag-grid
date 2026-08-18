import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/** The loading row is the subject of both TC1 assertions, so its presence is the precondition to poll. */
const waitForLoadingRow = async (): Promise<HTMLElement> => {
    let loadingRow: HTMLElement | null = null;
    await waitFor(() => {
        loadingRow = document.querySelector<HTMLElement>('.ag-row-loading');
        expect(loadingRow).not.toBeNull();
    });
    return loadingRow!;
};

describe('SSRM row ARIA', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    const LEAF_ROWS = [
        { id: 'uk-alice', country: 'UK', athlete: 'Alice' },
        { id: 'us-frank', country: 'US', athlete: 'Frank' },
        { id: 'fr-heidi', country: 'FR', athlete: 'Heidi' },
    ];

    test('full-width loading row exposes a cell child', async () => {
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            rowModelType: 'serverSide',
            // Never resolved: keeps the root-level loading row on screen.
            serverSideDatasource: { getRows: () => {} },
        });

        const loadingRow = await waitForLoadingRow();
        expect(loadingRow.getAttribute('role')).toBe('row');
        expect(loadingRow.querySelector('[role="gridcell"]')).not.toBeNull();

        expect(api.isDestroyed()).toBe(false);
    });

    test('full-width loading row exposes a cell child with a custom loading renderer', async () => {
        gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            rowModelType: 'serverSide',
            serverSideDatasource: { getRows: () => {} },
            loadingCellRenderer: class {
                private eGui = document.createElement('div');
                public init(): void {
                    this.eGui.textContent = 'custom loading';
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
                public refresh(): boolean {
                    return false;
                }
            },
        });

        const loadingRow = await waitForLoadingRow();
        expect(loadingRow.textContent).toBe('custom loading');
        expect(loadingRow.querySelector('[role="gridcell"]')).not.toBeNull();
    });

    test('non-expandable loading row has no aria-expanded attribute', async () => {
        gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            rowModelType: 'serverSide',
            serverSideDatasource: { getRows: () => {} },
        });

        const loadingRow = await waitForLoadingRow();
        expect(loadingRow.getAttribute('aria-expanded')).toBeNull();
    });

    test('rows only carry aria-expanded when the grid container is a treegrid', async () => {
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { field: 'athlete' },
            rowModelType: 'serverSide',
            getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const groupKeys = (params.request.groupKeys ?? []) as string[];
                    if (groupKeys.length === 0) {
                        const countries = Array.from(new Set(LEAF_ROWS.map((r) => r.country)));
                        const rows = countries.map((country) => ({ id: `group-${country}`, country }));
                        params.success({ rowData: [...rows], rowCount: rows.length });
                        return;
                    }
                    const rows = LEAF_ROWS.filter((r) => r.country === groupKeys[0]);
                    params.success({ rowData: [...rows], rowCount: rows.length });
                },
            },
        });

        await waitForNoLoadingRows(api);
        // Precondition only: the three collapsed country groups are rendered. Deliberately not polling on
        // the role or on `aria-expanded` — the former is the assertion under test, and step 2 of this
        // ticket changes which rows carry the latter.
        await waitFor(() => expect(document.querySelectorAll('.ag-row').length).toBe(3));

        const container = document.querySelector<HTMLElement>('[role="grid"], [role="treegrid"]');
        expect(container).not.toBeNull();
        const containerRole = container!.getAttribute('role');

        const rowsWithAriaExpanded = document.querySelectorAll('.ag-row[aria-expanded]');
        expect(rowsWithAriaExpanded.length).toBeGreaterThan(0);
        expect(containerRole).toBe('treegrid');
    });
});
