import { findByRole, fireEvent, getByText } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { Column, GridApi, GridOptions } from 'ag-grid-community';
import { LocaleModule, getGridElement } from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

/** Builders and readers shared by the drop zone move menu suites, split across files to run in parallel. */
export type Zone = 'rowGroup' | 'pivot' | 'aggregation';

/** Registers the suite hooks and returns its grids managers and grid builders. */
export function setupDropZoneMoveMenuSuite() {
    const grids = new TestGridsManager({
        modules: [ColumnsToolPanelModule, PivotModule, RowGroupingModule, RowGroupingPanelModule],
    });
    const headerGrids = new TestGridsManager({ modules: [RowGroupingModule, RowGroupingPanelModule, LocaleModule] });

    afterEach(() => {
        // Ends the process-wide keyboard mode a key press left on, in which every drop-zone refresh scans the grid.
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        grids.reset();
        headerGrids.reset();
    });

    const create = (zone: Zone, options: GridOptions = {}, manager = grids) =>
        manager.createGridAndWait('grid', {
            columnDefs: [
                ...['a', 'b', 'c'].map((field) => ({
                    field,
                    enableRowGroup: true,
                    enablePivot: true,
                    enableValue: true,
                    rowGroup: zone === 'rowGroup',
                    pivot: zone === 'pivot',
                    aggFunc: zone === 'aggregation' ? 'sum' : undefined,
                })),
                ...(zone === 'pivot' ? [{ field: 'value', aggFunc: 'sum' }] : []),
            ],
            rowData: [{ a: 1, b: 2, c: 3, value: 4 }],
            pivotMode: zone === 'pivot',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            ...options,
        });

    const createDeferred = (zone: Zone, options: GridOptions = {}) =>
        create(zone, {
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columnsToolPanel',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel', 'reset'] },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            ...options,
        });

    return { grids, headerGrids, create, createDeferred };
}

export const order = (api: GridApi, zone: Zone) => {
    const columns =
        zone === 'rowGroup'
            ? api.getRowGroupColumns()
            : zone === 'pivot'
              ? api.getPivotColumns()
              : api.getValueColumns();
    return columns.map((col) => col.getColId());
};
export const panel = (api: GridApi, zone: Zone, horizontal = false) =>
    getGridElement(api)!.querySelector<HTMLElement>(
        `.ag-column-drop-${horizontal ? 'horizontal' : 'vertical'}.ag-column-drop-${zone.toLowerCase()}`
    )!;
export const pill = (api: GridApi, zone: Zone, horizontal = false, name = 'B') =>
    getByText(panel(api, zone, horizontal), zone === 'aggregation' ? `sum(${name})` : name).closest<HTMLElement>(
        '.ag-column-drop-cell'
    )!;

/** The part of a drop zone panel that tests call directly. */
interface DropZonePanel {
    openChipMenu(column: Column | null): boolean;
}
const TOOL_PANEL_DROP_ZONE_FIELDS: Record<Zone, string> = {
    rowGroup: 'rowGroupDropZonePanel',
    pivot: 'pivotDropZonePanel',
    aggregation: 'valuesDropZonePanel',
};
/**
 * The columns tool panel's drop zone panel for `zone`. No grid API opens a chip menu, so tests of
 * `openChipMenu` reach the panel here, the one place that names the tool panel's private fields.
 */
export const toolPanelDropZone = (api: GridApi, zone: Zone) =>
    (api.getToolPanelInstance('columns') as unknown as Record<string, DropZonePanel>)[
        TOOL_PANEL_DROP_ZONE_FIELDS[zone]
    ];

export async function open(api: GridApi, zone: Zone, horizontal = false, name = 'B') {
    const item = pill(api, zone, horizontal, name);
    item.focus();
    fireEvent.contextMenu(item);
    return findByRole(getGridElement(api) as HTMLElement, 'menu');
}

/** The menu's items in order: item names, with each separator as `'separator'`. */
export const menuEntries = (menu: HTMLElement) =>
    Array.from(menu.querySelectorAll('[role="menuitem"], .ag-menu-separator'), (el) =>
        el.classList.contains('ag-menu-separator') ? 'separator' : el.textContent!
    );

/** The names of the menu's disabled items. */
export const disabledEntries = (menu: HTMLElement) =>
    Array.from(menu.querySelectorAll('[role="menuitem"][aria-disabled="true"]'), (el) => el.textContent!);

/** The trimmed texts of the chips in a drop zone panel. */
export const chips = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ag-column-drop-cell-text'), (el) => el.textContent!.trim());

const SORT_ENTRIES: Record<Zone, string[]> = {
    rowGroup: ['Sort Ascending', 'Sort Descending'],
    pivot: ['Sort Ascending', 'Sort Descending', 'Clear Sort'],
    aggregation: ['Sort Ascending', 'Sort Descending'],
};
const MOVE_TO_ENTRIES: Record<Zone, string[]> = {
    rowGroup: ['Move to Values'],
    pivot: ['Move to Row Groups', 'Move to Values'],
    aggregation: ['Move to Row Groups'],
};

export const moveLabels = (horizontal: boolean) =>
    horizontal ? ['Move Left', 'Move Right'] : ['Move Up', 'Move Down'];

/** The default menu of a chip in the `create` fixture, optionally without its Move to items (as for a read-only chip). */
export const defaultMenuEntries = (zone: Zone, horizontal = false, withMoveTo = true) =>
    [SORT_ENTRIES[zone], withMoveTo ? MOVE_TO_ENTRIES[zone] : [], moveLabels(horizontal), ['Remove Field']]
        .filter((section) => section.length)
        .flatMap((section, index) => (index ? ['separator', ...section] : section));
