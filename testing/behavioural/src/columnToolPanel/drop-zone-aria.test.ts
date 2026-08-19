import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

const COLUMN_DEFS = [
    { field: 'country', enableRowGroup: true, enablePivot: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'total', aggFunc: undefined },
];

const ROW_DATA = [
    { country: 'United States', year: 2008, total: 3 },
    { country: 'Russia', year: 2004, total: 2 },
];

function createGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        rowGroupPanelShow: 'always',
        sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        ...options,
    });
}

/**
 * Presentational-role conflict resolution discards `role="presentation"` from a labelled
 * element, leaving a generic element on which `aria-label` is prohibited.
 */
function expectNoPresentationalNameConflict(gridRoot: Element): void {
    const dropLists = Array.from(gridRoot.querySelectorAll<HTMLElement>('.ag-column-drop-list'));

    // Precondition: these are the elements the audit tool inspects.
    expect(dropLists.length).toBeGreaterThan(0);

    const offenders = dropLists
        .filter((el) => el.getAttribute('role') === 'presentation' && el.getAttribute('aria-label') != null)
        .map((el) => `${el.className} [aria-label="${el.getAttribute('aria-label')}"]`);

    expect(offenders).toEqual([]);
}

function getDropAreaTestIds(gridRoot: Element): (string | null)[] {
    return Array.from(gridRoot.querySelectorAll<HTMLElement>('.ag-column-drop')).map((el) =>
        el.getAttribute('data-testid')
    );
}

/**
 * The drop area's `data-testid` names the zone, so an unlabelled empty zone must still get a named
 * test id — otherwise every docs e2e spec targeting an empty zone silently changes test id.
 */
async function expectEmptyZonesKeepTheirTestIdName(gridRoot: Element): Promise<void> {
    await waitFor(() => {
        expect(getDropAreaTestIds(gridRoot)).toContain(agTestIdFor.columnDropArea('toolbar', 'Row Groups'));
    });

    const testIds = getDropAreaTestIds(gridRoot);

    expect(testIds).toContain(agTestIdFor.columnDropArea('panel', 'Row Groups'));
    expect(testIds).toContain(agTestIdFor.columnDropArea('panel', 'Column Labels'));
    expect(testIds).toContain(agTestIdFor.columnDropArea('toolbar', 'Values'));
}

describe('Column drop zone aria', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnsToolPanelModule,
            PivotModule,
            RowGroupingModule,
            RowGroupingPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Covers TC1 (Row Groups / Values, header panel + Columns tool panel) and TC2
    // (Pivot / Column Labels) — all of those zones are empty in this default state.
    test('empty drop zones do not combine role="presentation" with aria-label', async () => {
        const api = createGrid(gridsManager);
        await asyncSetTimeout(0);

        const gridRoot = getGridElement(api)!;
        expectNoPresentationalNameConflict(gridRoot);
        await expectEmptyZonesKeepTheirTestIdName(gridRoot);
    });

    test('a populated drop zone is a labelled listbox', async () => {
        const api = createGrid(gridsManager);
        api.setRowGroupColumns(['country']);
        await asyncSetTimeout(0);

        const populated = Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-column-drop-list')).filter(
            (el) => el.querySelector('.ag-column-drop-cell') != null
        );

        expect(populated.length).toBeGreaterThan(0);
        for (const el of populated) {
            expect(el.getAttribute('role')).toBe('listbox');
            expect(el.getAttribute('aria-label')).toBe('Row Groups');
        }
    });
});
