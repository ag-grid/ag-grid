import { fireEvent, getByTestId } from '@testing-library/dom';

import type { AgColumn, ColDef, ColGroupDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import { DragSourceType, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import {
    DragEventDispatcher,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForNoLoadingRows,
} from '../test-utils';
import { createFakeServer, createServerSideDatasource } from './deferredPivotModeFakeServer';

describe('deferred column tool panel pivot mode', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const rowGroupingOnlyGridMgr = new TestGridsManager({
        modules: [RowGroupingModule, RowGroupingPanelModule],
    });

    const rowData = [
        {
            athlete: 'Michael Phelps',
            age: 23,
            country: 'United States',
            year: 2008,
            date: '24/08/2008',
            sport: 'Swimming',
            gold: 8,
            silver: 0,
            bronze: 0,
            total: 8,
        },
        {
            athlete: 'Michael Phelps',
            age: 19,
            country: 'United States',
            year: 2004,
            date: '29/08/2004',
            sport: 'Swimming',
            gold: 6,
            silver: 0,
            bronze: 2,
            total: 8,
        },
        {
            athlete: 'Julian Weber',
            age: 24,
            country: 'Romania',
            year: 2000,
            date: '01/10/2000',
            sport: 'Gymnastics',
            gold: 2,
            silver: 1,
            bronze: 3,
            total: 6,
        },
    ];

    const baseColumnDefs: ColDef[] = [
        { field: 'athlete', minWidth: 200, enableRowGroup: true, enablePivot: true },
        { field: 'age', enableValue: true },
        { field: 'country', minWidth: 200, enableRowGroup: true, enablePivot: true, rowGroupIndex: 1 },
        { field: 'year', enableRowGroup: true, enablePivot: true, pivotIndex: 1 },
        { field: 'date', minWidth: 180, enableRowGroup: true, enablePivot: true },
        { field: 'sport', minWidth: 200, enableRowGroup: true, enablePivot: true, rowGroupIndex: 2 },
        { field: 'gold', hide: true, enableValue: true },
        { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
        { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
        { headerName: 'Total', field: 'total', enableValue: true },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        rowGroupingOnlyGridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    async function createDeferredPivotModeGrid(): Promise<{
        gridApi: GridApi;
        toolPanel: any;
        toolPanelGui: HTMLElement;
        serverGetDataSpy: ReturnType<typeof vi.spyOn>;
    }> {
        const fakeServer = createFakeServer(rowData as any);
        const serverGetDataSpy = vi.spyOn(fakeServer, 'getData');
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
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
            serverSideDatasource: createServerSideDatasource(fakeServer),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        return {
            gridApi,
            toolPanel,
            toolPanelGui: toolPanel.getGui(),
            serverGetDataSpy,
        };
    }

    async function createDeferredNonPivotGrid(columnDefs: ColDef[] = baseColumnDefs): Promise<{
        gridApi: GridApi;
        toolPanel: any;
        toolPanelGui: HTMLElement;
    }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
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

        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        return {
            gridApi,
            toolPanel,
            toolPanelGui: toolPanel.getGui(),
        };
    }

    async function createNonDeferredPivotModeGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            rowData,
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
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

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createRowGroupingOnlyGrid(): Promise<GridApi> {
        const gridApi = await rowGroupingOnlyGridMgr.createGridAndWait('rowGroupingOnlyGrid', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true, enableRowGroup: true },
                { field: 'gold' },
            ],
            rowData,
            rowGroupPanelShow: 'always',
        });

        await asyncSetTimeout(50);
        return gridApi;
    }

    async function createDeferredNonPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid([
            { field: 'athlete', rowGroup: true, enableRowGroup: true },
            { field: 'country', rowGroup: true, enableRowGroup: true },
            { field: 'gold', enableValue: true, aggFunc: 'sum' },
            { field: 'silver', enableValue: true, aggFunc: 'sum' },
            { field: 'bronze', enableValue: true },
        ]);

        return { gridApi, toolPanel };
    }

    async function createDeferredGroupedNonPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid([
            {
                headerName: 'Group A',
                children: [{ field: 'athlete' }, { field: 'age' }],
            },
            {
                headerName: 'Group B',
                children: [{ field: 'country' }, { field: 'year' }],
            },
        ] as ColGroupDef[]);

        return { gridApi, toolPanel };
    }

    async function createDeferredGroupedPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid([
            {
                headerName: 'Group A',
                children: [
                    { field: 'athlete', enableRowGroup: true, enablePivot: true },
                    { field: 'age', enableValue: true },
                ],
            },
            {
                headerName: 'Group B',
                children: [
                    { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                    { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
                ],
            },
        ] as ColGroupDef[]);

        gridApi.setGridOption('pivotMode', true);
        await asyncSetTimeout(50);

        return { gridApi, toolPanel };
    }

    async function createDeferredPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const fakeServer = createFakeServer(rowData as any);
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
                { field: 'silver', enableValue: true, aggFunc: 'sum' },
                { field: 'bronze', enableValue: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
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
            serverSideDatasource: createServerSideDatasource(fakeServer),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    function getApplyButton(toolPanelGui: HTMLElement): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === 'Apply'
        )!;
    }

    function getCancelButton(toolPanelGui: HTMLElement): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === 'Cancel'
        )!;
    }

    function getPivotModeToggle(toolPanelGui: HTMLElement): HTMLInputElement {
        return getByTestId(toolPanelGui, agTestIdFor.pivotModeSelect()) as HTMLInputElement;
    }

    function getSelectAllCheckbox(toolPanelGui: HTMLElement): HTMLInputElement {
        return getByTestId(toolPanelGui, agTestIdFor.columnPanelSelectHeaderCheckbox()) as HTMLInputElement;
    }

    function createPrimaryColumnComp(toolPanel: any, label: string): any {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const rowIndex = displayedColsList.findIndex((item) => item.displayName === label);
        expect(rowIndex).toBeGreaterThanOrEqual(0);

        return listPanel['createComponentFromItem'](displayedColsList[rowIndex], document.createElement('div'));
    }

    function getUpdateStrategy(toolPanel: any): IColumnStateUpdateStrategy {
        return toolPanel.beans.columnStateUpdateStrategy;
    }

    function isDeferred(toolPanel: any): boolean {
        return !!toolPanel['isDeferModeEnabled'];
    }

    function commitChanges(toolPanel: any): void {
        getUpdateStrategy(toolPanel).commit(isDeferred(toolPanel));
    }

    function cancelDeferredChanges(toolPanel: any): void {
        toolPanel['onDeferredCancel']();
    }

    function getPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.beans.colModel.colDefList.map((col: any) => col.getColId());
    }

    function getDisplayedPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.primaryColsPanel.primaryColsListPanel
            .getDisplayedColsList()
            .filter((item: any) => !item.group)
            .map((item: any) => item.column.getColId());
    }

    function getValueColumnIds(gridApi: GridApi): string[] {
        return gridApi.getValueColumns().map((col) => col.getColId());
    }

    function getDropZoneText(panel: any): string {
        return panel.getGui().textContent ?? '';
    }

    function createSortEvent(init: MouseEventInit = {}): MouseEvent {
        return new MouseEvent('click', { bubbles: true, ...init });
    }

    function removeDropZonePill(toolPanelGui: HTMLElement, label: string): void {
        const pill = Array.from(toolPanelGui.querySelectorAll<HTMLElement>('[aria-label]')).find((element) =>
            element.getAttribute('aria-label')?.startsWith(label)
        );
        expect(pill).toBeTruthy();
        fireEvent.keyDown(pill!, { key: 'Delete' });
    }

    async function getRenderedPrimaryColumnDragHandle(
        toolPanel: any,
        toolPanelGui: HTMLElement,
        label: string
    ): Promise<HTMLElement> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const rowIndex = displayedColsList.findIndex((item) => item.displayName === label);
        expect(rowIndex).toBeGreaterThanOrEqual(0);

        listPanel['virtualList'].ensureIndexVisible(rowIndex);
        await asyncSetTimeout(50);

        let columnElement = (listPanel['virtualList'].getComponentAt(rowIndex) as any)?.getGui() as
            | HTMLElement
            | undefined;

        if (!columnElement) {
            columnElement = createPrimaryColumnComp(toolPanel, label).getGui() as HTMLElement;
            toolPanelGui.appendChild(columnElement);
        }

        expect(columnElement).toBeTruthy();

        const dragHandle = columnElement!.querySelector<HTMLElement>('.ag-drag-handle');
        expect(dragHandle).toBeTruthy();

        return dragHandle!;
    }

    async function addPrimaryColumnBackToRowGroups(toolPanel: any, gridApi: GridApi, colId: string): Promise<void> {
        toolPanel.rowGroupDropZonePanel.addItem(gridApi.getColumn(colId)!);
        await asyncSetTimeout(50);
    }

    async function dragRenderedPrimaryColumnToRowGroups(
        toolPanel: any,
        toolPanelGui: HTMLElement,
        label: string,
        dropZoneGui: HTMLElement
    ) {
        const dragHandle = await getRenderedPrimaryColumnDragHandle(toolPanel, toolPanelGui, label);
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const ownerDocument = dropZoneGui.ownerDocument;
        const originalElementsFromPoint = ownerDocument.elementsFromPoint?.bind(ownerDocument);
        const originalDragRect = dragHandle.getBoundingClientRect.bind(dragHandle);
        const originalDropZoneRect = dropZoneGui.getBoundingClientRect.bind(dropZoneGui);
        const dragRect = new DOMRect(10, 10, 24, 24);
        const dropRect = new DOMRect(100, 100, 240, 80);

        ownerDocument.elementsFromPoint = () => [dropZoneGui];
        dragHandle.getBoundingClientRect = () => dragRect;
        dropZoneGui.getBoundingClientRect = () => dropRect;

        try {
            await dispatcher.startDrag(dragHandle, dragRect.left + 2, dragRect.top + 2);
            await dispatcher.movePointer(dropZoneGui, dropRect.left + 10, dropRect.top + 10);
            await dispatcher.finishDrag(dropZoneGui);
            await asyncSetTimeout(50);
        } finally {
            ownerDocument.elementsFromPoint = originalElementsFromPoint as typeof ownerDocument.elementsFromPoint;
            dragHandle.getBoundingClientRect = originalDragRect;
            dropZoneGui.getBoundingClientRect = originalDropZoneRect;
        }
    }

    /**
     * Simulates dragging a CTP column to the bottom of the primary list. The production
     * drag-and-drop path runs through `columnMoveUtils.moveItem` — we replicate just the
     * index-resolution logic locally (the moving column ends up at the last index of the
     * deferred primary order, accounting for whether it was already to the left or right
     * of the target) and call the same `columnStateUpdateStrategy.moveColumns` entry the
     * production path uses.
     */
    async function dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel: any, label: string): Promise<void> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const virtualList = listPanel['virtualList'];
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const lastIndex = displayedColsList.length - 1;
        const movingItem = displayedColsList.find((item: any) => item.displayName === label);

        expect(movingItem).toBeTruthy();

        virtualList.ensureIndexVisible(lastIndex);
        await asyncSetTimeout(50);

        const updateStrategy = toolPanel.beans.columnStateUpdateStrategy;
        const deferMode = true;
        const allColumns = updateStrategy.getPrimaryColumns(deferMode) as AgColumn[];
        const lastHoveredColumn = displayedColsList[lastIndex].column as AgColumn;
        const movingColumn = movingItem.column as AgColumn;

        // `position: 'bottom'` → insert AFTER the target; equivalent to `isBefore = false`.
        const adjustedTarget = allColumns.indexOf(lastHoveredColumn) + 1;
        // If the moving column currently sits before the insert point, the splice removes
        // one slot in front of it, so subtract its span (always 1 here, single column).
        const movingIndex = allColumns.indexOf(movingColumn);
        const targetIndex = movingIndex < adjustedTarget ? adjustedTarget - 1 : adjustedTarget;

        updateStrategy.moveColumns(deferMode, [movingColumn], targetIndex, 'toolPanelUi');
        toolPanel.refreshDeferredUi?.();
        await asyncSetTimeout(50);
    }

    test('adding aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding an unchecked column to row groups in deferred pivot mode stages both state and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await addPrimaryColumnBackToRowGroups(toolPanel, gridApi, 'athlete');

        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
                .sort()
        ).toEqual(['athlete', 'country', 'sport']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getCancelButton(toolPanelGui).click();
        await asyncSetTimeout(50);

        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('adding row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport', 'date']);
    });

    test('aggregation value changes and cancelling in non-pivot mode should keep values unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing agg function on an existing value pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing column visibility and cancelling in non-pivot mode should keep visibility unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(country.isVisible()).toBe(true);
    });

    test('changing column visibility in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(country.isVisible()).toBe(true);

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');

        expect(country.isVisible()).toBe(true);

        commitChanges(toolPanel);

        expect(country.isVisible()).toBe(false);
    });

    test('checking a pivot-only column in deferred pivot mode draws a staged label pill immediately', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enableRowGroup: true, rowGroup: true },
                { field: 'year', enablePivot: true, pivot: true },
                { field: 'date', enablePivot: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
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
        await new GridColumns(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── pivot_year_2000_gold "Gold" width:200 columnGroupShow:open
            ├─┬ "2004" GROUP
            │ └── pivot_year_2004_gold "Gold" width:200 columnGroupShow:open
            └─┬ "2008" GROUP
              └── pivot_year_2008_gold "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');

        createPrimaryColumnComp(toolPanel, 'Date')['onChangeCommon'](true);
        await asyncSetTimeout(50);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year', 'date']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).toContain('Date');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
    });

    test('checking a row-group column in deferred pivot mode draws a staged row-group pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        createPrimaryColumnComp(toolPanel, 'Athlete')['onChangeCommon'](true);
        await asyncSetTimeout(50);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
                .sort()
        ).toEqual(['athlete', 'country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('checking a value column in deferred pivot mode draws a staged value pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');

        createPrimaryColumnComp(toolPanel, 'Age')['onChangeCommon'](true);
        await asyncSetTimeout(50);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(
            getUpdateStrategy(toolPanel)
                .getValueColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['silver', 'bronze', 'age']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).toContain('Age');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');
    });

    test('column label changes and cancelling in pivot mode should keep labels unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setPivotColumns(true, [year, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [date, year], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('commit should call exactly one state-application path', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Observe the public batch signal: a single batched state application fires exactly one
        // `columnEverythingChanged`. A redundant grid-state round-trip would fire it twice; a piecemeal
        // path (per-column moveColumns / setColumns / setColumnAggFunc, which emit only granular events)
        // would fire it zero times. Both regressions are caught by asserting exactly one.
        let everythingChangedCount = 0;
        gridApi.addEventListener('columnEverythingChanged', () => {
            everythingChangedCount++;
        });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);

        await asyncSetTimeout(1);

        // Turning pivot off applies state in a single batch — exactly one `columnEverythingChanged`.
        expect(everythingChangedCount).toBe(1);
        expect(gridApi.isPivotMode()).toBe(false);
    });

    test('toggling pivot mode in deferred mode persists pivot state to grid state and restores pivot columns', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(gridApi.getState().pivot).toEqual({ pivotMode: true, pivotColIds: ['year'] });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getState().pivot?.pivotMode ?? false).toBe(false);

        getUpdateStrategy(toolPanel).setPivotMode(true, true, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(gridApi.getState().pivot).toEqual({ pivotMode: true, pivotColIds: ['year'] });
    });

    test('commit should make exactly one server call', async () => {
        const { gridApi, toolPanelGui, serverGetDataSpy } = await createDeferredPivotModeGrid();
        const initialCallCount = serverGetDataSpy.mock.calls.length;

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(serverGetDataSpy.mock.calls.length - initialCallCount).toBe(1);
    });

    test('dragging an unchecked column from the column list into row groups in deferred pivot mode stages the pill and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );

        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
                .sort()
        ).toEqual(['athlete', 'country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the deferred tool panel into external header drop zones should be prohibited', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;

        const rowGroupBefore = gridApi.getRowGroupColumns().map((col) => col.getColId());
        const pivotBefore = gridApi.getPivotColumns().map((col) => col.getColId());
        const deferredRowGroupBefore = getUpdateStrategy(toolPanel)
            .getRowGroupColumns(true)
            .map((col) => col.getColId());
        const deferredPivotBefore = getUpdateStrategy(toolPanel)
            .getPivotColumns(true)
            .map((col) => col.getColId());

        // Drag a CTP column to the live header row-group drop zone. In deferred mode this is
        // rejected by the drop-zone predicate (no `data-column-tool-panel-deferred` allowed).
        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        // Drag the same column to the live header pivot drop zone — also rejected.
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Neither live state nor deferred state should have changed.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(rowGroupBefore);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(pivotBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredRowGroupBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredPivotBefore);
    });

    test('dragging a CTP column to the header pivot panel in deferred mode should not apply changes', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        // Athlete is not a pivot column initially
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Get the header (horizontal) pivot drop zone GUI from the grid DOM
        const gridEl = getGridElement(gridApi)!;
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();

        // Simulate full drag from CTP column list to header pivot panel
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Grid pivot columns should remain unchanged (no immediate apply)
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Deferred state should also remain unchanged (drag should be fully rejected)
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);
    });

    test('onGridExit and onGridEnter drag callbacks should be no-ops in deferred mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Country is an active row group
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        // Create a Country column comp (which registers drag source with onGridExit/onGridEnter)
        const countryComp = createPrimaryColumnComp(toolPanel, 'Country');
        const onChangeCommonSpy = vi.spyOn(countryComp, 'onChangeCommon');

        // Find the drag source via dragSourceAndParamsList
        const dragAndDrop = countryComp.beans.dragAndDrop;
        const entry = dragAndDrop['dragSourceAndParamsList'].find(
            (e: any) => e.dragSource.eElement === countryComp.eDragHandle
        );
        expect(entry).toBeTruthy();
        const dragSource = entry.dragSource;

        // Trigger onGridExit — should not call onChangeCommon in deferred mode
        dragSource.onGridExit(null);

        expect(onChangeCommonSpy).not.toHaveBeenCalled();

        // Deferred state should remain unchanged
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);

        // Grid state should remain unchanged
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the non-deferred tool panel into external header drop zones should remain allowed', async () => {
        const { gridApi, toolPanel } = await createNonDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;
        const toolPanelGui = toolPanel.getGui() as HTMLElement;

        // Athlete is not yet a row group — drag it to the live header row-group drop zone.
        // In non-deferred mode the drop is allowed → it becomes a row-group column immediately.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).not.toContain('athlete');

        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toContain('athlete');
    });

    test('dragging into column groups is allowed after clearing groups, labels and aggregations then committing non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setValueColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns()).toEqual([]);
        expect(gridApi.getPivotColumns()).toEqual([]);
        expect(gridApi.getValueColumns()).toEqual([]);
        expect(toolPanel.rowGroupDropZonePanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(true);
    });

    test('removing a pivot label pill in deferred pivot mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
            { field: 'country', enableRowGroup: true, enablePivot: true },
            { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
            { field: 'age', enableValue: true, aggFunc: 'sum' },
        ]);
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await asyncSetTimeout(50);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(createPrimaryColumnComp(toolPanel, 'Year').isSelected()).toBe(true);

        removeDropZonePill(toolPanelGui, 'Year');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Year').isSelected()).toBe(false);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
    });

    test('removing a row group pill in deferred mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        removeDropZonePill(toolPanelGui, 'Country');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport']);
    });

    test('removing a value pill in deferred mode is discarded by Cancel', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', rowGroup: true, enableRowGroup: true },
            { field: 'country', rowGroup: true, enableRowGroup: true },
            { field: 'gold', enableValue: true, aggFunc: 'sum' },
            { field: 'silver', enableValue: true, aggFunc: 'sum' },
            { field: 'bronze', enableValue: true },
        ]);

        removeDropZonePill(toolPanelGui, 'sum of Silver');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);

        getCancelButton(toolPanelGui).click();

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);
    });

    test('removing a value pill in pivot mode can be cancelled', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        removeDropZonePill(toolPanelGui, 'sum of Bronze');
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
    });

    test('removing a value pill in pivot mode stages the change until Apply', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
        expect(createPrimaryColumnComp(toolPanel, 'Bronze').isSelected()).toBe(true);

        removeDropZonePill(toolPanelGui, 'sum of Bronze');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Bronze').isSelected()).toBe(false);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
    });

    test('removing aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
    });

    test('removing the first row-group pill in deferred pivot mode clears the staged Country checkbox immediately', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const countryColumnComp = createPrimaryColumnComp(toolPanel, 'Country');
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(countryColumnComp.isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');

        removeDropZonePill(toolPanelGui, 'Country');
        await asyncSetTimeout(50);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['sport']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Country').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');
    });

    test('reordering aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('reordering aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('reordering column groups and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('reordering column groups and cancelling in pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('reordering column groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('reordering column groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('reordering column labels in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setPivotColumns(true, [year, date], 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [date, year], 'toolPanelUi');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'date']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['date', 'year']);
    });

    test('reordering columns and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns and cancelling in pivot mode should keep the original order', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.beans.colModel.getNonPivotCol('athlete') as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('dragging a column to the end in non-pivot mode should update the deferred tool panel order before commit', async () => {
        const { toolPanel } = await createDeferredNonPivotGrid();

        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual([
            'athlete',
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
        ]);

        await dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel, 'Athlete');

        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual([
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
            'athlete',
        ]);
        expect(getPrimaryColumnOrder(toolPanel)).toEqual([
            'athlete',
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
        ]);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual([
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
            'athlete',
        ]);
    });

    test('reordering columns in pivot mode applies primary column order only after commit', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.beans.colModel.getNonPivotCol('athlete') as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('reordering row groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('reordering row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('row group changes and cancelling in non-pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('row group changes and cancelling in pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('select all after staging pivot mode off applies visibility changes, not pivot-mode selection changes', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getPivotModeToggle(toolPanelGui).click();
        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all and deselect all apply only after clicking Apply in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();

        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);

        getSelectAllCheckbox(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();

        expect(allColumns.some((colId) => !gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all can be cancelled in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        getSelectAllCheckbox(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('silver')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('bronze')!.isVisible()).toBe(false);
    });

    test('sorting a header row-group pill still works without the columns tool panel module', async () => {
        const gridApi = await createRowGroupingOnlyGrid();
        const gridEl = getGridElement(gridApi)!;
        // `rowGroupPanelShow: 'always'` renders the header row-group drop zone live.
        const rowGroupPill = gridEl.querySelector(
            '.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell'
        ) as HTMLElement | null;

        expect(rowGroupPill).toBeTruthy();

        rowGroupPill!.click();

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('sorting a row-group pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());

        expect(country.getSort()).toBeNull();

        commitChanges(toolPanel);

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());

        expect(country.getSort()).toBeNull();

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('starting a drag for a just-removed row-group column should snapshot the unchecked deferred state', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        removeDropZonePill(toolPanelGui, 'Sport');
        await asyncSetTimeout(50);

        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country']);
        expect(createPrimaryColumnComp(toolPanel, 'Sport').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Sport');

        const sportColumnComp = createPrimaryColumnComp(toolPanel, 'Sport');
        const dragItem = sportColumnComp['createDragItem']();

        expect(dragItem.pivotState.sport?.rowGroup).toBe(false);
    });

    test('getState().pivot through a deferred pivot-mode toggle off then back on', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        expect(gridApi.getState().pivot).toEqual({ pivotMode: true, pivotColIds: ['year'] });

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.isPivotMode()).toBe(false);
        // Pivot off ⇒ no pivot state persisted; the pivot cols are remembered internally for re-enable.
        expect(gridApi.getState().pivot).toBeUndefined();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getState().pivot).toEqual({ pivotMode: true, pivotColIds: ['year'] });
        expect(gridApi.getPivotColumns().map((c) => c.getColId())).toEqual(['year']);
    });

    test('toggling pivot mode off preserves existing row-group, value, sort and visibility state', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        gridApi.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        // The removed setState round-trip used to re-apply all of this from the cache; confirm it survives
        // the pivot toggle on its own.
        expect(gridApi.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
        expect(gridApi.getValueColumns().map((c) => c.getColId())).toEqual(['silver', 'bronze']);
        expect(gridApi.getColumn('athlete')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
        expect(gridApi.getValueColumns().map((c) => c.getColId())).toEqual(['silver', 'bronze']);
        expect(gridApi.getColumn('athlete')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);
    });

    test('turning pivot mode back on after disabling and applying restores the previous pivot columns', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getPivotColumns()).toEqual([]);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('column labels section shows previous pivot columns after toggling pivot mode off, applying, then back on', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        // Initially Year is a pivot column
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);

        // Toggle pivot off and apply
        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);

        // Toggle pivot back on (before Apply)
        getPivotModeToggle(toolPanelGui).click();

        // Deferred state should show Year in pivot columns
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);
    });

    test('turning pivot mode off and applying should remove year header group text and update the grid option', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(gridApi.getGridOption('pivotMode')).toBe(true);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getGridOption('pivotMode')).toBe(false);

        const gridEl = getGridElement(gridApi)!;
        const hasYearHeaderGroupText = Array.from(gridEl.querySelectorAll('.ag-header-group-text')).some(
            (el) => el.textContent?.trim() === '2000'
        );
        expect(hasYearHeaderGroupText).toBe(false);
    });

    test('tool panel shows primary columns after disabling pivot mode with user-supplied pivot result columns', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            sideBar: {
                toolPanels: ['columns'],
                defaultToolPanel: 'columns',
            },
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: rowData.slice(0, 1), rowCount: 1 });
                },
            },
        });
        await new GridColumns(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── silver "Silver" width:200 aggFunc:sum !visible
            └── bronze "Bronze" width:200 aggFunc:sum !visible
        `);
        await new GridRows(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p setup`
        ).check(`
            ROOT id:<no-id>
            └── GROUP collapsed id:0 ag-Grid-AutoColumn:"United States" athlete:"Michael Phelps" age:23 country:"United States" year:2008 date:"24/08/2008" sport:"Swimming" gold:8 silver:0 bronze:0 total:8
        `);

        await waitForNoLoadingRows(gridApi);
        gridApi.setPivotResultColumns([
            {
                headerName: '2000',
                children: [{ colId: '2000_gold', field: '2000_gold', headerName: 'Gold' }],
            },
        ]);
        expect(gridApi.getPivotResultColumns()?.map((col) => col.getColId())).toEqual(['2000_gold']);

        gridApi.setGridOption('pivotMode', false);
        await new GridColumns(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p after setGridOption pivotMode`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── athlete "Athlete" width:200
            ├── age "Age" width:200
            ├── country "Country" width:200 rowGroup rowGroupIndex:1
            ├── year "Year" width:200 pivot pivotIndex:1
            ├── date "Date" width:200
            ├── sport "Sport" width:200 rowGroup rowGroupIndex:2
            └── total "Total" width:200
        `);
        await new GridRows(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p after setGridOption pivotMode`
        ).check(`
            ROOT id:<no-id>
            └── filler collapsed id:rowIndex:0
        `);
        await waitForNoLoadingRows(gridApi);

        gridApi.closeToolPanel();
        gridApi.openToolPanel('columns');
        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual([
            'athlete',
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
        ]);
    });

    test('turning pivot mode off and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('turning pivot mode off then on and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getPivotModeToggle(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });

    test('turning pivot mode off, applying, then cancelling should keep the primary list populated', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        getCancelButton(toolPanelGui).click();

        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });

    test('apply button is disabled when there are no pending changes', async () => {
        const { toolPanelGui } = await createDeferredNonPivotGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when pivot mode is toggled off', async () => {
        const { toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        getPivotModeToggle(toolPanelGui).click();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button becomes enabled when a column is toggled and disabled again when toggled back to original state', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], true, 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after reverting a staged column visibility change via checkbox', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredNonPivotGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Toggle Athlete checkbox off (hide column)
        const athleteComp = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp['onChangeCommon'](false);

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Toggle Athlete checkbox back on (show column — revert to original state)
        const athleteComp2 = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp2['onChangeCommon'](true);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after reverting a staged pivot column change via checkbox', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Toggle Athlete checkbox on (add to row group in pivot mode)
        const athleteComp = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp['onChangeCommon'](true);

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Toggle Athlete checkbox back off (revert)
        const athleteComp2 = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp2['onChangeCommon'](false);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when a row group pill sort direction is changed', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Click the Country pill in the row group drop zone to change sort direction
        const countryPill = Array.from(
            (toolPanel.rowGroupDropZonePanel.getGui() as HTMLElement).querySelectorAll<HTMLElement>(
                '.ag-column-drop-cell'
            )
        ).find((el) => el.textContent?.includes('Country'));
        expect(countryPill).toBeTruthy();
        countryPill!.click();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button is disabled after reverting a staged row group change', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'country', enableRowGroup: true, rowGroup: true },
            { field: 'athlete' },
            { field: 'gold' },
        ]);
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove country from row groups
        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [], 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Add country back to row groups (revert to original state)
        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button stays enabled after removing then re-adding a row group column at a different position', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove country from row groups via the drop zone
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const existingRowGroupCols = rowGroupPanel.getExistingItems();
        const withoutCountry = existingRowGroupCols.filter((c: AgColumn) => c !== country);
        rowGroupPanel['updateItems'](withoutCountry);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Add country back at the end (different position from original)
        const currentRowGroupCols = rowGroupPanel.getExistingItems();
        rowGroupPanel['updateItems']([...currentRowGroupCols, country]);
        toolPanel.refreshDeferredUi();

        // Apply should stay enabled because order changed
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button is disabled after removing then re-adding a row group column at same position via drop zone', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const sport = gridApi.getColumn('sport')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Step 1: Remove sport from row groups via the drop zone (simulates removing pill)
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const originalRowGroupCols = [...rowGroupPanel.getExistingItems()];
        const withoutSport = originalRowGroupCols.filter((c: AgColumn) => c !== sport);
        rowGroupPanel['updateItems'](withoutSport);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Step 2: Drag sport back to row groups at same position (exact revert)
        rowGroupPanel['updateItems'](originalRowGroupCols);
        toolPanel.refreshDeferredUi();

        // Apply should be disabled since we reverted to original state
        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after removing row group pill via X and dragging column back from list in pivot mode', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Step 1: Click X on Sport pill in CTP row group drop zone
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const withoutSport = rowGroupPanel.getExistingItems().filter((c: AgColumn) => c !== sport);
        rowGroupPanel['updateItems'](withoutSport);
        rowGroupPanel.refreshGui();
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Step 2: Drag Sport from columns list into row groups drop zone
        // handleDragEnterEnd sets column visibility to false (hide column on group)
        rowGroupPanel.setColumnsVisible([sport], false, 'uiColumnDragged');
        // addItem adds Sport back to row groups
        rowGroupPanel.addItem(sport);
        toolPanel.refreshDeferredUi();

        // Deferred state should match live state — no pending changes
        expect(strategy.hasPendingChanges(true)).toBe(false);
        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when row group columns are rearranged', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Rearrange row group columns: swap country and sport
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const originalRowGroupCols = [...rowGroupPanel.getExistingItems()];
        const reversed = [...originalRowGroupCols].reverse();
        rowGroupPanel['updateItems'](reversed);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button becomes enabled when a value column aggregation function is changed', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const silver = gridApi.getColumn('silver')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, silver, 'avg', 'toolPanelDragAndDrop');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('re-adding a value column in pivot mode without an active pivot regenerates its column after Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enableRowGroup: true, enablePivot: true },
                { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
                { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
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
        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        strategy.setValueColumns(true, [silver], 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId() === 'bronze')).toBe(false);

        strategy.setValueColumns(true, [silver, bronze], 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId() === 'bronze')).toBe(true);
    });

    test('deferred setColumnAggFunc activating a value column in pivot mode regenerates pivot result columns after Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', enableValue: true },
            ],
            rowData: [
                { country: 'UK', year: 2000, gold: 5 },
                { country: 'UK', year: 2004, gold: 3 },
            ],
            pivotMode: true,
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
        await asyncSetTimeout(50);

        const toolPanel = gridApi.getToolPanelInstance('columns') as any;
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        // gold has no aggFunc → not a value column → its pivot result columns carry no measure.
        expect(getValueColumnIds(gridApi)).toEqual([]);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId().endsWith('_gold'))).toBe(false);

        strategy.setColumnAggFunc(true, gold, 'sum', 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId().endsWith('_gold'))).toBe(true);
    });

    // AG-9664: pivotSort from a deferred panel pill stages until Apply, mirroring the synchronous coverage in
    // sorting/pivot-column-sort.test.ts.
    async function createDeferredPivotSortGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            // Insertion order is deliberately not ascending, so natural (null) order differs from ascending.
            rowData: [
                { country: 'USA', year: 2022, sales: 1 },
                { country: 'USA', year: 2020, sales: 1 },
                { country: 'USA', year: 2021, sales: 1 },
            ],
            pivotMode: true,
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
        await asyncSetTimeout(50);
        return { gridApi, toolPanel: gridApi.getToolPanelInstance('columns') as any };
    }

    function getPivotColumnOrder(gridApi: GridApi): string[] {
        return gridApi
            .getAllDisplayedColumns()
            .map((col) => col.getColId())
            .filter((id) => id.startsWith('pivot_'));
    }

    test('pivot sort in deferred pivot mode stages until commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotSortGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
        const descending = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];

        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);

        // Unset default cycles to descending; the change is staged, the grid is untouched.
        strategy.progressPivotSortFromEvent(true, year);
        await asyncSetTimeout(50);
        expect(strategy.getPivotSort(true, year)).toBe('desc');
        expect(year.pivotSort).toBeUndefined();
        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);

        commitChanges(toolPanel);
        await asyncSetTimeout(50);

        expect(getPivotColumnOrder(gridApi)).toEqual(descending);
        expect(gridApi.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
    });

    test('pivot sort staged in deferred pivot mode is discarded on cancel', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotSortGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];

        strategy.progressPivotSortFromEvent(true, year);
        await asyncSetTimeout(50);
        expect(strategy.getPivotSort(true, year)).toBe('desc');

        cancelDeferredChanges(toolPanel);
        await asyncSetTimeout(50);

        expect(strategy.getPivotSort(true, year)).toBeUndefined();
        expect(year.pivotSort).toBeUndefined();
        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);
    });

    test('apply button becomes enabled when a value column is re-added via checkbox in pivot mode after committing its removal', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const strategy = getUpdateStrategy(toolPanel);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove Bronze from Values via its checkbox, then commit the removal
        createPrimaryColumnComp(toolPanel, 'Bronze')['onChangeCommon'](false);
        commitChanges(toolPanel);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Re-add Bronze via its checkbox — its colDef aggFunc ('sum') still matches the live column
        createPrimaryColumnComp(toolPanel, 'Bronze')['onChangeCommon'](true);
        toolPanel.refreshDeferredUi();

        expect(strategy.hasPendingChanges(true)).toBe(true);
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });
});
