import type { ApplyColumnStateParams, ColumnState } from '../columns/columnApplyStateService';
import type { ISizeColumnsToFitParams } from '../columns/columnSizeService';
import { unwrapUserComp } from '../components/framework/userComponentFactory';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { CellPosition } from '../entities/cellPositionUtils';
import type { ColDef, ColGroupDef, ColumnChooserParams, HeaderLocation, IAggFunc } from '../entities/colDef';
import type { ChartRef, GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type {
    AgEvent,
    AgEventListener,
    AgGlobalEventListener,
    ColumnEventType,
    FilterChangedEventSourceType,
    SelectionEventSourceType,
} from '../events';
import type { RowDropZoneEvents, RowDropZoneParams } from '../gridBodyComp/rowDragFeature';
import type {
    ChartDownloadParams,
    ChartModel,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    OpenChartToolPanelParams,
    UpdateChartParams,
} from '../interfaces/IChartService';
import type { CellRange, CellRangeParams } from '../interfaces/IRangeService';
import type { ServerSideGroupLevelState } from '../interfaces/IServerSideStore';
import type { AdvancedFilterModel } from '../interfaces/advancedFilterModel';
import type { CsvExportParams } from '../interfaces/exportParams';
import type { GridState } from '../interfaces/gridState';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { ClientSideRowModelStep } from '../interfaces/iClientSideRowModel';
import type { IClipboardCopyParams, IClipboardCopyRowsParams } from '../interfaces/iClipboardService';
import type { Column, ColumnGroup, ColumnPinnedType, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { ExcelExportMultipleSheetParams, ExcelExportParams } from '../interfaces/iExcelCreator';
import { ExcelFactoryMode } from '../interfaces/iExcelCreator';
import type { FilterModel, IFilter } from '../interfaces/iFilter';
import type { IRowModel, RowModelType } from '../interfaces/iRowModel';
import type { IRowNode, RowPinnedType } from '../interfaces/iRowNode';
import type { RefreshServerSideParams } from '../interfaces/iServerSideRowModel';
import type { IServerSideGroupSelectionState, IServerSideSelectionState } from '../interfaces/iServerSideSelection';
import type { SideBarDef } from '../interfaces/iSideBar';
import type { IStatusPanel } from '../interfaces/iStatusPanel';
import type { IToolPanel } from '../interfaces/iToolPanel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import type { ServerSideTransaction, ServerSideTransactionResult } from '../interfaces/serverSideTransaction';
import type { IContextMenuParams } from '../misc/menuService';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { ManagedGridOptionKey, ManagedGridOptions } from '../propertyKeys';
import type { ICellRenderer } from '../rendering/cellRenderers/iCellRenderer';
import type {
    FlashCellsParams,
    GetCellEditorInstancesParams,
    GetCellRendererInstancesParams,
    RedrawRowsParams,
    RefreshCellsParams,
} from '../rendering/rowRenderer';
import type { LoadSuccessParams } from '../rowNodeCache/iRowNodeBlock';
import { _warnOnce } from '../utils/function';
import { _exists, _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';
import type { DetailGridInfo, GetCellValueParams, GridApi, StartEditingCellParams } from './gridApi';

export function getGridId(beans: BeanCollection): string {
    return beans.context.getGridId();
}

export function addDetailGridInfo(beans: BeanCollection, id: string, gridInfo: DetailGridInfo): void {
    beans.detailGridApiService?.addDetailGridInfo(id, gridInfo);
}

export function removeDetailGridInfo(beans: BeanCollection, id: string): void {
    beans.detailGridApiService?.removeDetailGridInfo(id);
}

export function getDetailGridInfo(beans: BeanCollection, id: string): DetailGridInfo | undefined {
    return beans.detailGridApiService?.getDetailGridInfo(id);
}

export function forEachDetailGridInfo(
    beans: BeanCollection,
    callback: (gridInfo: DetailGridInfo, index: number) => void
) {
    beans.detailGridApiService?.forEachDetailGridInfo(callback);
}

export function getDataAsCsv(beans: BeanCollection, params?: CsvExportParams): string | undefined {
    if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv', beans.context.getGridId())) {
        return beans.csvCreator!.getDataAsCsv(params);
    }
}

export function exportDataAsCsv(beans: BeanCollection, params?: CsvExportParams): void {
    if (
        ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCsv', beans.context.getGridId())
    ) {
        beans.csvCreator!.exportDataAsCsv(params);
    }
}

function assertNotExcelMultiSheet(beans: BeanCollection, method: keyof GridApi): boolean {
    if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.' + method, beans.context.getGridId())) {
        return false;
    }
    if (beans.excelCreator!.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
        console.warn(
            "AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'"
        );
        return false;
    }
    return true;
}

export function getDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): string | Blob | undefined {
    if (assertNotExcelMultiSheet(beans, 'getDataAsExcel')) {
        return beans.excelCreator!.getDataAsExcel(params);
    }
}

export function exportDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): void {
    if (assertNotExcelMultiSheet(beans, 'exportDataAsExcel')) {
        beans.excelCreator!.exportDataAsExcel(params);
    }
}

export function getSheetDataForExcel(beans: BeanCollection, params?: ExcelExportParams): string | undefined {
    if (
        !ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.getSheetDataForExcel',
            beans.context.getGridId()
        )
    ) {
        return;
    }
    beans.excelCreator!.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

    return beans.excelCreator!.getSheetDataForExcel(params);
}

export function getMultipleSheetsAsExcel(
    beans: BeanCollection,
    params: ExcelExportMultipleSheetParams
): Blob | undefined {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.getMultipleSheetsAsExcel',
            beans.context.getGridId()
        )
    ) {
        return beans.excelCreator!.getMultipleSheetsAsExcel(params);
    }
}

export function exportMultipleSheetsAsExcel(beans: BeanCollection, params: ExcelExportMultipleSheetParams): void {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.exportMultipleSheetsAsExcel',
            beans.context.getGridId()
        )
    ) {
        beans.excelCreator!.exportMultipleSheetsAsExcel(params);
    }
}

export function setGridAriaProperty(beans: BeanCollection, property: string, value: string | null): void {
    if (!property) {
        return;
    }
    const eGrid = beans.ctrlsService.getGridBodyCtrl().getGui();
    const ariaProperty = `aria-${property}`;

    if (value === null) {
        eGrid.removeAttribute(ariaProperty);
    } else {
        eGrid.setAttribute(ariaProperty, value);
    }
}

function logMissingRowModel(apiMethod: keyof GridApi, ...requiredRowModels: RowModelType[]) {
    console.error(
        `AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`
    );
}

