// Shared setup for the deferred column-tool-panel pivot-mode suites. They are siblings because vitest
// parallelises across files but not within one, and 82 tests that each build a grid serialised in a single
// worker. The module list is the features under test rather than AllEnterpriseModule: every grid pays for
// each module it registers.
import { fireEvent, getByTestId, waitFor } from '@testing-library/dom';
import {
    DragEventDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    nextAnimationFrame,
    waitForNoLoadingRows,
} from 'ag-test-utils';

import type { AgColumn, ColDef, ColGroupDef, GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ServerSideRowModelModule,
    SideBarModule,
} from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from './deferredPivotModeFakeServer';

export const gridMgr = new TestGridsManager({
    modules: [
        ClientSideRowModelModule,
        GridStateModule,
        ServerSideRowModelModule,
        ColumnsToolPanelModule,
        SideBarModule,
        ColumnMenuModule,
        RowGroupingModule,
        RowGroupingPanelModule,
        PivotModule,
    ],
});
const rowGroupingOnlyGridMgr = new TestGridsManager({
    modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule],
});

export const rowData = [
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

export const baseColumnDefs: ColDef[] = [
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

export async function createDeferredPivotModeGrid(): Promise<{
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

    // The panel is ready once it has drawn the initial pills for the configured row groups and
    // values, and populated the primary column list.
    const toolPanel = await waitFor(() => {
        const panel = gridApi.getToolPanelInstance('columns') as any;
        const rowGroupText = getDropZoneText(panel.rowGroupDropZonePanel);
        expect(rowGroupText).toContain('Country');
        expect(rowGroupText).toContain('Sport');
        expect(getDropZoneText(panel.valuesDropZonePanel)).toContain('Silver');
        expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
        return panel;
    });

    return {
        gridApi,
        toolPanel,
        toolPanelGui: toolPanel.getGui(),
        serverGetDataSpy,
    };
}

export async function createDeferredNonPivotGrid(columnDefs: ColDef[] = baseColumnDefs): Promise<{
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

    // The panel is ready once the primary column list is populated and the row group drop zone
    // has drawn a pill for every row-group column the supplied colDefs declare.
    // The header controls carry their test IDs only once the header has rendered, which is after the
    // column list populates — so gate on those too, or a caller's getByTestId can miss them.
    const toolPanel = await waitFor(() => {
        const panel = gridApi.getToolPanelInstance('columns') as any;
        expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
        expect(
            (panel.rowGroupDropZonePanel.getGui() as HTMLElement).querySelectorAll('.ag-column-drop-cell').length
        ).toBe(gridApi.getRowGroupColumns().length);
        const gui = panel.getGui() as HTMLElement;
        getByTestId(gui, agTestIdFor.pivotModeSelect());
        getByTestId(gui, agTestIdFor.columnPanelSelectHeaderCheckbox());
        return panel;
    });

    return {
        gridApi,
        toolPanel,
        toolPanelGui: toolPanel.getGui(),
    };
}

export async function createNonDeferredPivotModeGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
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

    const toolPanel = await waitFor(() => {
        const panel = gridApi.getToolPanelInstance('columns') as any;
        expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
        return panel;
    });

    return { gridApi, toolPanel };
}

export async function createRowGroupingOnlyGrid(): Promise<GridApi> {
    const gridApi = await rowGroupingOnlyGridMgr.createGridAndWait('rowGroupingOnlyGrid', {
        columnDefs: [
            { field: 'athlete' },
            { field: 'country', rowGroup: true, enableRowGroup: true },
            { field: 'gold' },
        ],
        rowData,
        rowGroupPanelShow: 'always',
    });

    // `rowGroupPanelShow: 'always'` renders the header row-group drop zone — wait for its pill.
    await waitFor(() =>
        expect(
            getGridElement(gridApi)!.querySelector('.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell')
        ).toBeTruthy()
    );
    return gridApi;
}

export async function createDeferredNonPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
    return createDeferredNonPivotGrid([
        { field: 'athlete', rowGroup: true, enableRowGroup: true },
        { field: 'country', rowGroup: true, enableRowGroup: true },
        { field: 'gold', enableValue: true, aggFunc: 'sum' },
        { field: 'silver', enableValue: true, aggFunc: 'sum' },
        { field: 'bronze', enableValue: true },
    ]);
}

export async function createDeferredGroupedNonPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
    return createDeferredNonPivotGrid([
        {
            headerName: 'Group A',
            children: [{ field: 'athlete' }, { field: 'age' }],
        },
        {
            headerName: 'Group B',
            children: [{ field: 'country' }, { field: 'year' }],
        },
    ] as ColGroupDef[]);
}

export async function createDeferredGroupedPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
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
    // Consumers only read the synchronous `colModel` column order; yield a single tick so the
    // pivot-mode switch has flushed its events.
    await asyncSetTimeout(0);

    return { gridApi, toolPanel };
}

