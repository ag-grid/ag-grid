import { fireEvent, getByTestId } from '@testing-library/dom';

import type { AgColumn, ColDef, ColGroupDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import { DragSourceType, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { moveItem } from '../../../../packages/ag-grid-enterprise/src/columnToolPanel/columnMoveUtils';
import { AgGridHeaderDropZonesSelector } from '../../../../packages/ag-grid-enterprise/src/rowGrouping/columnDropZones/agGridHeaderDropZones';
import { DragEventDispatcher, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';
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
        return toolPanel.beans.colModel.getColDefCols().map((col: any) => col.getColId());
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

    function getToolPanelDragHandle(toolPanel: any): Element {
        const dragHandle = toolPanel.getGui().querySelector('.ag-drag-handle');
        expect(dragHandle).toBeTruthy();
        return dragHandle!;
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

    async function dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel: any, label: string): Promise<void> {
        const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
        const virtualList = listPanel['virtualList'];
        const displayedColsList = listPanel.getDisplayedColsList() as any[];
        const lastIndex = displayedColsList.length - 1;
        const movingItem = displayedColsList.find((item: any) => item.displayName === label);

        expect(movingItem).toBeTruthy();

        virtualList.ensureIndexVisible(lastIndex);
        await asyncSetTimeout(50);

        let component = virtualList.getComponentAt(lastIndex) as any;
        if (!component) {
            component = listPanel['createComponentFromItem'](
                displayedColsList[lastIndex],
                document.createElement('div')
            );
        }

        moveItem(
            toolPanel.beans,
            [movingItem.column as AgColumn],
            {
                rowIndex: lastIndex,
                position: 'bottom',
                component,
            },
            { buttons: ['apply', 'cancel'] as const }
        );
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
        const { toolPanel } = await createDeferredPivotModeGrid();
        const { gos, stateSvc, colModel, colMoves, rowGroupColsSvc, valueColsSvc, pivotColsSvc } = toolPanel.beans;

        const updateGridOptionsSpy = vi.spyOn(gos, 'updateGridOptions');
        const setStateSpy = stateSvc ? vi.spyOn(stateSvc, 'setState') : undefined;
        const setPivotModeSpy = vi.spyOn(colModel as any, 'setPivotMode');
        const moveColumnsSpy = colMoves ? vi.spyOn(colMoves, 'moveColumns') : undefined;
        const setRowGroupColumnsSpy = rowGroupColsSvc ? vi.spyOn(rowGroupColsSvc, 'setColumns') : undefined;
        const setValueColumnsSpy = valueColsSvc ? vi.spyOn(valueColsSvc, 'setColumns') : undefined;
        const setColumnAggFuncSpy = valueColsSvc ? vi.spyOn(valueColsSvc, 'setColumnAggFunc') : undefined;
        const setPivotColumnsSpy = pivotColsSvc ? vi.spyOn(pivotColsSvc, 'setColumns') : undefined;

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);

        expect(setStateSpy?.mock.calls.length ?? 0).toBe(1);
        expect(updateGridOptionsSpy).toHaveBeenCalledTimes(1);
        expect(setPivotModeSpy).toHaveBeenCalledTimes(1);
        expect(moveColumnsSpy).not.toHaveBeenCalled();
        expect(setRowGroupColumnsSpy).not.toHaveBeenCalled();
        expect(setValueColumnsSpy).not.toHaveBeenCalled();
        expect(setColumnAggFuncSpy).not.toHaveBeenCalled();
        expect(setPivotColumnsSpy).not.toHaveBeenCalled();
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

    test('dragging from the deferred tool panel into external non-tool-panel drop zones should be prohibited', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const dragHandle = getToolPanelDragHandle(toolPanel);

        expect(headerDropZones.rowGroupComp.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(false);
        expect(headerDropZones.pivotComp.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(false);
    });

    test('dragging a pill from a deferred CTP drop zone into header drop zones should be prohibited even when detached', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;

        // Get a pill drag handle from the CTP's row group drop zone
        const pillDragHandle = toolPanel.rowGroupDropZonePanel
            .getGui()
            .querySelector('.ag-column-drop-cell-drag-handle') as Element;
        expect(pillDragHandle).toBeTruthy();

        // While attached: should be blocked
        expect(headerDropZones.rowGroupComp.isInterestedIn(DragSourceType.ToolPanel, pillDragHandle)).toBe(false);

        // Simulate what happens during drag: the pill gets detached from the DOM
        // (source panel's onDragLeave -> removeItems -> refreshGui -> destroyGui)
        const parent = pillDragHandle.parentElement!;
        parent.removeChild(pillDragHandle);
        expect(pillDragHandle.isConnected).toBe(false);

        // Even when detached, should still be blocked (pill has data-column-tool-panel-deferred attribute)
        expect(headerDropZones.rowGroupComp.isInterestedIn(DragSourceType.ToolPanel, pillDragHandle)).toBe(false);
        expect(headerDropZones.pivotComp.isInterestedIn(DragSourceType.ToolPanel, pillDragHandle)).toBe(false);
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
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const dragHandle = getToolPanelDragHandle(toolPanel);

        expect(headerDropZones.rowGroupComp.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(true);
        expect(headerDropZones.pivotComp.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(true);
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

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 2, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns and cancelling in pivot mode should keep the original order', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.beans.colModel.getColDefCol('athlete') as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 2, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 2, 'toolPanelUi');

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
        const athlete = toolPanel.beans.colModel.getColDefCol('athlete') as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 2, 'toolPanelUi');

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
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const rowGroupPill = headerDropZones.rowGroupComp
            .getGui()
            .querySelector('.ag-column-drop-cell') as HTMLElement | null;

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

    test('apply button becomes enabled when a row group pill sort direction is changed', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Click the Country pill in the row group drop zone to change sort direction
        const countryPill = Array.from(
            toolPanel.rowGroupDropZonePanel.getGui().querySelectorAll<HTMLElement>('.ag-column-drop-cell')
        ).find((el) => el.textContent?.includes('Country'));
        expect(countryPill).toBeTruthy();
        countryPill!.click();

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
});