function logDeprecation(
    version: string,
    apiMethod: StartsWithGridApi,
    replacement: StartsWithGridApi,
    message?: string
) {
    _warnOnce(`Since ${version} api.${apiMethod} is deprecated. Please use ${replacement} instead. ${message ?? ''}`);
}

export function getPinnedTopRowCount(beans: BeanCollection): number {
    return beans.pinnedRowModel.getPinnedTopRowCount();
}

export function getPinnedBottomRowCount(beans: BeanCollection): number {
    return beans.pinnedRowModel.getPinnedBottomRowCount();
}

export function getPinnedTopRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.pinnedRowModel.getPinnedTopRow(index);
}

export function getPinnedBottomRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.pinnedRowModel.getPinnedBottomRow(index);
}

export function expireValueCache(beans: BeanCollection): void {
    beans.valueCache.expire();
}

export function getVerticalPixelRange(beans: BeanCollection): { top: number; bottom: number } {
    return beans.ctrlsService.getGridBodyCtrl().getScrollFeature().getVScrollPosition();
}

export function getHorizontalPixelRange(beans: BeanCollection): { left: number; right: number } {
    return beans.ctrlsService.getGridBodyCtrl().getScrollFeature().getHScrollPosition();
}

export function refreshCells<TData = any>(beans: BeanCollection, params: RefreshCellsParams<TData> = {}): void {
    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.refreshCells(params));
}

export function flashCells<TData = any>(beans: BeanCollection, params: FlashCellsParams<TData> = {}): void {
    const warning = (prop: 'fade' | 'flash') =>
        _warnOnce(
            `Since v31.1 api.flashCells parameter '${prop}Delay' is deprecated. Please use '${prop}Duration' instead.`
        );
    if (_exists(params.fadeDelay)) {
        warning('fade');
    }
    if (_exists(params.flashDelay)) {
        warning('flash');
    }

    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.flashCells(params));
}

export function redrawRows<TData = any>(beans: BeanCollection, params: RedrawRowsParams<TData> = {}): void {
    const rowNodes = params ? params.rowNodes : undefined;
    beans.frameworkOverrides.wrapIncoming(() => beans.rowRenderer.redrawRows(rowNodes));
}

export function refreshHeader(beans: BeanCollection) {
    beans.frameworkOverrides.wrapIncoming(() =>
        beans.ctrlsService.getHeaderRowContainerCtrls().forEach((c) => c.refresh())
    );
}

export function isAnyFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isAnyFilterPresent();
}

export function isColumnFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isColumnFilterPresent() || !!beans.filterManager?.isAggregateFilterPresent();
}

export function isQuickFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isQuickFilterPresent();
}

export function getModel(beans: BeanCollection): IRowModel {
    _warnOnce('Since v31.1 getModel() is deprecated. Please use the appropriate grid API methods instead.');
    return beans.rowModel;
}

export function setRowNodeExpanded(
    beans: BeanCollection,
    rowNode: IRowNode,
    expanded: boolean,
    expandParents?: boolean,
    forceSync?: boolean
): void {
    beans.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents, forceSync);
}

export function onGroupExpandedOrCollapsed(beans: BeanCollection) {
    if (_missing(beans.rowModelHelperService?.getClientSideRowModel())) {
        logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
        return;
    }
    beans.expansionService.onGroupExpandedOrCollapsed();
}

export function refreshClientSideRowModel(beans: BeanCollection, step?: ClientSideRowModelStep): any {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        logMissingRowModel('refreshClientSideRowModel', 'clientSide');
        return;
    }

    clientSideRowModel.refreshModel(step);
}

export function isAnimationFrameQueueEmpty(beans: BeanCollection): boolean {
    return beans.animationFrameService.isQueueEmpty();
}

export function flushAllAnimationFrames(beans: BeanCollection): void {
    beans.animationFrameService.flushAllFrames();
}

export function getRowNode<TData = any>(beans: BeanCollection, id: string): IRowNode<TData> | undefined {
    return beans.rowModel.getRowNode(id);
}

export function getSizesForCurrentTheme(beans: BeanCollection) {
    return {
        rowHeight: beans.gos.getRowHeightAsNumber(),
        headerHeight: beans.columnModel.getHeaderHeight(),
    };
}

export function expandAll(beans: BeanCollection) {
    if (beans.rowModelHelperService?.getClientSideRowModel() || beans.rowModelHelperService?.getServerSideRowModel()) {
        beans.expansionService.expandAll(true);
    } else {
        logMissingRowModel('expandAll', 'clientSide', 'serverSide');
    }
}

export function collapseAll(beans: BeanCollection) {
    if (beans.rowModelHelperService?.getClientSideRowModel() || beans.rowModelHelperService?.getServerSideRowModel()) {
        beans.expansionService.expandAll(false);
    } else {
        logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
    }
}

export function addRenderedRowListener(
    beans: BeanCollection,
    eventName: string,
    rowIndex: number,
    callback: (...args: any[]) => any
) {
    beans.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback as any);
}

export function getQuickFilter(beans: BeanCollection): string | undefined {
    return beans.gos.get('quickFilterText');
}

export function getAdvancedFilterModel(beans: BeanCollection): AdvancedFilterModel | null {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.AdvancedFilterModule,
            'api.getAdvancedFilterModel',
            beans.context.getGridId()
        )
    ) {
        return beans.filterManager?.getAdvancedFilterModel() ?? null;
    }
    return null;
}

export function setAdvancedFilterModel(beans: BeanCollection, advancedFilterModel: AdvancedFilterModel | null): void {
    beans.filterManager?.setAdvancedFilterModel(advancedFilterModel);
}

export function showAdvancedFilterBuilder(beans: BeanCollection): void {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.AdvancedFilterModule,
            'api.setAdvancedFilterModel',
            beans.context.getGridId()
        )
    ) {
        beans.filterManager?.showAdvancedFilterBuilder('api');
    }
}

export function setNodesSelected(
    beans: BeanCollection,
    params: { nodes: IRowNode[]; newValue: boolean; source?: SelectionEventSourceType }
) {
    const allNodesValid = params.nodes.every((node) => {
        if (node.rowPinned) {
            console.warn('AG Grid: cannot select pinned rows');
            return false;
        }

        if (node.id === undefined) {
            console.warn('AG Grid: cannot select node until id for node is known');
            return false;
        }
        return true;
    });

    if (!allNodesValid) {
        return;
    }

    const { nodes, source, newValue } = params;
    const nodesAsRowNode = nodes as RowNode[];
    beans.selectionService.setNodesSelected({ nodes: nodesAsRowNode, source: source ?? 'api', newValue });
}

export function selectAll(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAll') {
    beans.selectionService.selectAllRowNodes({ source });
}

