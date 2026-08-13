import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

/**
 * `testIdService.setupColumnDropArea` names the drop area's `data-testid` after the zone, so an
 * unlabelled empty zone must still expose its name — otherwise every docs e2e spec targeting an
 * empty zone silently changes test id.
 */
function expectEmptyZonesKeepTheirName(gridRoot: Element): void {
    const unnamed = Array.from(gridRoot.querySelectorAll<HTMLElement>('.ag-column-drop-list'))
        .filter((el) => el.getAttribute('aria-label') == null && el.getAttribute('data-drop-area-name') == null)
        .map((el) => el.className);

    expect(unnamed).toEqual([]);
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
        expectEmptyZonesKeepTheirName(gridRoot);
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
            expect(el.getAttribute('data-drop-area-name')).toBeNull();
        }
    });
});
