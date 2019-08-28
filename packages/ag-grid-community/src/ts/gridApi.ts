import { CsvCreator } from "./exporter/csvCreator";
import { RowRenderer } from "./rendering/rowRenderer";
import { FilterManager } from "./filter/filterManager";
import { ColumnController } from "./columnController/columnController";
import { ColumnApi } from "./columnController/columnApi";
import { SelectionController } from "./selectionController";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { GridPanel } from "./gridPanel/gridPanel";
import { ValueService } from "./valueService/valueService";
import { EventService } from "./eventService";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { RowNode } from "./entities/rowNode";
import { Constants } from "./constants";
import { Column } from "./entities/column";
import { Autowired, Bean, Context, Optional, PostConstruct } from "./context/context";
import { GridCore } from "./gridCore";
import { IRowModel } from "./interfaces/iRowModel";
import { SortController } from "./sortController";
import { FocusedCellController } from "./focusedCellController";
import { CellRange, CellRangeParams, IRangeController } from "./interfaces/iRangeController";
import { CellPosition } from "./entities/cellPosition";
import { IClipboardService } from "./interfaces/iClipboardService";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { IMenuFactory } from "./interfaces/iMenuFactory";
import { InfiniteRowModel } from "./rowModels/infinite/infiniteRowModel";
import { CellRendererFactory } from "./rendering/cellRendererFactory";
import { IAggFuncService } from "./interfaces/iAggFuncService";
import { IFilterComp } from "./interfaces/iFilter";
import { CsvExportParams } from "./exporter/exportParams";
import { ExcelExportParams, IExcelCreator } from "./interfaces/iExcelCreator";
import { IDatasource } from "./rowModels/iDatasource";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import { PaginationProxy } from "./rowModels/paginationProxy";
import {
    ClientSideRowModel,
    RefreshModelParams,
    RowDataTransaction,
    RowNodeTransaction
} from "./rowModels/clientSide/clientSideRowModel";
import { ImmutableService } from "./rowModels/clientSide/immutableService";
import { ValueCache } from "./valueService/valueCache";
import { AlignedGridsService } from "./alignedGridsService";
import { PinnedRowModel } from "./rowModels/pinnedRowModel";
import { AgEvent, ColumnEventType } from "./events";
import { ISideBar } from "./interfaces/ISideBar";
import { IContextMenuFactory } from "./interfaces/iContextMenuFactory";
import { ICellRendererComp } from "./rendering/cellRenderers/iCellRenderer";
import { ICellEditorComp } from "./interfaces/iCellEditor";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { AnimationFrameService } from "./misc/animationFrameService";
import { IServerSideRowModel } from "./interfaces/iServerSideRowModel";
import { IStatusBarService } from "./interfaces/iStatusBarService";
import { IStatusPanelComp } from "./interfaces/iStatusPanel";
import { SideBarDef } from "./entities/sideBar";
import { IChartService } from "./interfaces/IChartService";
import { ModuleNames } from "./modules/moduleNames";
import { _ } from "./utils";
import { ChartRef, ProcessChartOptionsParams } from "./entities/gridOptions";
import { ChartOptions, ChartType } from "./interfaces/iChartOptions";

export interface StartEditingCellParams {
    rowIndex: number;
    colKey: string | Column;
    rowPinned?: string;
    keyPress?: number;
    charPress?: string;
}

export interface GetCellsParams {
    rowNodes?: RowNode[];
    columns?: (string | Column)[];
}

export interface RefreshCellsParams extends GetCellsParams {
    force?: boolean;
}

export interface FlashCellsParams extends GetCellsParams {}

export interface GetCellRendererInstancesParams extends GetCellsParams {}

export interface GetCellEditorInstancesParams extends GetCellsParams {}

export interface RedrawRowsParams {
    rowNodes?: RowNode[];
}

export interface ChartRangeParams {
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
}

export interface DetailGridInfo {
    id: string;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
}

@Bean('gridApi')
export class GridApi {

    @Autowired('immutableService') private immutableService: ImmutableService;
    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Optional('excelCreator') private excelCreator: IExcelCreator;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('alignedGridsService') private alignedGridsService: AlignedGridsService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('context') private context: Context;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Optional('sideBarComp') private sideBarComp: ISideBar; // this can be removed
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('statusBarService') private statusBarService: IStatusBarService;
    @Optional('chartService') private chartService: IChartService;

