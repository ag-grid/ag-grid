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

/** Roles that permit an accessible name from `aria-label`. */
const NAMEABLE_ROLES = ['listbox', 'group', 'region'];

/**
 * The reporter-visible symptom (AG-18152): an ARIA audit flags `div.ag-column-drop-list`
 * because it carries `role="presentation"` **and** `aria-label` at the same time.
 * Presentational-role conflict resolution then discards the role, the element computes as
 * generic, and `aria-label` is prohibited on it.
 *
 * Assert the invariant, not one specific remediation: the ticket's Expected is disjunctive
 * ("no aria-label while presentational, OR a role that permits a name").
 */
function expectNoPresentationalNameConflict(gridRoot: HTMLElement): void {
    const dropLists = Array.from(gridRoot.querySelectorAll<HTMLElement>('.ag-column-drop-list'));

    // Precondition: these are the elements the audit tool inspects.
    expect(dropLists.length).toBeGreaterThan(0);

    const offenders = dropLists
        .filter((el) => el.getAttribute('role') === 'presentation' && el.getAttribute('aria-label') != null)
        .map((el) => `${el.className} [aria-label="${el.getAttribute('aria-label')}"]`);

    expect(offenders).toEqual([]);
}

/**
 * `.ag-column-drop-list`'s `aria-label` is also the source of the drop area's `data-testid`
 * (`testIdService.setupColumnDropArea` reads it), so removing it when the zone is empty would
 * silently rename `ag-column-drop-area:source=…;name=…` and break the docs e2e specs that
 * target empty zones. Pin the name — and the fact that its role permits one.
 */
function expectEmptyZonesKeepTheirName(gridRoot: HTMLElement): void {
    const unnamed = Array.from(gridRoot.querySelectorAll<HTMLElement>('.ag-column-drop-list'))
        .filter(
            (el) => el.getAttribute('aria-label') == null || !NAMEABLE_ROLES.includes(el.getAttribute('role') ?? '')
        )
        .map(
            (el) => `${el.className} [role="${el.getAttribute('role')}" aria-label="${el.getAttribute('aria-label')}"]`
        );

    expect(unnamed).toEqual([]);
}

describe('Column drop zone aria (AG-18152)', () => {
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
});