export function deselectAll(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAll') {
    beans.selectionService.deselectAllRowNodes({ source });
}

export function selectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService.selectAllRowNodes({ source, justFiltered: true });
}

export function deselectAllFiltered(beans: BeanCollection, source: SelectionEventSourceType = 'apiSelectAllFiltered') {
    beans.selectionService.deselectAllRowNodes({ source, justFiltered: true });
}

export function getServerSideSelectionState(
    beans: BeanCollection
): IServerSideSelectionState | IServerSideGroupSelectionState | null {
    if (_missing(beans.rowModelHelperService?.getServerSideRowModel())) {
        logMissingRowModel('getServerSideSelectionState', 'serverSide');
        return null;
    }

    return beans.selectionService.getSelectionState() as
        | IServerSideSelectionState
        | IServerSideGroupSelectionState
        | null;
}

export function setServerSideSelectionState(
    beans: BeanCollection,
    state: IServerSideSelectionState | IServerSideGroupSelectionState
) {
    if (_missing(beans.rowModelHelperService?.getServerSideRowModel())) {
        logMissingRowModel('setServerSideSelectionState', 'serverSide');
        return;
    }

    beans.selectionService.setSelectionState(state, 'api');
}

export function selectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
}

export function deselectAllOnCurrentPage(
    beans: BeanCollection,
    source: SelectionEventSourceType = 'apiSelectAllCurrentPage'
) {
    beans.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
}

export function showLoadingOverlay(beans: BeanCollection): void {
    beans.overlayService.showLoadingOverlay();
}

export function showNoRowsOverlay(beans: BeanCollection): void {
    beans.overlayService.showNoRowsOverlay();
}

export function hideOverlay(beans: BeanCollection): void {
    beans.overlayService.hideOverlay();
}

export function getSelectedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[] {
    return beans.selectionService.getSelectedNodes();
}

export function getSelectedRows<TData = any>(beans: BeanCollection): TData[] {
    return beans.selectionService.getSelectedRows();
}

export function getBestCostNodeSelection<TData = any>(beans: BeanCollection): IRowNode<TData>[] | undefined {
    if (_missing(beans.rowModelHelperService?.getClientSideRowModel())) {
        logMissingRowModel('getBestCostNodeSelection', 'clientSide');
        return;
    }
    return beans.selectionService.getBestCostNodeSelection();
}

export function getRenderedNodes<TData = any>(beans: BeanCollection): IRowNode<TData>[] {
    return beans.rowRenderer.getRenderedNodes();
}

export function ensureColumnVisible(
    beans: BeanCollection,
    key: string | Column,
    position: 'auto' | 'start' | 'middle' | 'end' = 'auto'
) {
    beans.frameworkOverrides.wrapIncoming(
        () => beans.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(key, position),
        'ensureVisible'
    );
}

export function ensureIndexVisible(
    beans: BeanCollection,
    index: number,
    position?: 'top' | 'bottom' | 'middle' | null
) {
    beans.frameworkOverrides.wrapIncoming(
        () => beans.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureIndexVisible(index, position),
        'ensureVisible'
    );
}

export function ensureNodeVisible<TData = any>(
    beans: BeanCollection,
    nodeSelector: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
    position: 'top' | 'bottom' | 'middle' | null = null
) {
    beans.frameworkOverrides.wrapIncoming(
        () => beans.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureNodeVisible(nodeSelector, position),
        'ensureVisible'
    );
}

export function forEachLeafNode<TData = any>(beans: BeanCollection, callback: (rowNode: IRowNode<TData>) => void) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        logMissingRowModel('forEachLeafNode', 'clientSide');
        return;
    }
    clientSideRowModel.forEachLeafNode(callback);
}

export function forEachNode<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void,
    includeFooterNodes?: boolean
) {
    beans.rowModel.forEachNode(callback, includeFooterNodes);
}

export function forEachNodeAfterFilter<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
        return;
    }
    clientSideRowModel.forEachNodeAfterFilter(callback);
}

export function forEachNodeAfterFilterAndSort<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
        return;
    }
    clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
}

export function getFilterInstance<TFilter extends IFilter>(
    beans: BeanCollection,
    key: string | Column,
    callback?: (filter: TFilter | null) => void
): TFilter | null | undefined {
    _warnOnce(
        `'getFilterInstance' is deprecated. To get/set individual filter models, use 'getColumnFilterModel' or 'setColumnFilterModel' instead. To get hold of the filter instance, use 'getColumnFilterInstance' which returns the instance asynchronously.`
    );
    return beans.filterManager?.getFilterInstance(key as string | AgColumn, callback);
}

export function getColumnFilterInstance<TFilter extends IFilter>(
    beans: BeanCollection,
    key: string | Column
): Promise<TFilter | null | undefined> {
    return beans.filterManager?.getColumnFilterInstance(key as string | AgColumn) ?? Promise.resolve(undefined);
}

export function destroyFilter(beans: BeanCollection, key: string | Column) {
    const column = beans.columnModel.getColDefCol(key);
    if (column) {
        return beans.filterManager?.destroyFilter(column, 'api');
    }
}

export function getStatusPanel<TStatusPanel = IStatusPanel>(
    beans: BeanCollection,
    key: string
): TStatusPanel | undefined {
    if (
        !ModuleRegistry.__assertRegistered(ModuleNames.StatusBarModule, 'api.getStatusPanel', beans.context.getGridId())
    ) {
        return;
    }
    const comp = beans.statusBarService!.getStatusPanel(key);
    return unwrapUserComp(comp) as any;
}

export function getColumnDef<TValue = any, TData = any>(
    beans: BeanCollection,
    key: string | Column<TValue>
): ColDef<TData, TValue> | null {
    const column = beans.columnModel.getColDefCol(key);
    if (column) {
        return column.getColDef();
    }
    return null;
}

export function getColumnDefs<TData = any>(beans: BeanCollection): (ColDef<TData> | ColGroupDef<TData>)[] | undefined {
    return beans.columnModel.getColumnDefs();
}

export function onFilterChanged(beans: BeanCollection, source: FilterChangedEventSourceType = 'api') {
    beans.filterManager?.onFilterChanged({ source });
}

export function onSortChanged(beans: BeanCollection) {
    beans.sortController.onSortChanged('api');
}

export function setFilterModel(beans: BeanCollection, model: FilterModel | null): void {
    beans.frameworkOverrides.wrapIncoming(() => beans.filterManager?.setFilterModel(model));
}

export function getFilterModel(beans: BeanCollection): FilterModel {
    return beans.filterManager?.getFilterModel() ?? {};
}