    private gridPanel: GridPanel;
    private gridCore: GridCore;

    private headerRootComp: HeaderRootComp;
    private clientSideRowModel: ClientSideRowModel;
    private infinitePageRowModel: InfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: {[id: string]: DetailGridInfo} = {};

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }
    public registerGridCore(gridCore: GridCore): void {
        this.gridCore = gridCore;
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
    }

    @PostConstruct
    private init(): void {
        switch (this.rowModel.getType()) {
            case Constants.ROW_MODEL_TYPE_CLIENT_SIDE:
                this.clientSideRowModel = this.rowModel as ClientSideRowModel;
                break;
            case Constants.ROW_MODEL_TYPE_INFINITE:
                this.infinitePageRowModel = this.rowModel as InfiniteRowModel;
                break;
            case Constants.ROW_MODEL_TYPE_SERVER_SIDE:
                this.serverSideRowModel = this.rowModel as IServerSideRowModel;
                break;
        }
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getAlignedGridService(): AlignedGridsService {
        return this.alignedGridsService;
    }

    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    public removeDetailGridInfo(id: string): void {
        this.detailGridInfoMap[id] = undefined;
    }

    public getDetailGridInfo(id: string): DetailGridInfo {
        return this.detailGridInfoMap[id];
    }

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void) {
        let index = 0;
        _.iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo) => {
            // check for undefined, as old references will still be lying around
            if (_.exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        return this.csvCreator.getDataAsCsv(params);
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        this.csvCreator.exportDataAsCsv(params);
    }

    public getDataAsExcel(params?: ExcelExportParams): string {
        if (!this.excelCreator) { console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise'); }
        return this.excelCreator.getDataAsExcelXml(params);
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (!this.excelCreator) { console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise'); }
        this.excelCreator.exportDataAsExcel(params);
    }

    /** @deprecated */
    public setEnterpriseDatasource(datasource: IServerSideDatasource) {
        console.warn(`ag-grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource()`);
        this.setServerSideDatasource(datasource);
    }

    public setServerSideDatasource(datasource: IServerSideDatasource) {
        if (this.gridOptionsWrapper.isRowModelServerSide()) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            (this.rowModel as any).setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_SERVER_SIDE}'`);
        }
    }

    public setDatasource(datasource: IDatasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            (this.rowModel as InfiniteRowModel).setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_INFINITE}'`);
        }
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            (this.rowModel as any).setViewportDatasource(viewportDatasource);
        } else {
            console.warn(`ag-Grid: you can only use a viewport datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIEWPORT}'`);
        }
    }

    public setRowData(rowData: any[]) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            if (this.gridOptionsWrapper.isDeltaRowDataMode()) {
                const [transaction, orderIdMap] = this.immutableService.createTransactionForRowData(rowData);
                this.clientSideRowModel.updateRowData(transaction, orderIdMap);
                // need to force updating of full width rows - note this wouldn't be necessary the full width cell comp listened
                // to the data change event on the row node and refreshed itself.
                this.rowRenderer.refreshFullWidthRows();
            } else {
                this.selectionController.reset();
                this.clientSideRowModel.setRowData(rowData);
            }
        } else {
            console.warn('cannot call setRowData unless using normal row model');
        }
    }

    /** @deprecated */
    public setFloatingTopRowData(rows: any[]): void {
        console.warn('ag-Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    }

    /** @deprecated */
    public setFloatingBottomRowData(rows: any[]): void {
        console.warn('ag-Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    }

    /** @deprecated */
    public getFloatingTopRowCount(): number {
        console.warn('ag-Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    }

    /** @deprecated */
    public getFloatingBottomRowCount(): number {
        console.warn('ag-Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    }

    /** @deprecated */
    public getFloatingTopRow(index: number): RowNode {
        console.warn('ag-Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    }

    /** @deprecated */
    public getFloatingBottomRow(index: number): RowNode {
        console.warn('ag-Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
    }

    public setPinnedTopRowData(rows: any[]): void {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    }

    public setPinnedBottomRowData(rows: any[]): void {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }

    public getPinnedTopRow(index: number): RowNode {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }

    public getPinnedBottomRow(index: number): RowNode {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }

    public setColumnDefs(colDefs: (ColDef | ColGroupDef)[], source: ColumnEventType = "api") {
        this.columnController.setColumnDefs(colDefs, source);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    public getVerticalPixelRange(): {top: number, bottom: number} {
        return this.gridPanel.getVScrollPosition();
    }

    public getHorizontalPixelRange(): { left: number, right: number } {
        return this.gridPanel.getHScrollPosition();
    }

    public setAlwaysShowVerticalScroll(show: boolean) {
        this.gridOptionsWrapper.setProperty('alwaysShowVerticalScroll', show);
    }

    public refreshToolPanel(): void {
        this.gridCore.refreshSideBar();
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since ag-Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
    }

    public flashCells(params: FlashCellsParams = {}): void {
        this.rowRenderer.flashCells(params);
    }

    public redrawRows(params: RedrawRowsParams = {}): void {
        if (params && params.rowNodes) {
            this.rowRenderer.redrawRows(params.rowNodes);
        } else {
            this.rowRenderer.redrawAfterModelUpdate();
        }
    }

    public timeFullRedraw(count = 1) {

        let iterationCount = 0;
        let totalProcessing = 0;
        let totalReflow = 0;

        const that = this;

        doOneIteration();

        function doOneIteration(): void {
            const start = (new Date()).getTime();
            that.rowRenderer.redrawAfterModelUpdate();
            const endProcessing = (new Date()).getTime();
            window.setTimeout(() => {
                const endReflow = (new Date()).getTime();
                const durationProcessing = endProcessing - start;
                const durationReflow = endReflow - endProcessing;
                // tslint:disable-next-line
                console.log('duration:  processing = ' + durationProcessing + 'ms, reflow = ' + durationReflow + 'ms');

                iterationCount++;
                totalProcessing += durationProcessing;
                totalReflow += durationReflow;

                if (iterationCount < count) {
                    // wait for 1s between tests
                    window.setTimeout(doOneIteration, 1000);
                } else {
                    finish();
                }

            }, 0);
        }

        function finish(): void {
            // tslint:disable-next-line
            console.log('tests complete. iteration count = ' + iterationCount);
            // tslint:disable-next-line
            console.log('average processing = ' + (totalProcessing / iterationCount) + 'ms');
            // tslint:disable-next-line
            console.log('average reflow = ' + (totalReflow / iterationCount) + 'ms');
        }
    }

    /** @deprecated */
    public refreshView() {
        console.warn('ag-Grid: since v11.1, refreshView() is deprecated, please call refreshCells() or redrawRows() instead');
        this.redrawRows();
    }

    //** @deprecated */
    public refreshRows(rowNodes: RowNode[]): void {
        console.warn('since ag-Grid v11.1, refreshRows() is deprecated, please use refreshCells({rowNodes: rows}) or redrawRows({rowNodes: rows}) instead');
        this.refreshCells({rowNodes: rowNodes});
    }

    /** @deprecated */
    public rowDataChanged(rows:any) {
        console.warn('ag-Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node');
        this.redrawRows();
    }

    /** @deprecated */
    public softRefreshView() {
        console.error('ag-Grid: since v16, softRefreshView() is no longer supported. Please check the documentation on how to refresh.');
    }

    /** @deprecated */
    public refreshGroupRows() {
        console.warn('ag-Grid: since v11.1, refreshGroupRows() is no longer supported, call refreshCells() instead. ' +
            'Because refreshCells() now does dirty checking, it will only refresh cells that have changed, so it should ' +
            'not be necessary to only refresh the group rows.');
        this.refreshCells();
    }

    public setFunctionsReadOnly(readOnly: boolean) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    }

    public refreshHeader() {
        this.headerRootComp.refreshHeader();
        this.gridPanel.setHeaderAndFloatingHeights();
    }

    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    public isAdvancedFilterPresent(): boolean {
        console.warn('ag-Grid: isAdvancedFilterPresent() is deprecated, please use isColumnFilterPresent()');
        return this.isColumnFilterPresent();
    }

    public isColumnFilterPresent(): boolean {
        return this.filterManager.isAdvancedFilterPresent();
    }

    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    public getModel(): IRowModel {
        return this.rowModel;
    }

    public setRowNodeExpanded(rowNode: RowNode, expanded: boolean): void {
        if (rowNode) {
            rowNode.setExpanded(expanded);
        }
    }

    public onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any) {
        if (_.missing(this.clientSideRowModel)) { console.warn('ag-Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model'); }
        if (_.exists(deprecated_refreshFromIndex)) { console.warn('ag-Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is no longer used, the grid will refresh all rows'); }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel.refreshModel({step: Constants.STEP_MAP});
    }

    public refreshInMemoryRowModel(step?: string): any {
        console.warn(`ag-grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel()`);
        this.refreshClientSideRowModel(step);
    }

    public refreshClientSideRowModel(step?: string): any {
        if (_.missing(this.clientSideRowModel)) { console.warn('cannot call refreshClientSideRowModel unless using normal row model'); }

        let paramsStep = Constants.STEP_EVERYTHING;
        const stepsMapped: any = {
            group: Constants.STEP_EVERYTHING,
            filter: Constants.STEP_FILTER,
            map: Constants.STEP_MAP,
            aggregate: Constants.STEP_AGGREGATE,
            sort: Constants.STEP_SORT,
            pivot: Constants.STEP_PIVOT
        };

        if (_.exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (_.missing(paramsStep)) {
            console.error(`ag-Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}`);
            return;
        }

        const modelParams: RefreshModelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        };

        this.clientSideRowModel.refreshModel(modelParams);
    }

    public isAnimationFrameQueueEmpty(): boolean {
        return this.animationFrameService.isQueueEmpty();
    }

    public getRowNode(id: string): RowNode {
        return this.rowModel.getRowNode(id);
    }

    public expandAll() {
        if (_.missing(this.clientSideRowModel)) {
            console.warn('ag-Grid: cannot call expandAll unless using normal row model');
            return;
        }
        this.clientSideRowModel.expandOrCollapseAll(true);
    }

    public collapseAll() {
        if (_.missing(this.clientSideRowModel)) {
            console.warn('ag-Grid: cannot call collapseAll unless using normal row model');
            return;
        }
        this.clientSideRowModel.expandOrCollapseAll(false);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.warn('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (eventName === 'virtualRowSelected') {
            console.warn(`ag-Grid: event virtualRowSelected is deprecated, to register for individual row
                selection events, add a listener directly to the row node.`);
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter:any): void {
        this.filterManager.setQuickFilter(newFilter);
    }

    public selectIndex(index:any, tryMulti:any, suppressEvents:any) {
        console.warn('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.selectIndex(index, tryMulti);
    }

    public deselectIndex(index: number, suppressEvents: boolean = false) {
        console.warn('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.deselectIndex(index);
    }

    public selectNode(node: RowNode, tryMulti: boolean = false, suppressEvents: boolean = false) {
        console.warn('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({newValue: true, clearSelection: !tryMulti});
    }

    public deselectNode(node: RowNode, suppressEvents: boolean = false) {
        console.warn('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({newValue: false});
    }

    public selectAll() {
        this.selectionController.selectAllRowNodes();
    }

    public deselectAll() {
        this.selectionController.deselectAllRowNodes();
    }

    public selectAllFiltered() {
        this.selectionController.selectAllRowNodes(true);
    }

    public deselectAllFiltered() {
        this.selectionController.deselectAllRowNodes(true);
    }

    public recomputeAggregates(): void {
        if (_.missing(this.clientSideRowModel)) { console.warn('cannot call recomputeAggregates unless using normal row model'); }
        console.warn(`recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead`);
        this.clientSideRowModel.refreshModel({step: Constants.STEP_AGGREGATE});
    }

    public sizeColumnsToFit() {
        this.gridPanel.sizeColumnsToFit();
    }

    public showLoadingOverlay(): void {
        this.gridPanel.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.gridPanel.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.gridPanel.hideOverlay();
    }

    public isNodeSelected(node:any) {
        console.warn('ag-Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    }

    public getSelectedNodesById(): {[nodeId: number]: RowNode; } {
        console.error('ag-Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
        return null;
    }

    public getSelectedNodes(): RowNode[] {
        return this.selectionController.getSelectedNodes();
    }

    public getSelectedRows(): any[] {
        return this.selectionController.getSelectedRows();
    }

    public getBestCostNodeSelection() {
        return this.selectionController.getBestCostNodeSelection();
    }

    public getRenderedNodes() {
        return this.rowRenderer.getRenderedNodes();
    }

    public ensureColIndexVisible(index:any) {
        console.warn('ag-Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    }

    public ensureColumnVisible(key: string | Column) {
        this.gridPanel.ensureColumnVisible(key);
    }

    // Valid values for position are bottom, middle and top
    public ensureIndexVisible(index:any, position?:string) {
        this.gridPanel.ensureIndexVisible(index, position);
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible(comparator:any, position?:string) {
        this.gridCore.ensureNodeVisible(comparator, position);
    }

    public forEachLeafNode(callback: (rowNode: RowNode) => void) {
        if (_.missing(this.clientSideRowModel)) { console.warn('cannot call forEachNode unless using normal row model'); }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void) {
        this.rowModel.forEachNode(callback);
    }

    public forEachNodeAfterFilter(callback: (rowNode: RowNode, index: number) => void) {
        if (_.missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilter unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void) {
        if (_.missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilterAndSort unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    public getFilterApiForColDef(colDef: any): any {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterInstance(colDef);
    }

    public getFilterInstance(key: string | Column): IFilterComp {
        const column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.getFilterComponent(column, 'NO_UI').resolveNow<IFilterComp>(null, filterComp => filterComp);
        }
    }

    public getFilterApi(key: string | Column) {
        console.warn('ag-Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    }

    public destroyFilter(key: string | Column) {
        const column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    }

    public getStatusPanel(key: string) : IStatusPanelComp {
        if (this.statusBarService) {
            return this.statusBarService.getStatusPanel(key);
        }
    }

    public getColumnDef(key: string | Column) {
        const column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        } else {
            return null;
        }
    }

    public onFilterChanged() {
        this.filterManager.onFilterChanged();
    }

    public onSortChanged() {
        this.sortController.onSortChanged();
    }

    public setSortModel(sortModel:any, source: ColumnEventType = "api") {
        this.sortController.setSortModel(sortModel, source);
    }

    public getSortModel() {
        return this.sortController.getSortModel();
    }

    public setFilterModel(model:any) {
        this.filterManager.setFilterModel(model);
    }

    public getFilterModel() {
        return this.filterManager.getFilterModel();
    }

    public getFocusedCell(): CellPosition {
        return this.focusedCellController.getFocusedCell();
    }

    public clearFocusedCell(): void {
        return this.focusedCellController.clearFocusedCell();
    }

    public setFocusedCell(rowIndex: number, colKey: string | Column, floating?: string) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    }

    public setSuppressRowDrag(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    }

    public setGridAutoHeight(gridAutoHeight: boolean) {
        console.warn('api.setGridAutoHeight(boolean) is deprecated, please use api.setDomLayout() instead');
        this.setDomLayout(gridAutoHeight ? 'autoHeight' : 'normal');
    }

    public setDomLayout(domLayout: string) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOM_LAYOUT, domLayout);
    }

    public setEnableCellTextSelection(selectable: boolean) {
        this.gridPanel.setCellTextSelection(selectable);
    }

    public setGroupHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    }

    public setFloatingFiltersHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
        this.doLayout();
    }

    public setPivotGroupHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    }

    public setPivotHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    }

    public isSideBarVisible() {
        return this.gridCore.isSideBarVisible();
    }

    public setSideBarVisible(show:boolean) {
        this.gridCore.setSideBarVisible(show);
    }

    public showToolPanel(show:boolean) {
        console.warn(`ag-grid: from v19 api.showToolPanel has been deprecated in favour of api.setSideBarVisible`);
        this.setSideBarVisible(show);
    }

    public openToolPanel(key: string) {
        this.gridCore.openToolPanel(key);
    }

    public closeToolPanel() {
        this.gridCore.closeToolPanel();
    }

    public getOpenedToolPanel(): string {
        return this.gridCore.getOpenedToolPanel();
    }

    public getSideBar(): SideBarDef {
        return this.gridCore.getSideBar();
    }

    public setSideBar(def: SideBarDef): void {
        return this.gridCore.setSideBar(def);
    }

    public setSuppressClipboardPaste(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE, value);
    }

    public isToolPanelShowing() {
        return this.gridCore.isToolPanelShowing();
    }

    public doLayout() {
        this.gridPanel.checkViewportAndScrolls();
    }

    public resetRowHeights() {
        if (_.exists(this.clientSideRowModel)) {
            this.clientSideRowModel.resetRowHeights();
        }
    }

    public setGroupRemoveSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    }

    public setGroupRemoveLowestSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    }

    public onRowHeightChanged() {
        if (_.exists(this.clientSideRowModel)) {
            this.clientSideRowModel.onRowHeightChanged();
        }
    }

    public getValue(colKey: string | Column, rowNode: RowNode): any {
        let column = this.columnController.getPrimaryColumn(colKey);
        if (_.missing(column)) {
            column = this.columnController.getGridColumn(colKey);
        }
        if (_.missing(column)) {
            return null;
        } else {
            return this.valueService.getValue(column, rowNode);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }

    public removeGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        // destroy the UI first (as they use the services)
        this.gridCore.destroy();
        // destroy the services
        this.context.destroy();
    }

    public resetQuickFilter(): void {
        this.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
    }

    public getRangeSelections(): any {
        console.warn(`ag-Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead.
        We had to change how cell selections works a small bit to allow charting to integrate. The return type of
        getCellRanges() is a bit different, please check the ag-Grid documentation.`);
        return null;
    }

    public getCellRanges(): CellRange[] {
        if (this.rangeController) {
            return this.rangeController.getCellRanges();
        } else {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
            return null;
        }
    }

    public camelCaseToHumanReadable(camelCase:string):string {
        return _.camelCaseToHumanText(camelCase);
    }

    public addRangeSelection(deprecatedNoLongerUsed: any): void {
        console.warn('ag-Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection()');
    }

    public addCellRange(params: CellRangeParams): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.addCellRange(params);
    }

    public clearRangeSelection(): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.removeAllCellRanges();
    }

    public chartRange(params: ChartRangeParams): ChartRef | undefined {
        if (!this.context.isModuleRegistered(ModuleNames.ChartsModule)) {
            _.doOnce(() => {
                console.warn('ag-grid: Cannot chart range - the Charts Module has not been included.');
            }, 'ChartsModuleCheck');
            return;
        }
        return this.chartService.chartCellRange(params);
    }

    public copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string | Column)[]): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copySelectedRowsToClipboard(includeHeader, columnKeys);
    }

    public copySelectedRangeToClipboard(includeHeader: boolean): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copySelectedRangeToClipboard(includeHeader);
    }

    public copySelectedRangeDown(): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copyRangeDown();
    }

    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        // use grid column so works with pivot mode
        const column = this.columnController.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    }

    public showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void {
        // use grid column so works with pivot mode
        const column = this.columnController.getGridColumn(colKey);
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    }

    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    }

    public setPopupParent(ePopupParent: HTMLElement): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POPUP_PARENT, ePopupParent);
    }

    public tabToNextCell(): boolean {
        return this.rowRenderer.tabToNextCell(false);
    }

    public tabToPreviousCell(): boolean {
        return this.rowRenderer.tabToNextCell(true);
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams = {}): ICellRendererComp[] {
        return this.rowRenderer.getCellRendererInstances(params);
    }

    public getCellEditorInstances(params: GetCellEditorInstancesParams = {}): ICellEditorComp[] {
        return this.rowRenderer.getCellEditorInstances(params);
    }

    public getEditingCells(): CellPosition[] {
        return this.rowRenderer.getEditingCells();
    }

    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    public startEditingCell(params: StartEditingCellParams): void {
        const column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`ag-Grid: no column found for ${params.colKey}`);
            return;
        }
        const cellPosition: CellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned,
            column: column
        };
        const notPinned = _.missing(params.rowPinned);
        if (notPinned) {
            this.gridPanel.ensureIndexVisible(params.rowIndex);
        }
        this.rowRenderer.startEditingCell(cellPosition, params.keyPress, params.charPress);
    }

    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    }

    public addAggFuncs(aggFuncs: {[key: string]: IAggFunc}): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    }

    public clearAggFuncs(): void {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    }

    public updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction {
        let res: RowNodeTransaction = null;
        if (this.clientSideRowModel) {
            res = this.clientSideRowModel.updateRowData(rowDataTransaction);
        } else if (this.infinitePageRowModel) {
            this.infinitePageRowModel.updateRowData(rowDataTransaction);
        } else {
            console.error('ag-Grid: updateRowData() only works with ClientSideRowModel and InfiniteRowModel.');
        }

        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows();

        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }

        return res;
    }

    public batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        if (!this.clientSideRowModel) {
            console.error('ag-Grid: api.batchUpdateRowData() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh = false): void {
        console.warn('ag-Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({add: items, addIndex: index, update: null, remove: null});
    }

    public removeItems(rowNodes: RowNode[], skipRefresh = false): void {
        console.warn('ag-Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        const dataToRemove: any[] = rowNodes.map(rowNode => rowNode.data);
        this.updateRowData({add: null, addIndex: null, update: null, remove: dataToRemove});
    }

    public addItems(items: any[], skipRefresh = false): void {
        console.warn('ag-Grid: addItems() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({add: items, addIndex: null, update: null, remove: null});
    }

    public refreshVirtualPageCache(): void {
        console.warn('ag-Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    }

    public refreshInfinitePageCache(): void {
        console.warn('ag-Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    }

    public refreshInfiniteCache(): void {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.refreshCache();
        } else {
            console.warn(`ag-Grid: api.refreshInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }

    public purgeVirtualPageCache(): void {
        console.warn('ag-Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfinitePageCache();
    }

    public purgeInfinitePageCache(): void {
        console.warn('ag-Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfiniteCache();
    }

    public purgeInfiniteCache(): void {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.purgeCache();
        } else {
            console.warn(`ag-Grid: api.purgeInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }

    /** @deprecated */
    public purgeEnterpriseCache(route?: string[]): void {
        console.warn(`ag-grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.purgeServerSideCache()`);
        this.purgeServerSideCache(route);
    }

    public purgeServerSideCache(route?: string[]): void {
        if (this.serverSideRowModel) {
            this.serverSideRowModel.purgeCache(route);
        } else {
            console.warn(`ag-Grid: api.purgeServerSideCache is only available when rowModelType='enterprise'.`);
        }
    }

    public getVirtualRowCount(): number {
        console.warn('ag-Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    }

    public getInfiniteRowCount(): number {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getVirtualRowCount();
        } else {
            console.warn(`ag-Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.`);
        }
    }

    public isMaxRowFound(): boolean {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.isMaxRowFound();
        } else {
            console.warn(`ag-Grid: api.isMaxRowFound is only available when rowModelType='virtual'.`);
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        console.warn('ag-Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setInfiniteRowCount(rowCount, maxRowFound);
    }

    public setInfiniteRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.setVirtualRowCount(rowCount, maxRowFound);
        } else {
            console.warn(`ag-Grid: api.setVirtualRowCount is only available when rowModelType='virtual'.`);
        }
    }

    public getVirtualPageState(): any {
        console.warn('ag-Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }

    public getInfinitePageState(): any {
        console.warn('ag-Grid: getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }

    public getCacheBlockState(): any {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getBlockState();
        } else if (this.serverSideRowModel) {
            return this.serverSideRowModel.getBlockState();
        } else {
            console.warn(`ag-Grid: api.getCacheBlockState() is only available when rowModelType='infinite' or rowModelType='serverSide'.`);
        }
    }

    public checkGridSize(): void {
        this.gridPanel.setHeaderAndFloatingHeights();
    }

    public getFirstRenderedRow(): number {
        console.warn('in ag-Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    }

    public getFirstDisplayedRow(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastRenderedRow(): number {
        console.warn('in ag-Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
    }

    public getLastDisplayedRow(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    public getDisplayedRowAtIndex(index: number): RowNode {
        return this.rowModel.getRow(index);
    }

    public getDisplayedRowCount(): number {
        return this.rowModel.getRowCount();
    }

    public paginationIsLastPageFound(): boolean {
        return this.paginationProxy.isLastPageFound();
    }

    public paginationGetPageSize(): number {
        return this.paginationProxy.getPageSize();
    }

    public paginationSetPageSize(size: number): void {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    }

    public paginationGetCurrentPage(): number {
        return this.paginationProxy.getCurrentPage();
    }

    public paginationGetTotalPages(): number {
        return this.paginationProxy.getTotalPages();
    }

    public paginationGetRowCount(): number {
        return this.paginationProxy.getMasterRowCount();
    }

    public paginationGoToNextPage(): void {
        this.paginationProxy.goToNextPage();
    }

    public paginationGoToPreviousPage(): void {
        this.paginationProxy.goToPreviousPage();
    }

    public paginationGoToFirstPage(): void {
        this.paginationProxy.goToFirstPage();
    }

    public paginationGoToLastPage(): void {
        this.paginationProxy.goToLastPage();
    }

    public paginationGoToPage(page: number): void {
        this.paginationProxy.goToPage(page);
    }
}