export async function createDeferredPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
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

    const toolPanel = await waitFor(() => {
        const panel = gridApi.getToolPanelInstance('columns') as any;
        expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
        return panel;
    });

    return { gridApi, toolPanel };
}

function panelButton(toolPanelGui: HTMLElement, label: string): HTMLButtonElement {
    return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
        (button) => button.textContent?.trim() === label
    )!;
}

export const getApplyButton = (toolPanelGui: HTMLElement): HTMLButtonElement => panelButton(toolPanelGui, 'Apply');

export const getCancelButton = (toolPanelGui: HTMLElement): HTMLButtonElement => panelButton(toolPanelGui, 'Cancel');

export function getPivotModeToggle(toolPanelGui: HTMLElement): HTMLInputElement {
    return getByTestId(toolPanelGui, agTestIdFor.pivotModeSelect()) as HTMLInputElement;
}

export function getSelectAllCheckbox(toolPanelGui: HTMLElement): HTMLInputElement {
    return getByTestId(toolPanelGui, agTestIdFor.columnPanelSelectHeaderCheckbox()) as HTMLInputElement;
}

export function createPrimaryColumnComp(toolPanel: any, label: string): any {
    const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
    const displayedColsList = listPanel.getDisplayedColsList() as any[];
    const rowIndex = displayedColsList.findIndex((item) => item.displayName === label);
    expect(rowIndex).toBeGreaterThanOrEqual(0);

    return listPanel['createComponentFromItem'](displayedColsList[rowIndex], document.createElement('div'));
}

export function getUpdateStrategy(toolPanel: any): IColumnStateUpdateStrategy {
    return toolPanel.beans.columnStateUpdateStrategy;
}

function isDeferred(toolPanel: any): boolean {
    return !!toolPanel['isDeferModeEnabled'];
}

export function commitChanges(toolPanel: any): void {
    getUpdateStrategy(toolPanel).commit(isDeferred(toolPanel));
}

export function cancelDeferredChanges(toolPanel: any): void {
    toolPanel['onDeferredCancel']();
}

export function getPrimaryColumnOrder(toolPanel: any): string[] {
    return toolPanel.beans.colModel.colDefList.map((col: any) => col.getColId());
}

export function getDisplayedPrimaryColumnOrder(toolPanel: any): string[] {
    return toolPanel.primaryColsPanel.primaryColsListPanel
        .getDisplayedColsList()
        .filter((item: any) => !item.group)
        .map((item: any) => item.column.getColId());
}

export function getValueColumnIds(gridApi: GridApi): string[] {
    return gridApi.getValueColumns().map((col) => col.getColId());
}

export function getDropZoneText(panel: any): string {
    return panel.getGui().textContent ?? '';
}

export function createSortEvent(): MouseEvent {
    return new MouseEvent('click', { bubbles: true });
}

export function removeDropZonePill(toolPanelGui: HTMLElement, label: string): void {
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
    // Scrolling the virtual list redraws its rows on the next animation frame.
    await nextAnimationFrame();

    let columnElement = (listPanel['virtualList'].getComponentAt(rowIndex) as any)?.getGui() as HTMLElement | undefined;

    if (!columnElement) {
        columnElement = createPrimaryColumnComp(toolPanel, label).getGui() as HTMLElement;
        toolPanelGui.appendChild(columnElement);
    }

    expect(columnElement).toBeTruthy();

    const dragHandle = columnElement!.querySelector<HTMLElement>('.ag-drag-handle');
    expect(dragHandle).toBeTruthy();

    return dragHandle!;
}

export async function addPrimaryColumnBackToRowGroups(toolPanel: any, gridApi: GridApi, colId: string): Promise<void> {
    toolPanel.rowGroupDropZonePanel.addItem(gridApi.getColumn(colId)!);
    await waitFor(() =>
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toContain(colId)
    );
}

export async function dragRenderedPrimaryColumnToRowGroups(
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
        // The drop is handled synchronously by the drag-and-drop service; callers poll for any
        // resulting state change themselves.
        await dispatcher.finishDrag(dropZoneGui);
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
export async function dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel: any, label: string): Promise<void> {
    const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
    const virtualList = listPanel['virtualList'];
    const displayedColsList = listPanel.getDisplayedColsList() as any[];
    const lastIndex = displayedColsList.length - 1;
    const movingItem = displayedColsList.find((item: any) => item.displayName === label);

    expect(movingItem).toBeTruthy();

    virtualList.ensureIndexVisible(lastIndex);
    // Scrolling the virtual list redraws its rows on the next animation frame.
    await nextAnimationFrame();

    const updateStrategy = getUpdateStrategy(toolPanel);
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
}

/** Registers the hooks every sibling suite needs, so none of them can forget to reset the grids. */
export function setupDeferredPivotModeSuite(): void {
    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        rowGroupingOnlyGridMgr.reset();
        vi.resetAllMocks();
    });
}