export function getColumnFilterModel<TModel>(beans: BeanCollection, column: string | Column): TModel | null {
    return beans.filterManager?.getColumnFilterModel(column as string | AgColumn) ?? null;
}

export function setColumnFilterModel<TModel>(
    beans: BeanCollection,
    column: string | Column,
    model: TModel | null
): Promise<void> {
    return beans.filterManager?.setColumnFilterModel(column as string | AgColumn, model) ?? Promise.resolve();
}

export function getFocusedCell(beans: BeanCollection): CellPosition | null {
    return beans.focusService.getFocusedCell();
}

export function clearFocusedCell(beans: BeanCollection): void {
    return beans.focusService.clearFocusedCell();
}

export function setFocusedCell(
    beans: BeanCollection,
    rowIndex: number,
    colKey: string | Column,
    rowPinned?: RowPinnedType
) {
    beans.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
}

export function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    beans.ctrlsService.getGridBodyCtrl().getRowDragFeature().addRowDropZone(params);
}

export function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    const activeDropTarget = beans.dragAndDropService.findExternalZone(params);

    if (activeDropTarget) {
        beans.dragAndDropService.removeDropTarget(activeDropTarget);
    }
}

export function getRowDropZoneParams(beans: BeanCollection, events?: RowDropZoneEvents): RowDropZoneParams {
    return beans.ctrlsService.getGridBodyCtrl().getRowDragFeature().getRowDropZone(events);
}

function assertSideBarLoaded(beans: BeanCollection, apiMethod: keyof GridApi): boolean {
    return ModuleRegistry.__assertRegistered(ModuleNames.SideBarModule, 'api.' + apiMethod, beans.context.getGridId());
}

export function isSideBarVisible(beans: BeanCollection): boolean {
    return assertSideBarLoaded(beans, 'isSideBarVisible') && beans.sideBarService!.getSideBarComp().isDisplayed();
}

export function setSideBarVisible(beans: BeanCollection, show: boolean) {
    if (assertSideBarLoaded(beans, 'setSideBarVisible')) {
        beans.sideBarService!.getSideBarComp().setDisplayed(show);
    }
}

export function setSideBarPosition(beans: BeanCollection, position: 'left' | 'right') {
    if (assertSideBarLoaded(beans, 'setSideBarPosition')) {
        beans.sideBarService!.getSideBarComp().setSideBarPosition(position);
    }
}

export function openToolPanel(beans: BeanCollection, key: string) {
    if (assertSideBarLoaded(beans, 'openToolPanel')) {
        beans.sideBarService!.getSideBarComp().openToolPanel(key, 'api');
    }
}

export function closeToolPanel(beans: BeanCollection) {
    if (assertSideBarLoaded(beans, 'closeToolPanel')) {
        beans.sideBarService!.getSideBarComp().close('api');
    }
}

export function getOpenedToolPanel(beans: BeanCollection): string | null {
    if (assertSideBarLoaded(beans, 'getOpenedToolPanel')) {
        return beans.sideBarService!.getSideBarComp().openedItem();
    }
    return null;
}

export function refreshToolPanel(beans: BeanCollection): void {
    if (assertSideBarLoaded(beans, 'refreshToolPanel')) {
        beans.sideBarService!.getSideBarComp().refresh();
    }
}

export function isToolPanelShowing(beans: BeanCollection): boolean {
    return (
        assertSideBarLoaded(beans, 'isToolPanelShowing') && beans.sideBarService!.getSideBarComp().isToolPanelShowing()
    );
}

export function getToolPanelInstance<TToolPanel = IToolPanel>(
    beans: BeanCollection,
    id: string
): TToolPanel | undefined {
    if (assertSideBarLoaded(beans, 'getToolPanelInstance')) {
        const comp = beans.sideBarService!.getSideBarComp().getToolPanelInstance(id);
        return unwrapUserComp(comp) as any;
    }
}

export function getSideBar(beans: BeanCollection): SideBarDef | undefined {
    if (assertSideBarLoaded(beans, 'getSideBar')) {
        return beans.sideBarService!.getSideBarComp().getDef();
    }
    return undefined;
}

export function resetRowHeights(beans: BeanCollection) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_exists(clientSideRowModel)) {
        if (beans.columnModel.isAutoRowHeightActive()) {
            console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
            return;
        }
        clientSideRowModel.resetRowHeights();
    }
}

export function setRowCount(beans: BeanCollection, rowCount: number, maxRowFound?: boolean): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (serverSideRowModel) {
        if (beans.funcColsService.isRowGroupEmpty()) {
            serverSideRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }
        console.error('AG Grid: setRowCount cannot be used while using row grouping.');
        return;
    }

    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.setRowCount(rowCount, maxRowFound);
        return;
    }

    logMissingRowModel('setRowCount', 'infinite', 'serverSide');
}

export function onRowHeightChanged(beans: BeanCollection) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (clientSideRowModel) {
        clientSideRowModel.onRowHeightChanged();
    } else if (serverSideRowModel) {
        serverSideRowModel.onRowHeightChanged();
    }
}

export function getValue<TValue = any>(
    beans: BeanCollection,
    colKey: string | Column<TValue>,
    rowNode: IRowNode
): TValue | null | undefined {
    logDeprecation('31.3', 'getValue', 'getCellValue');
    return getCellValue(beans, { colKey, rowNode }) as TValue | null | undefined;
}

export function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any {
    const { colKey, rowNode, useFormatter } = params;

    const column = beans.columnModel.getColDefCol(colKey) ?? beans.columnModel.getCol(colKey);
    if (_missing(column)) {
        return null;
    }

    const value = beans.valueService.getValue(column, rowNode);

    if (useFormatter) {
        const formattedValue = beans.valueService.formatValue(column, rowNode, value);
        // Match the logic in the default cell renderer insertValueWithoutCellRenderer if no formatter is used
        return formattedValue ?? _escapeString(value, true);
    }

    return value;
}

export function addEventListener(beans: BeanCollection, eventType: string, listener: (...args: any[]) => any): void {
    beans.apiEventService.addEventListener(eventType, listener as AgEventListener);
}

export function addGlobalListener(beans: BeanCollection, listener: (...args: any[]) => any): void {
    beans.apiEventService.addGlobalListener(listener as AgGlobalEventListener);
}

export function removeEventListener(beans: BeanCollection, eventType: string, listener: (...args: any[]) => any): void {
    beans.apiEventService.removeEventListener(eventType, listener as AgEventListener);
}

export function removeGlobalListener(beans: BeanCollection, listener: (...args: any[]) => any): void {
    beans.apiEventService.removeGlobalListener(listener as AgGlobalEventListener);
}

