import { findByRole, fireEvent, getByText } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
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
export async function open(api: GridApi, zone: Zone, horizontal = false, name = 'B') {
    const item = pill(api, zone, horizontal, name);
    item.focus();
    fireEvent.contextMenu(item);
    return findByRole(getGridElement(api) as HTMLElement, 'menu');
}
