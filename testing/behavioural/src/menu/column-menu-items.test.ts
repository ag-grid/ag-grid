import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, clickMenuOption, menuOption, openMenuOption, polyfillOffsetParent } from 'ag-test-utils';
import type { Mock } from 'vitest';

import type {
    ColumnEventType,
    ColumnMenuItemsSource,
    GetColumnMenuItemsParams,
    GridApi,
    IMenuActionParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { AllEnterpriseModule, ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function fireContextMenu(element: HTMLElement): void {
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

/**
 * Fire a real `contextmenu` MouseEvent on the column entry's focus wrapper — the same path
 * AG Grid uses in production to open the context menu.
 */
function openContextMenu(entry: HTMLElement): void {
    fireContextMenu((entry.closest('.ag-virtual-list-item') as HTMLElement | null) ?? entry);
}

describe('getColumnMenuItems / columnMenuItems on the column menu', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [
        { athlete: 'Michael Phelps', age: 23, country: 'United States' },
        { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    ];

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        vi.resetAllMocks();
    });

    test('getColumnMenuItems fires for the column menu with source "columnMenu" and string-token defaults', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('menu-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return [...params.defaultItems, { name: 'Custom' }];
            },
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('Custom');

        expect(captured!.source).toBe<ColumnMenuItemsSource>('columnMenu');
        expect(captured!.column?.getColId()).toBe('athlete');
        expect(captured!.defaultItems.every((item) => typeof item === 'string')).toBe(true);
    });

    test('getColumnMenuItems takes precedence over the legacy getMainMenuItems', async () => {
        const getMainMenuItems = vi.fn(() => [{ name: 'FromLegacyGrid' }]);
        const api = await gridMgr.createGridAndWait('menu-grid-precedence', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: () => [{ name: 'FromNewGrid' }],
            getMainMenuItems,
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('FromNewGrid');

        expect(menuOption('FromLegacyGrid')).toBeNull();
        expect(getMainMenuItems).not.toHaveBeenCalled();
    });

    test('col-level columnMenuItems takes precedence over the legacy mainMenuItems', async () => {
        const api = await gridMgr.createGridAndWait('menu-col-precedence', {
            columnDefs: [
                {
                    field: 'athlete',
                    columnMenuItems: [{ name: 'FromNewCol' }],
                    mainMenuItems: [{ name: 'FromLegacyCol' }],
                },
                { field: 'age' },
            ],
            rowData,
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('FromNewCol');

        expect(menuOption('FromLegacyCol')).toBeNull();
    });

    test('legacy getMainMenuItems still drives the column menu when no new props are set', async () => {
        const api = await gridMgr.createGridAndWait('menu-legacy-only', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getMainMenuItems: (params) => [...params.defaultItems, { name: 'LegacyStillWorks' }],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('athlete');
        await openMenuOption('LegacyStillWorks');
    });

    test('tool-panel tokens (value, scrollIntoView) resolve on the column menu, and value toggles the column', async () => {
        const api = await gridMgr.createGridAndWait('menu-tool-panel-tokens', {
            columnDefs: [{ field: 'athlete' }, { field: 'age', enableValue: true }],
            rowData,
            getColumnMenuItems: () => ['scrollIntoView', 'value'],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('age');
        await openMenuOption('Scroll Age into View');
        await userEvent.click(await openMenuOption('Add Age to values'));

        expect(api.getValueColumns().map((c) => c.getColId())).toStrictEqual(['age']);
    });

    test('a token that does not apply to the column menu (pivot outside pivot mode) is quietly omitted, not warned', async () => {
        const api = await gridMgr.createGridAndWait('menu-inapplicable-token', {
            columnDefs: [{ field: 'athlete' }, { field: 'age', enableValue: true }],
            rowData,
            getColumnMenuItems: () => ['value', 'pivot'],
        });

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('age');
        await openMenuOption('Add Age to values');

        expect(menuOption('Add Age to labels')).toBeNull();
    });

    test('the aggregation sub-menu makes a column a value column with its function, and None removes it', async () => {
        const api = await gridMgr.createGridAndWait('menu-agg-submenu', {
            columnDefs: [
                { field: 'athlete', rowGroup: true },
                { field: 'age', enableValue: true },
            ],
            rowData,
            getColumnMenuItems: () => ['valueAggSubMenu'],
        });
        const valueCols = () => api.getValueColumns().map((column) => `${column.getColId()}:${column.getAggFunc()}`);

        restoreOffsetParent = polyfillOffsetParent();
        api.showColumnMenu('age');
        await clickMenuOption('Value Aggregation');
        await clickMenuOption('Average');
        expect(valueCols()).toEqual(['age:avg']);

        api.showColumnMenu('age');
        await clickMenuOption('Value Aggregation');
        await clickMenuOption('None');
        expect(valueCols()).toEqual([]);
    });
});

function headerCell(colId: string): HTMLElement {
    return document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`)!;
}

function groupHeaderCells(groupId: string): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.ag-header-group-cell[col-id]')).filter((el) =>
        el.getAttribute('col-id')!.startsWith(`${groupId}_`)
    );
}

async function runMenuActionFrom(
    element: HTMLElement,
    itemName: string,
    action: Mock<(params: IMenuActionParams) => void>
): Promise<IMenuActionParams> {
    fireContextMenu(element);
    (await openMenuOption(itemName)).click();
    await waitFor(() => expect(menuOption(itemName)).toBeNull());
    expect(action).toHaveBeenCalledTimes(1);
    const params = action.mock.calls[0][0];
    action.mockReset();
    return params;
}

describe('column menu item action params', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const action = vi.fn<(params: IMenuActionParams) => void>();
    let api: GridApi;

    beforeEach(async () => {
        api = await gridMgr.createGridAndWait('column-menu-action-params', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country' },
                { headerName: 'Time', groupId: 'time', children: [{ field: 'age' }, { field: 'year' }] },
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
            ],
            rowData: [{ athlete: 'Michael Phelps', country: 'United States', age: 23, year: 2008, gold: 8 }],
            suppressColumnVirtualisation: true,
            // Moving Country between Age and Year splits the Time group into two header parts.
            initialState: { columnOrder: { orderedColIds: ['athlete', 'age', 'country', 'year', 'gold', 'silver'] } },
            getColumnMenuItems: (params) => [...params.defaultItems, { name: 'Log Params', action }],
        });
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        action.mockReset();
    });

    const runLogParamsFrom = (element: HTMLElement) => runMenuActionFrom(element, 'Log Params', action);

    test('a column header menu passes the column and a null column group', async () => {
        const params = await runLogParamsFrom(headerCell('athlete'));

        expect(params.column).toBe(api.getColumn('athlete'));
        expect(params.columnGroup).toBeNull();
    });

    test('a column group header menu passes the column group and a null column', async () => {
        const params = await runLogParamsFrom(groupHeaderCells('medals')[0]);

        expect(params.column).toBeNull();
        expect(params.columnGroup).toBe(api.getProvidedColumnGroup('medals'));
    });

    test('every part of a split column group passes the same column group', async () => {
        const parts = groupHeaderCells('time');
        expect(parts).toHaveLength(2);

        const timeGroup = api.getProvidedColumnGroup('time');
        expect(timeGroup).not.toBeNull();
        for (const part of parts) {
            const params = await runLogParamsFrom(part);
            expect(params.column).toBeNull();
            expect(params.columnGroup).toBe(timeGroup);
        }
    });
});

describe('column menu item action params from filler group headers', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });
    const action = vi.fn<(params: IMenuActionParams) => void>();
    let api: GridApi;

    beforeEach(async () => {
        api = await gridMgr.createGridAndWait('column-menu-filler-action-params', {
            columnDefs: [
                { field: 'athlete' },
                {
                    headerName: 'Results',
                    groupId: 'results',
                    children: [
                        { field: 'year' },
                        { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
                    ],
                },
            ],
            // Filler cells are only rendered when the column header doesn't span the header height.
            defaultColDef: { suppressSpanHeaderHeight: true },
            rowData: [{ athlete: 'Michael Phelps', year: 2008, gold: 8, silver: 0 }],
            suppressColumnVirtualisation: true,
            getColumnMenuItems: (params) => [...params.defaultItems, { name: 'Log Params', action }],
        });
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        action.mockReset();
    });

    function fillerCellAbove(colId: string): HTMLElement {
        const fillerGroup = api.getColumn(colId)!.getOriginalParent()!;
        expect(fillerGroup.isPadding()).toBe(true);
        return groupHeaderCells(fillerGroup.getGroupId())[0];
    }

    test('a filler above an ungrouped column passes a null column group', async () => {
        const params = await runMenuActionFrom(fillerCellAbove('athlete'), 'Log Params', action);

        expect(params.column).toBeNull();
        expect(params.columnGroup).toBeNull();
    });

    test('a filler under a column group passes that column group', async () => {
        const params = await runMenuActionFrom(fillerCellAbove('year'), 'Log Params', action);

        expect(params.column).toBeNull();
        expect(params.columnGroup).toBe(api.getProvidedColumnGroup('results'));
    });
});

describe('getColumnMenuItems on the Column Chooser', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }];

    afterEach(() => {
        gridMgr.reset();
    });

    test('right-clicking a column in the Column Chooser fires getColumnMenuItems with source "columnChooser"', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('chooser-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return params.defaultItems;
            },
        });

        api.showColumnChooser();

        const viewport = await waitFor(() => {
            const el = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
            expect(el).toBeTruthy();
            return el!;
        });

        // happy-dom has no layout engine, so force the virtual list to render its items.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        const entry = await waitFor(() => {
            const el = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((e) =>
                e.textContent?.includes('Athlete')
            );
            expect(el).toBeTruthy();
            return el!;
        });

        openContextMenu(entry);

        await waitFor(() => expect(captured).toBeTruthy());
        expect(captured?.source).toBe<ColumnMenuItemsSource>('columnChooser');
        expect(captured?.column?.getColId()).toBe('athlete');

        api.hideColumnChooser();
    });

    test('stock actions invoked from the Column Chooser emit column events with source "columnMenu"', async () => {
        const rowGroupSources: ColumnEventType[] = [];
        const api = await gridMgr.createGridAndWait('chooser-event-source', {
            columnDefs: [{ field: 'athlete', enableRowGroup: true }, { field: 'age' }, { field: 'country' }],
            rowData,
        });
        api.addEventListener('columnRowGroupChanged', (e) => rowGroupSources.push(e.source));

        api.showColumnChooser();

        const viewport = await waitFor(() => {
            const el = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
            expect(el).toBeTruthy();
            return el!;
        });

        // happy-dom has no layout engine, so force the virtual list to render its items.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        const entry = await waitFor(() => {
            const el = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((e) =>
                e.textContent?.includes('Athlete')
            );
            expect(el).toBeTruthy();
            return el!;
        });

        openContextMenu(entry);
        await userEvent.click(await openMenuOption('Group by Athlete'));

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toStrictEqual(['athlete']);
        // The chooser is launched from the column menu, so its stock actions report the column-menu
        // source, not the tool panel's 'toolPanelUi'.
        expect(rowGroupSources).toContain<ColumnEventType>('columnMenu');
        expect(rowGroupSources).not.toContain<ColumnEventType>('toolPanelUi');

        api.hideColumnChooser();
    });
});

describe('getColumnMenuItems module requirement', () => {
    const rowData = [{ athlete: 'Michael Phelps' }];
    const columnDefs = [{ field: 'athlete' }];

    // getColumnMenuItems drives the column menu (ColumnMenuModule) and the Columns Tool Panel /
    // Column Chooser (ColumnsToolPanelModule), so either surface module satisfies it. With
    // throwOn: ['error'] a missing-module error (#200) is thrown, so grid creation throwing is a
    // direct proxy for the validation firing.
    test('is satisfied by ColumnMenuModule alone, without ColumnsToolPanelModule', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnMenuModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('column-menu-only', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).not.toThrow();
        gridMgr.reset();
    });

    test('is satisfied by ColumnsToolPanelModule alone, without ColumnMenuModule', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ColumnsToolPanelModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('tool-panel-only', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).not.toThrow();
        gridMgr.reset();
    });

    test('still warns when neither the column menu nor the tool panel module is registered', () => {
        const gridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ValidationModule.with({ throwOn: ['error'] })],
        });
        expect(() =>
            gridMgr.createGrid('no-surface', {
                columnDefs,
                rowData,
                getColumnMenuItems: (params) => params.defaultItems,
            })
        ).toThrow(/getColumnMenuItems/);
        gridMgr.reset();
    });
});