export function dispatchEvent(beans: BeanCollection, event: AgEvent): void {
    beans.eventService.dispatchEvent(event);
}

export function destroy(beans: BeanCollection): void {
    beans.gridDestroyService.destroy();
}

export function isDestroyed(beans: BeanCollection): boolean {
    return beans.gridDestroyService.isDestroyCalled();
}

export function resetQuickFilter(beans: BeanCollection): void {
    beans.filterManager?.resetQuickFilterCache();
}

export function getCellRanges(beans: BeanCollection): CellRange[] | null {
    if (beans.rangeService) {
        return beans.rangeService.getCellRanges();
    }

    ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.getCellRanges', beans.context.getGridId());
    return null;
}

export function addCellRange(beans: BeanCollection, params: CellRangeParams): void {
    if (beans.rangeService) {
        beans.rangeService.addCellRange(params);
        return;
    }
    ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.addCellRange', beans.context.getGridId());
}

export function clearRangeSelection(beans: BeanCollection): void {
    if (beans.rangeService) {
        beans.rangeService.removeAllCellRanges();
    }
    ModuleRegistry.__assertRegistered(
        ModuleNames.RangeSelectionModule,
        'gridApi.clearRangeSelection',
        beans.context.getGridId()
    );
}

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedoService?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedoService?.redo('api');
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedoService?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedoService?.getCurrentRedoStackSize() ?? 0;
}

function assertChart<T>(beans: BeanCollection, methodName: keyof GridApi, func: () => T): T | undefined {
    if (
        ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.' + methodName, beans.context.getGridId())
    ) {
        return beans.frameworkOverrides.wrapIncoming(() => func());
    }
}

export function getChartModels(beans: BeanCollection): ChartModel[] | undefined {
    return assertChart(beans, 'getChartModels', () => beans.chartService!.getChartModels());
}

export function getChartRef(beans: BeanCollection, chartId: string): ChartRef | undefined {
    return assertChart(beans, 'getChartRef', () => beans.chartService!.getChartRef(chartId));
}

export function getChartImageDataURL(beans: BeanCollection, params: GetChartImageDataUrlParams): string | undefined {
    return assertChart(beans, 'getChartImageDataURL', () => beans.chartService!.getChartImageDataURL(params));
}

export function downloadChart(beans: BeanCollection, params: ChartDownloadParams) {
    return assertChart(beans, 'downloadChart', () => beans.chartService!.downloadChart(params));
}

export function openChartToolPanel(beans: BeanCollection, params: OpenChartToolPanelParams) {
    return assertChart(beans, 'openChartToolPanel', () => beans.chartService!.openChartToolPanel(params));
}

export function closeChartToolPanel(beans: BeanCollection, params: CloseChartToolPanelParams) {
    return assertChart(beans, 'closeChartToolPanel', () => beans.chartService!.closeChartToolPanel(params.chartId));
}

export function createRangeChart(beans: BeanCollection, params: CreateRangeChartParams): ChartRef | undefined {
    return assertChart(beans, 'createRangeChart', () => beans.chartService!.createRangeChart(params));
}

export function createPivotChart(beans: BeanCollection, params: CreatePivotChartParams): ChartRef | undefined {
    return assertChart(beans, 'createPivotChart', () => beans.chartService!.createPivotChart(params));
}

export function createCrossFilterChart(
    beans: BeanCollection,
    params: CreateCrossFilterChartParams
): ChartRef | undefined {
    return assertChart(beans, 'createCrossFilterChart', () => beans.chartService!.createCrossFilterChart(params));
}

export function updateChart(beans: BeanCollection, params: UpdateChartParams): void {
    return assertChart(beans, 'updateChart', () => beans.chartService!.updateChart(params));
}

export function restoreChart(
    beans: BeanCollection,
    chartModel: ChartModel,
    chartContainer?: HTMLElement
): ChartRef | undefined {
    return assertChart(beans, 'restoreChart', () => beans.chartService!.restoreChart(chartModel, chartContainer));
}

function assertClipboard<T>(beans: BeanCollection, methodName: keyof GridApi, func: () => T): void {
    if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api' + methodName, beans.context.getGridId())) {
        func();
    }
}

export function copyToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    assertClipboard(beans, 'copyToClipboard', () => beans.clipboardService!.copyToClipboard(params));
}

export function cutToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    assertClipboard(beans, 'cutToClipboard', () => beans.clipboardService!.cutToClipboard(params));
}

export function copySelectedRowsToClipboard(beans: BeanCollection, params?: IClipboardCopyRowsParams): void {
    assertClipboard(beans, 'copySelectedRowsToClipboard', () =>
        beans.clipboardService!.copySelectedRowsToClipboard(params)
    );
}

export function copySelectedRangeToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void {
    assertClipboard(beans, 'copySelectedRangeToClipboard', () =>
        beans.clipboardService!.copySelectedRangeToClipboard(params)
    );
}

export function copySelectedRangeDown(beans: BeanCollection): void {
    assertClipboard(beans, 'copySelectedRangeDown', () => beans.clipboardService!.copyRangeDown());
}

export function pasteFromClipboard(beans: BeanCollection): void {
    assertClipboard(beans, 'pasteFromClipboard', () => beans.clipboardService!.pasteFromClipboard());
}

export function showColumnMenuAfterButtonClick(
    beans: BeanCollection,
    colKey: string | Column,
    buttonElement: HTMLElement
): void {
    _warnOnce(
        `'showColumnMenuAfterButtonClick' is deprecated. Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`
    );
    // use grid column so works with pivot mode
    const column = beans.columnModel.getCol(colKey)!;
    beans.menuService.showColumnMenu({
        column,
        buttonElement,
        positionBy: 'button',
    });
}

export function showColumnMenuAfterMouseClick(
    beans: BeanCollection,
    colKey: string | Column,
    mouseEvent: MouseEvent | Touch
): void {
    _warnOnce(
        `'showColumnMenuAfterMouseClick' is deprecated. Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`
    );
    // use grid column so works with pivot mode
    let column = beans.columnModel.getCol(colKey);
    if (!column) {
        column = beans.columnModel.getColDefCol(colKey);
    }
    if (!column) {
        console.error(`AG Grid: column '${colKey}' not found`);
        return;
    }
    beans.menuService.showColumnMenu({
        column,
        mouseEvent,
        positionBy: 'mouse',
    });
}

export function showContextMenu(beans: BeanCollection, params?: IContextMenuParams) {
    const { rowNode, column, value, x, y } = params || {};
    let { x: clientX, y: clientY } = beans.menuService.getContextMenuPosition(rowNode, column as AgColumn);

    if (x != null) {
        clientX = x;
    }

    if (y != null) {
        clientY = y;
    }

    beans.menuService.showContextMenu({
        mouseEvent: new MouseEvent('mousedown', { clientX, clientY }),
        rowNode,
        column,
        value,
    });
}

