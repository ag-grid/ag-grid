import { findByText, queryByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { ColDef, ColumnEventType, GetColumnMenuItemsParams, GridApi, GridOptions } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ToolPanelContextMenu', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowDataFactory = () => [
        { athlete: 'Michael Phelps', age: 23, country: 'United States', year: 2008 },
        { athlete: 'Michael Phelps', age: 19, country: 'United States', year: 2004 },
        { athlete: 'Michael Phelps', age: 27, country: 'United States', year: 2012 },
    ];

    const columnDefs: ColDef[] = [
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 180 },
        { field: 'year' },
    ];
    let rowData: any[];

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    /**
     * Locate the tool-panel virtual-list row whose displayName is `label` and return its
     * focus-wrapper element — the element AG Grid registers the `contextmenu` listener on.
     * Virtual lists only render visible items, so if `getComponentAt` returns nothing we
     * materialise a comp via `createComponentFromItem` (same fallback used in
     * deferred-pivot-mode.test.ts).
     */
    async function getColumnEntry(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<HTMLElement> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const rowIndex = displayedColsList.findIndex((item) => item.displayName === label);
        if (rowIndex < 0) {
            throw new Error(`Tool-panel column entry not found for displayName="${label}"`);
        }

        listPanel['virtualList'].ensureIndexVisible(rowIndex);
        await asyncSetTimeout(0);

        const rendered = listPanel['virtualList'].getComponentAt(rowIndex) as any;
        if (rendered) {
            const renderedEl = rendered.getGui() as HTMLElement;
            return (renderedEl.closest('.ag-virtual-list-item') as HTMLElement | null) ?? renderedEl;
        }

        // Fallback: virtual list didn't render the item (jsdom layout). Construct a column
        // comp with a synthetic focus-wrapper attached to the grid so its event listeners
        // (incl. contextmenu) are registered on a live DOM node.
        const focusWrapper = document.createElement('div');
        focusWrapper.classList.add('ag-virtual-list-item');
        gridDiv.appendChild(focusWrapper);
        const comp = listPanel['createComponentFromItem'](displayedColsList[rowIndex], focusWrapper);
        focusWrapper.appendChild(comp.getGui());
        return focusWrapper;
    }

    /**
     * Open the tool-panel context menu for the given column. Dispatches a real `contextmenu`
     * MouseEvent on the column entry's focus wrapper — same path AG Grid uses in production.
     * The menu is appended to the popup layer and clickable via `findByText`.
     */
    async function openContextMenu(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<void> {
        const entry = await getColumnEntry(toolPanel, gridDiv, label);
        entry.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );
        await asyncSetTimeout(1);
    }

    async function clickMenuItem(gridDiv: HTMLElement, label: string): Promise<void> {
        const menuItem = await findByText(gridDiv, label);
        await userEvent.click(menuItem);
        await asyncSetTimeout(1);
    }

    describe('non-deferred mode', () => {
        let gridApi: GridApi;
        let gridDiv: HTMLElement;
        let toolPanel: any;

        beforeEach(async () => {
            gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    enableValue: true,
                    enableRowGroup: true,
                },
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });

            gridDiv = getGridElement(gridApi)! as HTMLElement;
            toolPanel = gridApi.getToolPanelInstance('columns') as any;
            await asyncSetTimeout(1);
        });

        const getGroupedRowIds = () => gridApi.getRowGroupColumns().map((col) => col.getId());
        const getToolPanelRowGroupLabels = () =>
            Array.from(toolPanel.rowGroupDropZonePanel.getGui().querySelectorAll('.ag-column-drop-cell-text')).map(
                (element: HTMLElement) => element.textContent?.trim()
            );

        test('user can add a row group by clicking the tool panel context menu item', async () => {
            expect(getGroupedRowIds()).toStrictEqual([]);

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Group by Athlete');

            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
        });

        test("stock actions invoked from the tool panel emit column events with source 'toolPanelUi'", async () => {
            const rowGroupSources: ColumnEventType[] = [];
            gridApi.addEventListener('columnRowGroupChanged', (e) => rowGroupSources.push(e.source));

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Group by Athlete');

            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
            expect(rowGroupSources).toContain<ColumnEventType>('toolPanelUi');
            expect(rowGroupSources).not.toContain<ColumnEventType>('columnMenu');
        });

        test('user can remove a row group by clicking the tool panel context menu item', async () => {
            gridApi.addRowGroupColumns(['athlete', 'age']);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Un-Group by Athlete');

            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('group and ungroup context menu actions update the tool panel row group pills', async () => {
            expect(getToolPanelRowGroupLabels()).toStrictEqual([]);

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Group by Athlete');

            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
            expect(getToolPanelRowGroupLabels()).toStrictEqual(['Athlete']);

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Un-Group by Athlete');

            expect(getGroupedRowIds()).toStrictEqual([]);
            expect(getToolPanelRowGroupLabels()).toStrictEqual([]);
        });

        test('add-to-values context menu action adds the column as an aggregation', async () => {
            expect(gridApi.getValueColumns().map((c) => c.getColId())).toStrictEqual([]);

            await openContextMenu(toolPanel, gridDiv, 'Age');
            await clickMenuItem(gridDiv, 'Add Age to values');

            expect(gridApi.getValueColumns().map((c) => c.getColId())).toStrictEqual(['age']);
        });
    });

    describe('deferred mode', () => {
        function getDeferredActionButton(toolPanel: any, action: 'Apply' | 'Cancel'): HTMLButtonElement {
            const button = Array.from(toolPanel.getGui().querySelectorAll('.ag-column-panel-buttons-button')).find(
                (candidate: HTMLButtonElement) => candidate.textContent?.trim() === action
            ) as HTMLButtonElement;
            expect(button).toBeTruthy();
            return button!;
        }

        function getToolPanelRowGroupLabels(toolPanel: any): Array<string | undefined> {
            return Array.from(
                toolPanel.rowGroupDropZonePanel.getGui().querySelectorAll('.ag-column-drop-cell-text')
            ).map((element: HTMLElement) => element.textContent?.trim());
        }

        function getToolPanelDropZoneText(panel: any): string {
            return panel.getGui().textContent ?? '';
        }

        async function createDeferredGrid(
            cols: ColDef[],
            defaultColDef: ColDef,
            extra: Partial<{ pivotMode: boolean }> = {}
        ): Promise<{ gridApi: GridApi; gridDiv: HTMLElement; toolPanel: any }> {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: cols,
                rowData,
                defaultColDef: { flex: 1, minWidth: 100, ...defaultColDef },
                ...extra,
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            await asyncSetTimeout(1);
            return {
                gridApi,
                gridDiv: getGridElement(gridApi)! as HTMLElement,
                toolPanel: gridApi.getToolPanelInstance('columns') as any,
            };
        }

        test('row group context menu action in deferred mode applies only after clicking Apply', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(columnDefs, { enableRowGroup: true });

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Group by Athlete');

            expect(gridApi.getRowGroupColumns()).toEqual([]);

            getDeferredActionButton(toolPanel, 'Apply').click();
            await asyncSetTimeout(1);

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['athlete']);
        });

        test('row group context menu actions in deferred mode update the tool panel pills immediately', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(columnDefs, { enableRowGroup: true });

            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual([]);

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Group by Athlete');

            expect(gridApi.getRowGroupColumns()).toEqual([]);
            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual(['Athlete']);

            getDeferredActionButton(toolPanel, 'Cancel').click();
            await asyncSetTimeout(1);

            expect(gridApi.getRowGroupColumns()).toEqual([]);
            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual([]);
        });

        test('value context menu action in deferred mode is discarded by Cancel', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(columnDefs, { enableValue: true });

            await openContextMenu(toolPanel, gridDiv, 'Age');
            await clickMenuItem(gridDiv, 'Add Age to values');

            expect(gridApi.getValueColumns()).toEqual([]);

            getDeferredActionButton(toolPanel, 'Cancel').click();
            await asyncSetTimeout(1);

            expect(gridApi.getValueColumns()).toEqual([]);
        });

        test('value context menu actions in deferred mode update the tool panel pills immediately', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(columnDefs, { enableValue: true });

            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');

            await openContextMenu(toolPanel, gridDiv, 'Age');
            await clickMenuItem(gridDiv, 'Add Age to values');

            expect(gridApi.getValueColumns()).toEqual([]);
            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).toContain('Age');

            getDeferredActionButton(toolPanel, 'Cancel').click();
            await asyncSetTimeout(1);

            expect(gridApi.getValueColumns()).toEqual([]);
            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');
        });

        test('pivot context menu action in deferred pivot mode applies only after clicking Apply', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(
                [
                    { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
                    { field: 'country', enableRowGroup: true, enablePivot: true },
                    { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
                    { field: 'age', enableValue: true, aggFunc: 'sum' },
                ],
                {},
                { pivotMode: true }
            );

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

            await openContextMenu(toolPanel, gridDiv, 'Country');
            await clickMenuItem(gridDiv, 'Add Country to labels');

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

            getDeferredActionButton(toolPanel, 'Apply').click();
            await asyncSetTimeout(1);

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'country']);
        });

        test('pivot context menu actions in deferred pivot mode update the tool panel pills immediately', async () => {
            const { gridApi, gridDiv, toolPanel } = await createDeferredGrid(
                [
                    { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
                    { field: 'country', enableRowGroup: true, enablePivot: true },
                    { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
                    { field: 'age', enableValue: true, aggFunc: 'sum' },
                ],
                {},
                { pivotMode: true }
            );

            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Country');

            await openContextMenu(toolPanel, gridDiv, 'Country');
            await clickMenuItem(gridDiv, 'Add Country to labels');

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).toContain('Country');

            getDeferredActionButton(toolPanel, 'Cancel').click();
            await asyncSetTimeout(1);

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Country');
        });
    });

    describe('customisation via columnMenuItems / getColumnMenuItems', () => {
        async function createGrid(
            cols: ColDef[],
            gridOptions: Partial<GridOptions>
        ): Promise<{ gridApi: GridApi; gridDiv: HTMLElement; toolPanel: any }> {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: cols,
                rowData,
                defaultColDef: { flex: 1, minWidth: 100, enableValue: true, enableRowGroup: true },
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
                ...gridOptions,
            });
            await asyncSetTimeout(1);
            return {
                gridApi,
                gridDiv: getGridElement(gridApi)! as HTMLElement,
                toolPanel: gridApi.getToolPanelInstance('columns') as any,
            };
        }

        test('col-level columnMenuItems adds a custom item to the tool panel menu and runs its action', async () => {
            const action = vi.fn();
            const { gridDiv, toolPanel } = await createGrid(
                [
                    { field: 'athlete', minWidth: 200, columnMenuItems: [{ name: 'Highlight column', action }] },
                    { field: 'age' },
                ],
                {}
            );

            await openContextMenu(toolPanel, gridDiv, 'Athlete');
            await clickMenuItem(gridDiv, 'Highlight column');

            expect(action).toHaveBeenCalled();
        });

        test('getColumnMenuItems fires with source "columnsToolPanel" and the built-in default items', async () => {
            const getColumnMenuItems = vi.fn((params: GetColumnMenuItemsParams) => [
                ...params.defaultItems,
                { name: 'Custom' },
            ]);
            const { gridDiv, toolPanel } = await createGrid(columnDefs, { getColumnMenuItems });

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            // built-in item is still present, and the custom item is appended
            await findByText(gridDiv, 'Group by Athlete');
            await findByText(gridDiv, 'Custom');

            expect(getColumnMenuItems).toHaveBeenCalledWith(expect.objectContaining({ source: 'columnsToolPanel' }));
            const { defaultItems } = getColumnMenuItems.mock.calls[0][0];
            expect(defaultItems).toContain('rowGroup');
            expect(defaultItems.every((item) => typeof item === 'string')).toBe(true);
        });

        test('col-level columnMenuItems takes precedence over grid getColumnMenuItems', async () => {
            const getColumnMenuItems = vi.fn(() => [{ name: 'FromGrid' }]);
            const { gridDiv, toolPanel } = await createGrid(
                [{ field: 'athlete', minWidth: 200, columnMenuItems: [{ name: 'FromColumn' }] }, { field: 'age' }],
                { getColumnMenuItems }
            );

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            await findByText(gridDiv, 'FromColumn');
            expect(queryByText(gridDiv, 'FromGrid')).toBeNull();
            expect(getColumnMenuItems).not.toHaveBeenCalled();
        });

        test("returning 'pinSubMenu' renders the pin item in the tool panel menu", async () => {
            const { gridDiv, toolPanel } = await createGrid(
                [
                    {
                        field: 'athlete',
                        minWidth: 200,
                        columnMenuItems: (params) => [...params.defaultItems, 'pinSubMenu'],
                    },
                    { field: 'age' },
                ],
                {}
            );

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            await findByText(gridDiv, 'Pin Column');
        });

        test('under functionsReadOnly a callback still opens the menu without the state-changing defaults', async () => {
            const getColumnMenuItems = vi.fn((params: GetColumnMenuItemsParams) => [
                ...params.defaultItems,
                { name: 'Read-only custom' },
            ]);
            const { gridDiv, toolPanel } = await createGrid(columnDefs, {
                functionsReadOnly: true,
                getColumnMenuItems,
            });

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            await findByText(gridDiv, 'Read-only custom');
            expect(queryByText(gridDiv, 'Group by Athlete')).toBeNull();
            expect(getColumnMenuItems.mock.calls[0][0].defaultItems).toEqual([]);
        });

        test('under functionsReadOnly with no callback the tool panel menu does not open', async () => {
            const { gridDiv, toolPanel } = await createGrid(columnDefs, { functionsReadOnly: true });

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            expect(queryByText(gridDiv, 'Group by Athlete')).toBeNull();
        });

        test('a separator stranded by empty default items is collapsed (matches the column menu)', async () => {
            const getColumnMenuItems = vi.fn((params: GetColumnMenuItemsParams) => [
                ...params.defaultItems,
                'separator' as const,
                { name: 'Lonely Item' },
            ]);
            // functionsReadOnly forces defaultItems to [], leaving the returned list starting with a separator.
            const { gridDiv, toolPanel } = await createGrid(columnDefs, {
                functionsReadOnly: true,
                getColumnMenuItems,
            });

            await openContextMenu(toolPanel, gridDiv, 'Athlete');

            await findByText(gridDiv, 'Lonely Item');
            expect(gridDiv.querySelectorAll('.ag-menu-separator')).toHaveLength(0);
        });

        test('suppresses the native context menu when a configured menu resolves to empty', async () => {
            const { gridDiv, toolPanel } = await createGrid(
                [{ field: 'athlete', minWidth: 200, columnMenuItems: [] }, { field: 'age' }],
                {}
            );

            const entry = await getColumnEntry(toolPanel, gridDiv, 'Athlete');
            const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
            entry.dispatchEvent(event);
            await asyncSetTimeout(1);

            // AG Grid handled the gesture (columnMenuItems is configured) so the browser menu is suppressed,
            // even though the resolved menu is empty and nothing opens.
            expect(event.defaultPrevented).toBe(true);
            expect(queryByText(gridDiv, 'Group by Athlete')).toBeNull();
        });

        test('a grid-level getColumnMenuItems resolving to empty does not suppress the native menu', async () => {
            const getColumnMenuItems = vi.fn(() => []);
            const { gridDiv, toolPanel } = await createGrid(columnDefs, { getColumnMenuItems });

            const entry = await getColumnEntry(toolPanel, gridDiv, 'Athlete');
            const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
            entry.dispatchEvent(event);
            await asyncSetTimeout(1);

            // Unlike a per-column columnMenuItems, a grid-level callback that returns nothing for this column
            // does not claim the gesture, so the browser's native menu is left to show.
            expect(event.defaultPrevented).toBe(false);
            expect(queryByText(gridDiv, 'Group by Athlete')).toBeNull();
        });

        test('under functionsReadOnly an explicitly-returned state-changing token is shown disabled', async () => {
            const getColumnMenuItems = vi.fn((_params: GetColumnMenuItemsParams) => ['value' as const]);
            const { gridApi, gridDiv, toolPanel } = await createGrid(columnDefs, {
                functionsReadOnly: true,
                getColumnMenuItems,
            });

            await openContextMenu(toolPanel, gridDiv, 'Age');

            const option = await findByText(gridDiv, 'Add Age to values');
            expect(option.closest('.ag-menu-option')!.classList.contains('ag-menu-option-disabled')).toBe(true);

            // The disabled item must not mutate value state when clicked.
            await userEvent.click(option);
            await asyncSetTimeout(1);
            expect(gridApi.getValueColumns().map((col) => col.getColId())).not.toContain('age');
        });
    });
});
