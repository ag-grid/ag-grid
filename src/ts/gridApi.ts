import {CsvCreator} from "./csvCreator";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ColumnController} from "./columnController/columnController";
import {ColumnApi} from "./columnController/columnApi";
import {SelectionController} from "./selectionController";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {GridPanel} from "./gridPanel/gridPanel";
import {ValueService} from "./valueService/valueService";
import {EventService} from "./eventService";
import {ColDef, ColGroupDef, IAggFunc} from "./entities/colDef";
import {RowNode} from "./entities/rowNode";
import {Constants} from "./constants";
import {Column} from "./entities/column";
import {Autowired, Bean, Context, Optional, PostConstruct} from "./context/context";
import {GridCore} from "./gridCore";
import {IRowModel} from "./interfaces/iRowModel";
import {SortController} from "./sortController";
import {FocusedCellController} from "./focusedCellController";
import {AddRangeSelectionParams, IRangeController, RangeSelection} from "./interfaces/iRangeController";
import {GridCell, GridCellDef} from "./entities/gridCell";
import {IClipboardService} from "./interfaces/iClipboardService";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {IMenuFactory} from "./interfaces/iMenuFactory";
import {InfiniteRowModel} from "./rowModels/infinite/infiniteRowModel";
import {CellRendererFactory} from "./rendering/cellRendererFactory";
import {CellEditorFactory} from "./rendering/cellEditorFactory";
import {IAggFuncService} from "./interfaces/iAggFuncService";
import {IFilterComp} from "./interfaces/iFilter";
import {CsvExportParams} from "./exportParams";
import {ExcelExportParams, IExcelCreator} from "./interfaces/iExcelCreator";
import {IDatasource} from "./rowModels/iDatasource";
import {IEnterpriseDatasource} from "./interfaces/iEnterpriseDatasource";
import {PaginationProxy} from "./rowModels/paginationProxy";
import {IEnterpriseRowModel} from "./interfaces/iEnterpriseRowModel";
import {
    InMemoryRowModel, RefreshModelParams, RowDataTransaction,
    RowNodeTransaction
} from "./rowModels/inMemory/inMemoryRowModel";
import {ImmutableService} from "./rowModels/inMemory/immutableService";
import {ValueCache} from "./valueService/valueCache";
import {AlignedGridsService} from "./alignedGridsService";
import {PinnedRowModel} from "./rowModels/pinnedRowModel";
import {AgEvent, ColumnEventType} from "./events";
import {IToolPanel} from "./interfaces/iToolPanel";
import {GridOptions} from "./entities/gridOptions";
import {IContextMenuFactory} from "./interfaces/iContextMenuFactory";

export interface StartEditingCellParams {
    rowIndex: number;
    colKey: string|Column;
    rowPinned?: string;
    keyPress?: number;
    charPress?: string;
}

export interface RefreshCellsParams {
    rowNodes?: RowNode[];
    columns?: (string|Column)[];
    force?: boolean;
}

export interface RedrawRowsParams {
    rowNodes?: RowNode[];
}

export interface DetailGridInfo {
    id: string;
    api: GridApi;
    columnApi: ColumnApi;
}

@Bean('gridApi')
export class GridApi {

    @Autowired('immutableService') private immutableService: ImmutableService;
    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Optional('excelCreator') private excelCreator: IExcelCreator;
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('headerRenderer') private headerRenderer: HeaderRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridPanel') private gridPanel: GridPanel;
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
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Optional('toolPanel') private toolPanel: IToolPanel;

    private inMemoryRowModel: InMemoryRowModel;
    private infinitePageRowModel: InfiniteRowModel;
    private enterpriseRowModel: IEnterpriseRowModel;

    private detailGridInfoMap: {[id: string]: DetailGridInfo} = {};

    @PostConstruct
    private init(): void {
        switch (this.rowModel.getType()) {
            case Constants.ROW_MODEL_TYPE_IN_MEMORY:
                this.inMemoryRowModel = <InMemoryRowModel> this.rowModel;
                break;
            case Constants.ROW_MODEL_TYPE_INFINITE:
                this.infinitePageRowModel = <InfiniteRowModel> this.rowModel;
                break;
            case Constants.ROW_MODEL_TYPE_ENTERPRISE:
                this.enterpriseRowModel = <IEnterpriseRowModel> this.rowModel;
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

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number)=>void) {
        let index = 0;
        _.iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo)=> {
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
        this.csvCreator.exportDataAsCsv(params)
    }