export function showColumnChooser(beans: BeanCollection, params?: ColumnChooserParams): void {
    beans.menuService.showColumnChooser({ chooserParams: params });
}

export function showColumnFilter(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        console.error(`AG Grid: column '${colKey}' not found`);
        return;
    }
    beans.menuService.showFilterMenu({
        column,
        containerType: 'columnFilter',
        positionBy: 'auto',
    });
}

export function showColumnMenu(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        console.error(`AG Grid: column '${colKey}' not found`);
        return;
    }
    beans.menuService.showColumnMenu({
        column,
        positionBy: 'auto',
    });
}

export function hidePopupMenu(beans: BeanCollection): void {
    beans.menuService.hidePopupMenu();
}

export function hideColumnChooser(beans: BeanCollection): void {
    beans.menuService.hideColumnChooser();
}

export function tabToNextCell(beans: BeanCollection, event?: KeyboardEvent): boolean {
    return beans.navigationService.tabToNextCell(false, event);
}

export function tabToPreviousCell(beans: BeanCollection, event?: KeyboardEvent): boolean {
    return beans.navigationService.tabToNextCell(true, event);
}

export function getCellRendererInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellRendererInstancesParams<TData> = {}
): ICellRenderer[] {
    const res = beans.rowRenderer.getCellRendererInstances(params);
    const unwrapped = res.map(unwrapUserComp);
    return unwrapped;
}

export function getCellEditorInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): ICellEditor[] {
    const res = beans.rowRenderer.getCellEditorInstances(params);
    const unwrapped = res.map(unwrapUserComp);
    return unwrapped;
}

export function getEditingCells(beans: BeanCollection): CellPosition[] {
    return beans.rowRenderer.getEditingCells();
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    beans.rowRenderer.stopEditing(cancel);
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const column = beans.columnModel.getCol(params.colKey);
    if (!column) {
        console.warn(`AG Grid: no column found for ${params.colKey}`);
        return;
    }
    const cellPosition: CellPosition = {
        rowIndex: params.rowIndex,
        rowPinned: params.rowPinned || null,
        column: column,
    };
    const notPinned = params.rowPinned == null;
    if (notPinned) {
        ensureIndexVisible(beans, params.rowIndex);
    }

    ensureColumnVisible(beans, params.colKey);

    const cell = beans.navigationService.getCellByPosition(cellPosition);
    if (!cell) {
        return;
    }
    if (!beans.focusService.isCellFocused(cellPosition)) {
        beans.focusService.setFocusedCell(cellPosition);
    }
    cell.startRowOrCellEdit(params.key);
}

export function addAggFunc(beans: BeanCollection, key: string, aggFunc: IAggFunc): void {
    logDeprecation('v31.1', 'addAggFunc(key, func)', 'addAggFuncs({ key: func })');
    if (beans.aggFuncService) {
        beans.aggFuncService.addAggFuncs({ key: aggFunc });
    }
}

export function addAggFuncs(beans: BeanCollection, aggFuncs: { [key: string]: IAggFunc }): void {
    if (beans.aggFuncService) {
        beans.aggFuncService.addAggFuncs(aggFuncs);
    }
}

export function clearAggFuncs(beans: BeanCollection): void {
    if (beans.aggFuncService) {
        beans.aggFuncService.clear();
    }
}

export function applyServerSideTransaction(
    beans: BeanCollection,
    transaction: ServerSideTransaction
): ServerSideTransactionResult | undefined {
    if (!beans.ssrmTransactionManager) {
        logMissingRowModel('applyServerSideTransaction', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.applyTransaction(transaction);
}

export function applyServerSideTransactionAsync(
    beans: BeanCollection,
    transaction: ServerSideTransaction,
    callback?: (res: ServerSideTransactionResult) => void
): void {
    if (!beans.ssrmTransactionManager) {
        logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.applyTransactionAsync(transaction, callback);
}

export function applyServerSideRowData(
    beans: BeanCollection,
    params: { successParams: LoadSuccessParams; route?: string[]; startRow?: number }
) {
    const startRow = params.startRow ?? 0;
    const route = params.route ?? [];
    if (startRow < 0) {
        console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
        return;
    }

    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (serverSideRowModel) {
        serverSideRowModel.applyRowData(params.successParams, startRow, route);
    } else {
        logMissingRowModel('applyServerSideRowData', 'serverSide');
    }
}

export function retryServerSideLoads(beans: BeanCollection): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        logMissingRowModel('retryServerSideLoads', 'serverSide');
        return;
    }
    serverSideRowModel.retryLoads();
}

export function flushServerSideAsyncTransactions(beans: BeanCollection): void {
    if (!beans.ssrmTransactionManager) {
        logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.flushAsyncTransactions();
}

export function applyTransaction<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>
): RowNodeTransaction<TData> | null | undefined {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        logMissingRowModel('applyTransaction', 'clientSide');
        return;
    }
    return beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.updateRowData(rowDataTransaction));
}

export function applyTransactionAsync<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>,
    callback?: (res: RowNodeTransaction<TData>) => void
): void {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        logMissingRowModel('applyTransactionAsync', 'clientSide');
        return;
    }
    beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback));
}

export function flushAsyncTransactions(beans: BeanCollection): void {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        logMissingRowModel('flushAsyncTransactions', 'clientSide');
        return;
    }
    beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.flushAsyncTransactions());
}

export function refreshInfiniteCache(beans: BeanCollection): void {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.refreshCache();
    } else {
        logMissingRowModel('refreshInfiniteCache', 'infinite');
    }
}

export function purgeInfiniteCache(beans: BeanCollection): void {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.purgeCache();
    } else {
        logMissingRowModel('purgeInfiniteCache', 'infinite');
    }
}

export function refreshServerSide(beans: BeanCollection, params?: RefreshServerSideParams): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        logMissingRowModel('refreshServerSide', 'serverSide');
        return;
    }
    serverSideRowModel.refreshStore(params);
}

export function getServerSideGroupLevelState(beans: BeanCollection): ServerSideGroupLevelState[] {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        logMissingRowModel('getServerSideGroupLevelState', 'serverSide');
        return [];
    }
    return serverSideRowModel.getStoreState();
}

export function getInfiniteRowCount(beans: BeanCollection): number | undefined {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        return infiniteRowModel.getRowCount();
    } else {
        logMissingRowModel('getInfiniteRowCount', 'infinite');
    }
}

