import { findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { ColDef, GridApi } from 'ag-grid-community';
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
});
