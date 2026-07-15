import type { AggregationStatusPanelAggFunc, GridApi, IStatusPanel } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule, NumberFilterModule, RowSelectionModule } from 'ag-grid-community';
import { CellSelectionModule, StatusBarModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

// Reads the rendered value of a name/value status item (total/filtered/selected panels, and the
// individual aggregation entries) identified by its label text.
function getStatusBarValue(gridDiv: HTMLElement, label: string): string | null {
    const items = Array.from(gridDiv.querySelectorAll<HTMLElement>('.ag-status-name-value'));
    for (let i = 0, len = items.length; i < len; ++i) {
        const item = items[i];
        const labelSpan = item.querySelector('span');
        if (labelSpan?.textContent === label) {
            return item.querySelector<HTMLElement>('.ag-status-name-value-value')?.textContent ?? null;
        }
    }
    return null;
}

// A name/value item is only meaningful to the user when it is displayed; the grid hides items via
// the `ag-hidden` class rather than removing them from the DOM.
function isStatusItemDisplayed(gridDiv: HTMLElement, label: string): boolean {
    const items = Array.from(gridDiv.querySelectorAll<HTMLElement>('.ag-status-name-value'));
    for (let i = 0, len = items.length; i < len; ++i) {
        const item = items[i];
        const labelSpan = item.querySelector('span');
        if (labelSpan?.textContent === label) {
            return !item.classList.contains('ag-hidden');
        }
    }
    return false;
}

function getPanel(gridDiv: HTMLElement, panelClass: string): HTMLElement | null {
    return gridDiv.querySelector<HTMLElement>(`.${panelClass}`);
}

function panelClassesInSlot(gridDiv: HTMLElement, slotClass: string): string[] {
    const slot = gridDiv.querySelector<HTMLElement>(`.${slotClass}`);
    const panels = slot?.querySelectorAll<HTMLElement>('.ag-status-panel') ?? [];
    const classes: string[] = [];
    for (let i = 0, len = panels.length; i < len; ++i) {
        const panel = panels[i];
        for (let j = 0, jlen = panel.classList.length; j < jlen; ++j) {
            const cls = panel.classList[j];
            if (cls !== 'ag-status-panel') {
                classes.push(cls);
            }
        }
    }
    return classes;
}

async function selectCellRange(
    api: GridApi,
    rowStartIndex: number,
    rowEndIndex: number,
    columns: string[]
): Promise<void> {
    const selectionChanged = waitForEvent('cellSelectionChanged', api);
    api.addCellRange({ rowStartIndex, rowEndIndex, columns });
    await selectionChanged;
}

describe('Status bar panels', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            StatusBarModule,
            CellSelectionModule,
            RowSelectionModule,
            NumberFilterModule,
            LocaleModule,
        ],
    });

    const rowData = [
        { id: 'r1', name: 'alpha', value: 10 },
        { id: 'r2', name: 'beta', value: 20 },
        { id: 'r3', name: 'gamma', value: 30 },
        { id: 'r4', name: 'delta', value: 40 },
    ];

    afterEach(() => {
        gridMgr.reset();
    });

    test('each configured panel renders in its aligned slot', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-alignment', {
            columnDefs: [{ field: 'name' }, { field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: {
                statusPanels: [
                    { statusPanel: 'agTotalRowCountComponent', align: 'left' },
                    { statusPanel: 'agFilteredRowCountComponent', align: 'center' },
                    { statusPanel: 'agAggregationComponent', align: 'right' },
                ],
            },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        expect(panelClassesInSlot(gridDiv, 'ag-status-bar-left')).toContain('ag-status-panel-total-row-count');
        expect(panelClassesInSlot(gridDiv, 'ag-status-bar-center')).toContain('ag-status-panel-filtered-row-count');
        expect(panelClassesInSlot(gridDiv, 'ag-status-bar-right')).toContain('ag-status-panel-aggregations');
    });

    test('agTotalRowCountComponent shows total and updates on setGridOption rowData', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-total', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: { statusPanels: [{ statusPanel: 'agTotalRowCountComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        expect(getStatusBarValue(gridDiv, 'Total Rows')).toBe('4');

        const modelUpdated = waitForEvent('modelUpdated', api);
        api.setGridOption('rowData', [...rowData, { id: 'r5', name: 'epsilon', value: 50 }]);
        await modelUpdated;

        expect(getStatusBarValue(gridDiv, 'Total Rows')).toBe('5');
    });

    test('agFilteredRowCountComponent shows filtered count, updates on filter apply/clear', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-filtered', {
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: { statusPanels: [{ statusPanel: 'agFilteredRowCountComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        // No filter active => nothing filtered out => panel hidden.
        expect(isStatusItemDisplayed(gridDiv, 'Filtered')).toBe(false);

        const filterApplied = waitForEvent('filterChanged', api);
        api.setFilterModel({ value: { filterType: 'number', type: 'lessThan', filter: 25 } });
        await filterApplied;

        expect(isStatusItemDisplayed(gridDiv, 'Filtered')).toBe(true);
        expect(getStatusBarValue(gridDiv, 'Filtered')).toBe('2');

        const filterCleared = waitForEvent('filterChanged', api);
        api.setFilterModel(null);
        await filterCleared;

        expect(isStatusItemDisplayed(gridDiv, 'Filtered')).toBe(false);
    });

    test('agTotalAndFilteredRowCountComponent shows both, hides filtered part when no filter active', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-total-and-filtered', {
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: { statusPanels: [{ statusPanel: 'agTotalAndFilteredRowCountComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        // No filter: just the total, no "x of y".
        expect(getStatusBarValue(gridDiv, 'Rows')).toBe('4');

        const filterApplied = waitForEvent('filterChanged', api);
        api.setFilterModel({ value: { filterType: 'number', type: 'lessThan', filter: 25 } });
        await filterApplied;

        expect(getStatusBarValue(gridDiv, 'Rows')).toBe('2 of 4');
    });

    test('agSelectedRowCountComponent updates on single, multi, select-all and deselect', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-selected', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            rowSelection: { mode: 'multiRow' },
            statusBar: { statusPanels: [{ statusPanel: 'agSelectedRowCountComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        // Nothing selected => panel hidden.
        expect(isStatusItemDisplayed(gridDiv, 'Selected')).toBe(false);

        const singleSelected = waitForEvent('selectionChanged', api);
        api.getRowNode('r1')!.setSelected(true);
        await singleSelected;
        expect(isStatusItemDisplayed(gridDiv, 'Selected')).toBe(true);
        expect(getStatusBarValue(gridDiv, 'Selected')).toBe('1');

        const multiSelected = waitForEvent('selectionChanged', api);
        api.getRowNode('r2')!.setSelected(true);
        await multiSelected;
        expect(getStatusBarValue(gridDiv, 'Selected')).toBe('2');

        const allSelected = waitForEvent('selectionChanged', api);
        api.selectAll();
        await allSelected;
        expect(getStatusBarValue(gridDiv, 'Selected')).toBe('4');

        const allDeselected = waitForEvent('selectionChanged', api);
        api.deselectAll();
        await allDeselected;
        expect(isStatusItemDisplayed(gridDiv, 'Selected')).toBe(false);
    });

    test('agAggregationComponent shows sum/avg/min/max/count for numeric ranges', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-agg-numeric', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await selectCellRange(api, 0, 3, ['value']);

        expect(getStatusBarValue(gridDiv, 'Count')).toBe('4');
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('100');
        expect(getStatusBarValue(gridDiv, 'Min')).toBe('10');
        expect(getStatusBarValue(gridDiv, 'Max')).toBe('40');
        expect(getStatusBarValue(gridDiv, 'Average')).toBe('25');
    });

    test('agAggregationComponent shows only count for non-numeric ranges', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-agg-nonnumeric', {
            columnDefs: [{ field: 'name' }],
            rowData,
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await selectCellRange(api, 0, 3, ['name']);

        expect(isStatusItemDisplayed(gridDiv, 'Count')).toBe(true);
        expect(getStatusBarValue(gridDiv, 'Count')).toBe('4');
        expect(isStatusItemDisplayed(gridDiv, 'Sum')).toBe(false);
        expect(isStatusItemDisplayed(gridDiv, 'Min')).toBe(false);
        expect(isStatusItemDisplayed(gridDiv, 'Max')).toBe(false);
        expect(isStatusItemDisplayed(gridDiv, 'Average')).toBe(false);
    });

    test('aggregation panel aggFuncs config restricts which aggregations display', async () => {
        const aggFuncs: AggregationStatusPanelAggFunc[] = ['sum', 'count'];
        const api = await gridMgr.createGridAndWait('status-bar-agg-funcs', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: {
                statusPanels: [{ statusPanel: 'agAggregationComponent', statusPanelParams: { aggFuncs } }],
            },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await selectCellRange(api, 0, 3, ['value']);

        expect(isStatusItemDisplayed(gridDiv, 'Sum')).toBe(true);
        expect(isStatusItemDisplayed(gridDiv, 'Count')).toBe(true);
        expect(isStatusItemDisplayed(gridDiv, 'Min')).toBe(false);
        expect(isStatusItemDisplayed(gridDiv, 'Max')).toBe(false);
        expect(isStatusItemDisplayed(gridDiv, 'Average')).toBe(false);
    });

    test('aggregation panel recomputes when the cell range changes', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-agg-recompute', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await selectCellRange(api, 0, 1, ['value']);
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('30');

        api.clearCellSelection();
        await selectCellRange(api, 2, 3, ['value']);
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('70');
    });

    test('getStatusPanel returns the instance and undefined for unknown keys', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-get-panel', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: {
                statusPanels: [
                    { statusPanel: 'agTotalRowCountComponent' },
                    { statusPanel: 'agAggregationComponent', key: 'myAgg' },
                ],
            },
        });

        expect(api.getStatusPanel<IStatusPanel>('agTotalRowCountComponent')).toBeDefined();
        // custom key is used in preference to the component name
        expect(api.getStatusPanel<IStatusPanel>('myAgg')).toBeDefined();
        expect(api.getStatusPanel<IStatusPanel>('agAggregationComponent')).toBeUndefined();
        expect(api.getStatusPanel<IStatusPanel>('doesNotExist')).toBeUndefined();
    });

    test('aggregation over a range excludes rows hidden by a filter', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-agg-hidden-rows', {
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData,
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;

        const filterApplied = waitForEvent('filterChanged', api);
        api.setFilterModel({ value: { filterType: 'number', type: 'lessThan', filter: 25 } });
        await filterApplied;

        // Only rows r1 (10) and r2 (20) remain displayed; the range spans both displayed rows.
        await selectCellRange(api, 0, 1, ['value']);
        expect(getStatusBarValue(gridDiv, 'Count')).toBe('2');
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('30');
    });

    test('status bar is hidden entirely when statusBar removed via setGridOption', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-removed', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            statusBar: { statusPanels: [{ statusPanel: 'agTotalRowCountComponent' }] },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const statusBar = getPanel(gridDiv, 'ag-status-bar')!;
        expect(statusBar.classList.contains('ag-hidden')).toBe(false);

        api.setGridOption('statusBar', undefined);

        expect(statusBar.classList.contains('ag-hidden')).toBe(true);
    });

    test('panel labels use provided localeText keys', async () => {
        const api = await gridMgr.createGridAndWait('status-bar-locale', {
            columnDefs: [{ field: 'value' }],
            rowData,
            getRowId: (params) => params.data?.id,
            localeText: { totalRows: 'Grand Total', sum: 'Somme' },
            cellSelection: true,
            statusBar: {
                statusPanels: [{ statusPanel: 'agTotalRowCountComponent' }, { statusPanel: 'agAggregationComponent' }],
            },
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        expect(getStatusBarValue(gridDiv, 'Grand Total')).toBe('4');

        await selectCellRange(api, 0, 3, ['value']);
        expect(getStatusBarValue(gridDiv, 'Somme')).toBe('100');
    });
});