    public getDataAsExcel(params?: ExcelExportParams): string {
        if (!this.excelCreator) { console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise'); }
        return this.excelCreator.getDataAsExcelXml(params);
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (!this.excelCreator) { console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise'); }
        this.excelCreator.exportDataAsExcel(params)
    }

    public setEnterpriseDatasource(datasource: IEnterpriseDatasource) {
        if (this.gridOptionsWrapper.isRowModelEnterprise()) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            (<any>this.rowModel).setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_ENTERPRISE}'`)
        }
    }

    public setDatasource(datasource: IDatasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            (<InfiniteRowModel>this.rowModel).setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_INFINITE}'`)
        }
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            (<any>this.rowModel).setViewportDatasource(viewportDatasource);
        } else {
            console.warn(`ag-Grid: you can only use a viewport datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIEWPORT}'`)
        }
    }

    public setRowData(rowData: any[]) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            if (this.gridOptionsWrapper.isDeltaRowDataMode()) {
                let [transaction, orderIdMap] = this.immutableService.createTransactionForRowData(rowData);
                this.inMemoryRowModel.updateRowData(transaction, orderIdMap);
            } else {
                this.selectionController.reset();
                this.inMemoryRowModel.setRowData(rowData);
            }
        } else {
            console.log('cannot call setRowData unless using normal row model');
        }
    }

    // DEPRECATED
    public setFloatingTopRowData(rows: any[]): void {
        console.warn('ag-Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    }

    // DEPRECATED
    public setFloatingBottomRowData(rows: any[]): void {
        console.warn('ag-Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    }

    // DEPRECATED
    public getFloatingTopRowCount(): number {
        console.warn('ag-Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    }

    // DEPRECATED
    public getFloatingBottomRowCount(): number {
        console.warn('ag-Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    }

    // DEPRECATED
    public getFloatingTopRow(index: number): RowNode {
        console.warn('ag-Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    }

    // DEPRECATED
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

    public setColumnDefs(colDefs: (ColDef|ColGroupDef)[], source: ColumnEventType = "api") {
        this.columnController.setColumnDefs(colDefs, source);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    public getVerticalPixelRange(): any {
        return this.gridPanel.getVerticalPixelRange();
    }

    public refreshToolPanel(): void {
        if (this.toolPanel) {
            this.toolPanel.refresh();
        }
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since ag-Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
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

        let that = this;

        doOneIteration();

        function doOneIteration(): void {
            let start = (new Date()).getTime();
            that.rowRenderer.redrawAfterModelUpdate();
            let endProcessing = (new Date()).getTime();
            setTimeout( ()=> {
                let endReflow = (new Date()).getTime();
                let durationProcessing = endProcessing - start;
                let durationReflow = endReflow - endProcessing;
                console.log('duration:  processing = ' + durationProcessing + 'ms, reflow = ' + durationReflow + 'ms');

                iterationCount++;
                totalProcessing += durationProcessing;
                totalReflow += durationReflow;

                if (iterationCount < count) {
                    // wait for 1s between tests
                    setTimeout(doOneIteration, 1000);
                } else {
                    finish();
                }

            }, 0);
        }

        function finish(): void {
            console.log('tests complete. iteration count = ' + iterationCount);
            console.log('average processing = ' + (totalProcessing/iterationCount) + 'ms');
            console.log('average reflow = ' + (totalReflow/iterationCount) + 'ms');
        }
    }

    // *** deprecated
    public refreshView() {
        console.warn('ag-Grid: since v11.1, refreshView() is deprecated, please call refreshCells() or redrawRows() instead');
        this.redrawRows();
    }

    // *** deprecated
    public refreshRows(rowNodes: RowNode[]): void {
        console.warn('since ag-Grid v11.1, refreshRows() is deprecated, please use refreshCells({rowNodes: rows}) or redrawRows({rowNodes: rows}) instead');
        this.refreshCells({rowNodes: rowNodes});
    }

    // *** deprecated
    public rowDataChanged(rows:any) {
        console.log('ag-Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node')
        this.redrawRows();
    }

    // *** deprecated
    public softRefreshView() {
        console.error('ag-Grid: since v16, softRefreshView() is no longer supported. Please check the documentation on how to refresh.');
    }

    // *** deprecated
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
        this.headerRenderer.refreshHeader();
        this.gridPanel.setBodyAndHeaderHeights();
    }

    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    public isAdvancedFilterPresent(): boolean {
        return this.filterManager.isAdvancedFilterPresent();
    }

    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    public getModel(): IRowModel {
        return this.rowModel;
    }

    public onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any) {
        if (_.missing(this.inMemoryRowModel)) { console.log('ag-Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model') }
        if (_.exists(deprecated_refreshFromIndex)) { console.log('ag-Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is no longer used, the grid will refresh all rows'); }
        // we don't really want the user calling this if one one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.inMemoryRowModel.refreshModel({step: Constants.STEP_MAP});
    }

    public refreshInMemoryRowModel(step?: string): any {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call refreshInMemoryRowModel unless using normal row model') }

        let paramsStep = Constants.STEP_EVERYTHING;
        let stepsMapped: any = {
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

        let modelParams: RefreshModelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        };

        this.inMemoryRowModel.refreshModel(modelParams);
    }

    public getRowNode(id: string): RowNode {
        if (_.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call getRowNode unless using normal row model');
            return;
        }
        return this.inMemoryRowModel.getRowNode(id);
    }

    public expandAll() {
        if (_.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call expandAll unless using normal row model');
            return;
        }
        this.inMemoryRowModel.expandOrCollapseAll(true);
    }

    public collapseAll() {
        if (_.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call collapseAll unless using normal row model');
            return;
        }
        this.inMemoryRowModel.expandOrCollapseAll(false);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (eventName==='virtualRowSelected') {
            console.log('ag-Grid: event virtualRowSelected is deprecated, to register for individual row ' +
                'selection events, add a listener directly to the row node.');
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter:any): void {
        this.filterManager.setQuickFilter(newFilter)
    }

    public selectIndex(index:any, tryMulti:any, suppressEvents:any) {
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.selectIndex(index, tryMulti);
    }

    public deselectIndex(index: number, suppressEvents: boolean = false) {
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.deselectIndex(index);
    }

    public selectNode(node: RowNode, tryMulti: boolean = false, suppressEvents: boolean = false) {
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({newValue: true, clearSelection: !tryMulti});
    }

    public deselectNode(node: RowNode, suppressEvents: boolean = false) {
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
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
        if (_.missing(this.inMemoryRowModel)) { console.warn('cannot call recomputeAggregates unless using normal row model') }
        console.warn(`recomputeAggregates is deprecated, please call api.refreshInMemoryRowModel('aggregate') instead`);
        this.inMemoryRowModel.refreshModel({step: Constants.STEP_AGGREGATE});
    }

    public sizeColumnsToFit() {
        if (this.gridOptionsWrapper.isForPrint()) {
            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
            return;
        }
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
        console.log('ag-Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    }

    public getSelectedNodesById(): {[nodeId: number]: RowNode;} {
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

    public ensureColumnVisible(key: string|Column) {
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

    public forEachLeafNode(callback: (rowNode: RowNode)=>void ) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call forEachNode unless using normal row model') }
        this.inMemoryRowModel.forEachLeafNode(callback);
    }

    public forEachNode(callback: (rowNode: RowNode)=>void ) {
        this.rowModel.forEachNode(callback);
    }

    public forEachNodeAfterFilter(callback: (rowNode: RowNode)=>void) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call forEachNodeAfterFilter unless using normal row model') }
        this.inMemoryRowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=>void) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call forEachNodeAfterFilterAndSort unless using normal row model') }
        this.inMemoryRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    public getFilterApiForColDef(colDef: any): any {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterInstance(colDef);
    }

    public getFilterInstance(key: string|Column): IFilterComp {
        let column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.getFilterComponent(column).resolveNow<IFilterComp>(null, filterComp=>filterComp);
        }
    }

    public getFilterApi(key: string|Column) {
        console.warn('ag-Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    }

    public destroyFilter(key: string|Column) {
        let column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    }

    public getColumnDef(key: string|Column) {
        let column = this.columnController.getPrimaryColumn(key);
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

    public getFocusedCell(): GridCell {
        return this.focusedCellController.getFocusedCell();
    }

    public clearFocusedCell(): void {
        return this.focusedCellController.clearFocusedCell();
    }

    public setFocusedCell(rowIndex: number, colKey: string|Column, floating?: string) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    }

    public setSuppressRowDrag(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
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

    public showToolPanel(show:any) {
        this.gridCore.showToolPanel(show);
    }

    public isToolPanelShowing() {
        return this.gridCore.isToolPanelShowing();
    }

    public doLayout() {
        this.gridCore.doLayout();
        // if the column is not visible, then made visible, it will be right size, but the
        // correct virtual columns will not be displayed. the setLeftAndRightBounds() gets
        // called when size changes. however when size is not changed, then wrong cols are shown.
        // this was to fix https://ag-grid.atlassian.net/browse/AG-1081
        this.gridPanel.setLeftAndRightBounds();
    }

    public resetRowHeights() {
        if (_.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.resetRowHeights();
        }
    }

    public setGroupRemoveSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    }

    public setGroupRemoveLowestSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    }

    public onRowHeightChanged() {
        if (_.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.onRowHeightChanged();
        }
    }

    public getValue(colKey: string|Column, rowNode: RowNode): any {
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
        let async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: Function): void {
        let async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        let async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }

    public removeGlobalListener(listener: Function): void {
        let async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        this.context.destroy();
    }

    public resetQuickFilter(): void {
        this.rowModel.forEachNode( node => node.quickFilterAggregateText = null);
    }

    public getRangeSelections(): RangeSelection[] {
        if (this.rangeController) {
            return this.rangeController.getCellRanges();
        } else {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
            return null;
        }
    }

    public camelCaseToHumanReadable (camelCase:string):string{
        return _.camelCaseToHumanText(camelCase);
    }

    public addRangeSelection(rangeSelection: AddRangeSelectionParams): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.addRange(rangeSelection);
    }

    public clearRangeSelection(): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.clearSelection();
    }

    public copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string|Column)[]): void {
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

    public showColumnMenuAfterButtonClick(colKey: string|Column, buttonElement: HTMLElement): void {
        let column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    }

    public showColumnMenuAfterMouseClick(colKey: string|Column, mouseEvent: MouseEvent|Touch): void {
        let column = this.columnController.getPrimaryColumn(colKey);
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

    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    public startEditingCell(params: StartEditingCellParams): void {
        let column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`ag-Grid: no column found for ${params.colKey}`);
            return;
        }
        let gridCellDef = <GridCellDef> {
            rowIndex: params.rowIndex,
            floating: params.rowPinned,
            column: column
        };
        let gridCell = new GridCell(gridCellDef);
        let notPinned = _.missing(params.rowPinned);
        if (notPinned) {
            this.gridPanel.ensureIndexVisible(params.rowIndex);
        }
        this.rowRenderer.startEditingCell(gridCell, params.keyPress, params.charPress);
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
        if (this.inMemoryRowModel) {
            res = this.inMemoryRowModel.updateRowData(rowDataTransaction);
        } else if (this.infinitePageRowModel) {
            this.infinitePageRowModel.updateRowData(rowDataTransaction);
        } else {
            console.error('ag-Grid: updateRowData() only works with InMemoryRowModel and InfiniteRowModel.');
        }

        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }

        return res;
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh = false): void {
        console.warn('ag-Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({add: items, addIndex: index, update: null, remove: null});
    }

    public removeItems(rowNodes: RowNode[], skipRefresh = false): void {
        console.warn('ag-Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        let dataToRemove: any[] = rowNodes.map(rowNode => rowNode.data);
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

    public purgeEnterpriseCache(route?: string[]): void {
        if (this.enterpriseRowModel) {
            this.enterpriseRowModel.purgeCache(route);
        } else {
            console.warn(`ag-Grid: api.purgeEnterpriseCache is only available when rowModelType='enterprise'.`);
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
        } else if (this.enterpriseRowModel) {
            return this.enterpriseRowModel.getBlockState();
        } else {
            console.warn(`ag-Grid: api.getCacheBlockState() is only available when rowModelType='infinite' or rowModelType='enterprise'.`);
        }
    }

    public checkGridSize(): void {
        this.gridPanel.setBodyAndHeaderHeights();
    }

    public getFirstRenderedRow(): number {
        console.log('in ag-Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    }

    public getFirstDisplayedRow(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastRenderedRow(): number {
        console.log('in ag-Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
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
        return this.paginationProxy.getTotalRowCount();
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

    /*
    Taking these out, as we want to reconsider how we register components
    
    public addCellRenderer(key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc): void {
        this.cellRendererFactory.addCellRenderer(key, cellRenderer);
    }
    
    public addCellEditor(key: string, cellEditor: {new(): ICellEditor}): void {
        this.cellEditorFactory.addCellEditor(key, cellEditor);
    }*/

}