export function isLastRowIndexKnown(beans: BeanCollection): boolean | undefined {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        return infiniteRowModel.isLastRowIndexKnown();
    } else {
        logMissingRowModel('isLastRowIndexKnown', 'infinite');
    }
}

export function getCacheBlockState(beans: BeanCollection): any {
    return beans.rowNodeBlockLoader?.getBlockState() ?? {};
}

export function getFirstDisplayedRow(beans: BeanCollection): number {
    logDeprecation('v31.1', 'getFirstDisplayedRow', 'getFirstDisplayedRowIndex');
    return getFirstDisplayedRowIndex(beans);
}

export function getFirstDisplayedRowIndex(beans: BeanCollection): number {
    return beans.rowRenderer.getFirstVirtualRenderedRow();
}

export function getLastDisplayedRow(beans: BeanCollection): number {
    logDeprecation('v31.1', 'getLastDisplayedRow', 'getLastDisplayedRowIndex');
    return getLastDisplayedRowIndex(beans);
}

export function getLastDisplayedRowIndex(beans: BeanCollection): number {
    return beans.rowRenderer.getLastVirtualRenderedRow();
}

export function getDisplayedRowAtIndex<TData = any>(beans: BeanCollection, index: number): IRowNode<TData> | undefined {
    return beans.rowModel.getRow(index);
}

export function getDisplayedRowCount(beans: BeanCollection): number {
    return beans.rowModel.getRowCount();
}

export function paginationIsLastPageFound(beans: BeanCollection): boolean {
    return beans.rowModel.isLastRowIndexKnown();
}

export function paginationGetPageSize(beans: BeanCollection): number {
    return beans.paginationService?.getPageSize() ?? 100;
}

export function paginationGetCurrentPage(beans: BeanCollection): number {
    return beans.paginationService?.getCurrentPage() ?? 0;
}

export function paginationGetTotalPages(beans: BeanCollection): number {
    return beans.paginationService?.getTotalPages() ?? 1;
}

export function paginationGetRowCount(beans: BeanCollection): number {
    return beans.paginationService ? beans.paginationService.getMasterRowCount() : beans.rowModel.getRowCount();
}

export function paginationGoToNextPage(beans: BeanCollection): void {
    beans.paginationService?.goToNextPage();
}

export function paginationGoToPreviousPage(beans: BeanCollection): void {
    beans.paginationService?.goToPreviousPage();
}

export function paginationGoToFirstPage(beans: BeanCollection): void {
    beans.paginationService?.goToFirstPage();
}

export function paginationGoToLastPage(beans: BeanCollection): void {
    beans.paginationService?.goToLastPage();
}

export function paginationGoToPage(beans: BeanCollection, page: number): void {
    beans.paginationService?.goToPage(page);
}

export function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
    if (typeof paramsOrGridWidth === 'number') {
        beans.columnSizeService.sizeColumnsToFit(paramsOrGridWidth, 'api');
    } else {
        beans.ctrlsService.getGridBodyCtrl().sizeColumnsToFit(paramsOrGridWidth);
    }
}

export function setColumnGroupOpened(
    beans: BeanCollection,
    group: ProvidedColumnGroup | string,
    newValue: boolean
): void {
    beans.columnModel.setColumnGroupOpened(group as AgProvidedColumnGroup | string, newValue, 'api');
}

export function getColumnGroup(beans: BeanCollection, name: string, instanceId?: number): ColumnGroup | null {
    return beans.visibleColsService.getColumnGroup(name, instanceId);
}

export function getProvidedColumnGroup(beans: BeanCollection, name: string): ProvidedColumnGroup | null {
    return beans.columnModel.getProvidedColGroup(name);
}

export function getDisplayNameForColumn(beans: BeanCollection, column: Column, location: HeaderLocation): string {
    return beans.columnNameService.getDisplayNameForColumn(column as AgColumn, location) || '';
}

export function getDisplayNameForColumnGroup(
    beans: BeanCollection,
    columnGroup: ColumnGroup,
    location: HeaderLocation
): string {
    return beans.columnNameService.getDisplayNameForColumnGroup(columnGroup as AgColumnGroup, location) || '';
}

export function getColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    key: string | ColDef<TData, TValue> | Column<TValue>
): Column<TValue> | null {
    return beans.columnModel.getColDefCol(key);
}

export function getColumns(beans: BeanCollection): Column[] | null {
    return beans.columnModel.getColDefCols();
}

export function applyColumnState(beans: BeanCollection, params: ApplyColumnStateParams): boolean {
    return beans.columnApplyStateService.applyColumnState(params, 'api');
}

export function getColumnState(beans: BeanCollection): ColumnState[] {
    return beans.columnGetStateService.getColumnState();
}

export function resetColumnState(beans: BeanCollection): void {
    beans.columnApplyStateService.resetColumnState('api');
}

export function getColumnGroupState(beans: BeanCollection): { groupId: string; open: boolean }[] {
    return beans.columnGroupStateService.getColumnGroupState();
}

export function setColumnGroupState(beans: BeanCollection, stateItems: { groupId: string; open: boolean }[]): void {
    beans.columnGroupStateService.setColumnGroupState(stateItems, 'api');
}

export function resetColumnGroupState(beans: BeanCollection): void {
    beans.columnGroupStateService.resetColumnGroupState('api');
}

export function isPinning(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningLeft() || beans.visibleColsService.isPinningRight();
}

export function isPinningLeft(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningLeft();
}

export function isPinningRight(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningRight();
}

export function getDisplayedColAfter(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleColsService.getColAfter(col as AgColumn);
}

export function getDisplayedColBefore(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleColsService.getColBefore(col as AgColumn);
}

export function setColumnVisible(beans: BeanCollection, key: string | Column, visible: boolean): void {
    logDeprecation('v31.1', 'setColumnVisible(key,visible)', 'setColumnsVisible([key],visible)');
    beans.columnModel.setColsVisible([key as string | AgColumn], visible, 'api');
}

export function setColumnsVisible(beans: BeanCollection, keys: (string | Column)[], visible: boolean): void {
    beans.columnModel.setColsVisible(keys as (string | AgColumn)[], visible, 'api');
}

export function setColumnPinned(beans: BeanCollection, key: string | ColDef | Column, pinned: ColumnPinnedType): void {
    logDeprecation('v31.1', 'setColumnPinned(key,pinned)', 'setColumnsPinned([key],pinned)');
    beans.columnModel.setColsPinned([key], pinned, 'api');
}

export function setColumnsPinned(
    beans: BeanCollection,
    keys: (string | ColDef | Column)[],
    pinned: ColumnPinnedType
): void {
    beans.columnModel.setColsPinned(keys, pinned, 'api');
}

export function getAllGridColumns(beans: BeanCollection): Column[] {
    return beans.columnModel.getCols();
}

export function getDisplayedLeftColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.getLeftCols();
}

export function getDisplayedCenterColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.getCenterCols();
}

export function getDisplayedRightColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.getRightCols();
}

export function getAllDisplayedColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.getAllCols();
}

export function getAllDisplayedVirtualColumns(beans: BeanCollection): Column[] {
    return beans.columnViewportService.getViewportColumns();
}

export function moveColumn(beans: BeanCollection, key: string | ColDef | Column, toIndex: number): void {
    logDeprecation('v31.1', 'moveColumn(key, toIndex)', 'moveColumns([key], toIndex)');
    beans.columnMoveService.moveColumns([key], toIndex, 'api');
}

export function moveColumnByIndex(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.columnMoveService.moveColumnByIndex(fromIndex, toIndex, 'api');
}

export function moveColumns(beans: BeanCollection, columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) {
    beans.columnMoveService.moveColumns(columnsToMoveKeys, toIndex, 'api');
}

export function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.funcColsService.moveRowGroupColumn(fromIndex, toIndex, 'api');
}

export function setColumnAggFunc(
    beans: BeanCollection,
    key: string | ColDef | Column,
    aggFunc: string | IAggFunc | null | undefined
): void {
    beans.funcColsService.setColumnAggFunc(key, aggFunc, 'api');
}

export function setColumnWidth(
    beans: BeanCollection,
    key: string | ColDef | Column,
    newWidth: number,
    finished: boolean = true,
    source: ColumnEventType = 'api'
): void {
    logDeprecation('v31.1', 'setColumnWidth(col, width)', 'setColumnWidths([{key: col, newWidth: width}])');
    beans.columnSizeService.setColumnWidths([{ key, newWidth }], false, finished, source);
}

export function setColumnWidths(
    beans: BeanCollection,
    columnWidths: { key: string | ColDef | Column; newWidth: number }[],
    finished: boolean = true,
    source: ColumnEventType = 'api'
): void {
    beans.columnSizeService.setColumnWidths(columnWidths, false, finished, source);
}

export function isPivotMode(beans: BeanCollection): boolean {
    return beans.columnModel.isPivotMode();
}

export function getPivotResultColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    pivotKeys: string[],
    valueColKey: string | ColDef<TData, TValue> | Column<TValue>
): Column<TValue> | null {
    return beans.pivotResultColsService.lookupPivotResultCol(pivotKeys, valueColKey);
}

export function setValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setValueColumns(colKeys, 'api');
}

export function getValueColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getValueColumns();
}

export function removeValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'removeValueColumn(colKey)', 'removeValueColumns([colKey])');
    beans.funcColsService.removeValueColumns([colKey], 'api');
}

export function removeValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removeValueColumns(colKeys, 'api');
}

export function addValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'addValueColumn(colKey)', 'addValueColumns([colKey])');
    beans.funcColsService.addValueColumns([colKey], 'api');
}

export function addValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addValueColumns(colKeys, 'api');
}

export function setRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setRowGroupColumns(colKeys, 'api');
}

export function removeRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'removeRowGroupColumn(colKey)', 'removeRowGroupColumns([colKey])');
    beans.funcColsService.removeRowGroupColumns([colKey], 'api');
}

export function removeRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removeRowGroupColumns(colKeys, 'api');
}

export function addRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'addRowGroupColumn(colKey)', 'addRowGroupColumns([colKey])');
    beans.funcColsService.addRowGroupColumns([colKey], 'api');
}

export function addRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addRowGroupColumns(colKeys, 'api');
}

export function getRowGroupColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getRowGroupColumns();
}

export function setPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setPivotColumns(colKeys, 'api');
}

export function removePivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'removePivotColumn(colKey)', 'removePivotColumns([colKey])');
    beans.funcColsService.removePivotColumns([colKey], 'api');
}

export function removePivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removePivotColumns(colKeys, 'api');
}

export function addPivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    logDeprecation('v31.1', 'addPivotColumn(colKey)', 'addPivotColumns([colKey])');
    beans.funcColsService.addPivotColumns([colKey], 'api');
}

export function addPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addPivotColumns(colKeys, 'api');
}

export function getPivotColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getPivotColumns();
}

export function getLeftDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.getTreeLeft();
}

export function getCenterDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.getTreeCenter();
}

export function getRightDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.getTreeRight();
}

export function getAllDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] | null {
    return beans.visibleColsService.getAllTrees();
}

export function autoSizeColumn(beans: BeanCollection, key: string | ColDef | Column, skipHeader?: boolean): void {
    logDeprecation('v31.1', 'autoSizeColumn(key, skipHeader)', 'autoSizeColumns([key], skipHeader)');
    return beans.columnAutosizeService.autoSizeCols({ colKeys: [key], skipHeader: skipHeader, source: 'api' });
}

export function autoSizeColumns(beans: BeanCollection, keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
    beans.columnAutosizeService.autoSizeCols({ colKeys: keys, skipHeader: skipHeader, source: 'api' });
}

export function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void {
    beans.columnAutosizeService.autoSizeAllColumns('api', skipHeader);
}

export function setPivotResultColumns(beans: BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void {
    beans.pivotResultColsService.setPivotResultCols(colDefs, 'api');
}

export function getPivotResultColumns(beans: BeanCollection): Column[] | null {
    const pivotResultCols = beans.pivotResultColsService.getPivotResultCols();
    return pivotResultCols ? pivotResultCols.list : null;
}

export function getState(beans: BeanCollection): GridState {
    return beans.stateService?.getState() ?? {};
}

export function getGridOption<Key extends keyof GridOptions<TData>, TData = any>(
    beans: BeanCollection,
    key: Key
): GridOptions<TData>[Key] {
    return beans.gos.get(key);
}

export function setGridOption<Key extends ManagedGridOptionKey, TData = any>(
    beans: BeanCollection,
    key: Key,
    value: GridOptions<TData>[Key]
): void {
    updateGridOptions(beans, { [key]: value });
}

export function updateGridOptions<TDataUpdate = any>(
    beans: BeanCollection,
    options: ManagedGridOptions<TDataUpdate>
): void {
    // NOTE: The TDataUpdate generic is used to ensure that the update options match the generic passed into the GridApi above as TData.
    // This is required because if we just use TData directly then Typescript will get into an infinite loop due to callbacks which recursively include the GridApi.
    beans.gos.updateGridOptions({ options });
}

/** Utility type to support adding params to a grid api method. */
type StartsWithGridApi = `${keyof GridApi}${string}`;
