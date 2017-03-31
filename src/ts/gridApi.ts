import {CsvCreator} from "./csvCreator";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ColumnController} from "./columnController/columnController";
import {SelectionController} from "./selectionController";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {GridPanel} from "./gridPanel/gridPanel";
import {ValueService} from "./valueService";
import {MasterSlaveService} from "./masterSlaveService";
import {EventService} from "./eventService";
import {FloatingRowModel} from "./rowModels/floatingRowModel";
import {ColDef, IAggFunc, ColGroupDef} from "./entities/colDef";
import {RowNode} from "./entities/rowNode";
import {Constants} from "./constants";
import {Column} from "./entities/column";
import {Bean, PostConstruct, Context, Autowired, Optional} from "./context/context";
import {GridCore} from "./gridCore";
import {IRowModel} from "./interfaces/iRowModel";
import {SortController} from "./sortController";
import {FocusedCellController} from "./focusedCellController";
import {IRangeController, RangeSelection, AddRangeSelectionParams} from "./interfaces/iRangeController";
import {GridCell, GridCellDef} from "./entities/gridCell";
import {IClipboardService} from "./interfaces/iClipboardService";
import {IInMemoryRowModel} from "./interfaces/iInMemoryRowModel";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {IMenuFactory} from "./interfaces/iMenuFactory";
import {InfiniteRowModel} from "./rowModels/infinite/infiniteRowModel";
import {CellRendererFactory} from "./rendering/cellRendererFactory";
import {CellEditorFactory} from "./rendering/cellEditorFactory";
import {IAggFuncService} from "./interfaces/iAggFuncService";
import {IFilter, IFilterComp} from "./interfaces/iFilter";
import {CsvExportParams} from "./exportParams";
import {IExcelCreator} from "./interfaces/iExcelCreator";
import {ServerPaginationService, IPaginationService} from "./rowModels/pagination/serverPaginationService";
import {IDatasource} from "./rowModels/iDatasource";
import {IEnterpriseDatasource} from "./interfaces/iEnterpriseDatasource";
import {PaginationProxy} from "./rowModels/paginationProxy";


export interface StartEditingCellParams {
    rowIndex: number;
    colKey: string|Column|ColDef;
    keyPress?: number;
    charPress?: string;
}

@Bean('gridApi')
export class GridApi {

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
    @Autowired('masterSlaveService') private masterSlaveService: MasterSlaveService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('context') private context: Context;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('serverPaginationService') private serverPaginationService: ServerPaginationService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;

    private inMemoryRowModel: IInMemoryRowModel;
    private infinitePageRowModel: InfiniteRowModel;
    private paginationService: IPaginationService;

    @PostConstruct
    private init(): void {
        switch (this.rowModel.getType()) {
            case Constants.ROW_MODEL_TYPE_NORMAL:
            case Constants.ROW_MODEL_TYPE_PAGINATION:
                this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
                break;
            case Constants.ROW_MODEL_TYPE_INFINITE:
            case Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED:
                this.infinitePageRowModel = <InfiniteRowModel> this.rowModel;
                break;
        }

        if (this.gridOptionsWrapper.isPagination()) {
            this.paginationService = this.paginationProxy;
        } else {
            this.paginationService = this.serverPaginationService;
        }
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getMasterSlaveService(): MasterSlaveService {
        return this.masterSlaveService;
    }

    public getFirstRenderedRow(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastRenderedRow(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        return this.csvCreator.getDataAsCsv(params);
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        this.csvCreator.exportDataAsCsv(params)
    }

    public getDataAsExcel(params?: CsvExportParams): string {
        if (!this.excelCreator) { console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise'); }
        return this.excelCreator.getDataAsExcelXml(params);
    }

    public exportDataAsExcel(params?: CsvExportParams): void {
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
        if (this.gridOptionsWrapper.isRowModelServerPagination()) {
            this.serverPaginationService.setDatasource(datasource);
        } else if (this.gridOptionsWrapper.isRowModelInfinite()) {
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
            this.selectionController.reset();
            this.inMemoryRowModel.setRowData(rowData, true);
        } else {
            console.log('cannot call setRowData unless using normal row model');
        }
    }

    public setFloatingTopRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingTopRowData(rows);
    }

    public setFloatingBottomRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingBottomRowData(rows);
    }

    public getFloatingTopRowCount(): number {
        return this.floatingRowModel.getFloatingTopRowCount();
    }

    public getFloatingBottomRowCount(): number {
        return this.floatingRowModel.getFloatingBottomRowCount();
    }

    public getFloatingTopRow(index: number): RowNode {
        return this.floatingRowModel.getFloatingTopRow(index);
    }

    public getFloatingBottomRow(index: number): RowNode {
        return this.floatingRowModel.getFloatingBottomRow(index);
    }

    public setColumnDefs(colDefs: (ColDef|ColGroupDef)[]) {
        this.columnController.setColumnDefs(colDefs);
    }

    public refreshRows(rowNodes: RowNode[]): void {
        this.rowRenderer.refreshRows(rowNodes);
    }

    public refreshCells(rowNodes: RowNode[], cols: (string|ColDef|Column)[], animate = false): void {
        this.rowRenderer.refreshCells(rowNodes, cols, animate);
    }

    public rowDataChanged(rows:any) {
        console.log('ag-Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node')
        this.refreshView();
    }

    public refreshView() {
        this.rowRenderer.refreshView();
    }

    public setFunctionsReadOnly(readOnly: boolean) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    }

    public softRefreshView() {
        this.rowRenderer.softRefreshView();
    }

    public refreshGroupRows() {
        this.rowRenderer.refreshGroupRows();
    }

    public refreshHeader() {
        // need to review this - the refreshHeader should also refresh all icons in the header
        this.headerRenderer.refreshHeader();
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
        if (_.exists(deprecated_refreshFromIndex)) { console.log('ag-Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is not longer used, the grid will refresh all rows'); }
        // we don't really want the user calling this if one one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.inMemoryRowModel.refreshModel({step: Constants.STEP_MAP});
    }

    public refreshInMemoryRowModel(): any {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call refreshInMemoryRowModel unless using normal row model') }
        this.inMemoryRowModel.refreshModel({step: Constants.STEP_EVERYTHING});
    }

    public expandAll() {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call expandAll unless using normal row model') }
        this.inMemoryRowModel.expandOrCollapseAll(true);
    }

    public collapseAll() {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call collapseAll unless using normal row model') }
        this.inMemoryRowModel.expandOrCollapseAll(false);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (eventName==='virtualRowRemoved') {
            console.log('ag-Grid: event virtualRowRemoved is deprecated, now called renderedRowRemoved');
            eventName = '' +
                '';
        }
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
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call recomputeAggregates unless using normal row model') }
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

    public ensureColumnVisible(key: string|Column|ColDef) {
        this.gridPanel.ensureColumnVisible(key);
    }

    public ensureIndexVisible(index:any) {
        this.gridPanel.ensureIndexVisible(index);
    }

    public ensureNodeVisible(comparator:any) {
        this.gridCore.ensureNodeVisible(comparator);
    }

    public forEachLeafNode(callback: (rowNode: RowNode)=>void ) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call forEachNodeAfterFilter unless using normal row model') }
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

    public getFilterInstance(key: string|Column|ColDef): IFilterComp {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.getFilterComponent(column);
        }
    }

    public getFilterApi(key: string|Column|ColDef) {
        console.warn('ag-Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    }

    public destroyFilter(key: string|Column|ColDef) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column);
        }
    }

    public getColumnDef(key: string|Column|ColDef) {
        var column = this.columnController.getPrimaryColumn(key);
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

    public setSortModel(sortModel:any) {
        this.sortController.setSortModel(sortModel);
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

    public setFocusedCell(rowIndex: number, colKey: Column|ColDef|string, floating?: string) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    }

    public showToolPanel(show:any) {
        this.gridCore.showToolPanel(show);
    }

    public isToolPanelShowing() {
        return this.gridCore.isToolPanelShowing();
    }

    public doLayout() {
        this.gridCore.doLayout();
    }

    public resetRowHeights() {
        if (_.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.resetRowHeights();
        }
    }

    public onRowHeightChanged() {
        if (_.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.onRowHeightChanged();
        }
    }

    public getValue(colKey: string|ColDef|Column, rowNode: RowNode): any {
        var column = this.columnController.getPrimaryColumn(colKey);
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
        this.eventService.addEventListener(eventType, listener);
    }

    public addGlobalListener(listener: Function): void {
        this.eventService.addGlobalListener(listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    public removeGlobalListener(listener: Function): void {
        this.eventService.removeGlobalListener(listener);
    }

    public dispatchEvent(eventType: string, event?: any): void {
        this.eventService.dispatchEvent(eventType, event);
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

    public addRangeSelection(rangeSelection: AddRangeSelectionParams): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.addRange(rangeSelection);
    }

    public clearRangeSelection(): void {
        if (!this.rangeController) { console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise'); }
        this.rangeController.clearSelection();
    }

    public copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string|Column|ColDef)[]): void {
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

    public showColumnMenuAfterButtonClick(colKey: string|Column|ColDef, buttonElement: HTMLElement): void {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    }

    public showColumnMenuAfterMouseClick(colKey: string|Column|ColDef, mouseEvent: MouseEvent|Touch): void {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
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
        var column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`ag-Grid: no column found for ${params.colKey}`);
            return;
        }
        let gridCellDef = <GridCellDef> {rowIndex: params.rowIndex, floating: null, column: column};
        var gridCell = new GridCell(gridCellDef);
        this.gridPanel.ensureIndexVisible(params.rowIndex);
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

    public insertItemsAtIndex(index: number, items: any[], skipRefresh = false): void {
        this.rowModel.insertItemsAtIndex(index, items, skipRefresh);
    }

    public removeItems(rowNodes: RowNode[], skipRefresh = false): void {
        this.rowModel.removeItems(rowNodes, skipRefresh);
    }

    public addItems(items: any[], skipRefresh = false): void {
        this.rowModel.addItems(items, skipRefresh);
    }

    public refreshVirtualPageCache(): void {
        console.warn('ag-Grid: refreshVirtualPageCache() is now called refreshInfinitePageCache(), please call refreshInfinitePageCache() instead');
        this.refreshInfinitePageCache();
    }

    public refreshInfinitePageCache(): void {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.refreshCache();
        } else {
            console.warn(`ag-Grid: api.refreshVirtualPageCache is only available when rowModelType='virtual'.`);
        }
    }

    public purgeVirtualPageCache(): void {
        console.warn('ag-Grid: purgeVirtualPageCache() is now called purgeInfinitePageCache(), please call purgeInfinitePageCache() instead');
        this.purgeInfinitePageCache();
    }

    public purgeInfinitePageCache(): void {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.purgeCache();
        } else {
            console.warn(`ag-Grid: api.refreshVirtualPageCache is only available when rowModelType='virtual'.`);
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
        console.warn('ag-Grid: getVirtualPageState() is now called getInfinitePageState(), please call getInfinitePageState() instead');
        return this.getInfinitePageState();
    }

    public getInfinitePageState(): any {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getPageState();
        } else {
            console.warn(`ag-Grid: api.getVirtualPageState is only available when rowModelType='virtual'.`);
        }
    }

    public checkGridSize(): void {
        this.gridPanel.setBodyAndHeaderHeights();
    }

    public paginationIsLastPageFound(): boolean {
        return this.paginationService.isLastPageFound();
    }

    public paginationGetPageSize(): number {
        return this.paginationService.getPageSize();
    }

    public paginationSetPageSize(size: number): void {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    }

    public paginationGetCurrentPage(): number {
        return this.paginationService.getCurrentPage();
    }

    public paginationGetTotalPages(): number {
        return this.paginationService.getTotalPages();
    }

    public paginationGetRowCount(): number {
        return this.paginationService.getTotalRowCount();
    }

    public paginationGoToNextPage(): void {
        this.paginationService.goToNextPage();
    }

    public paginationGoToPreviousPage(): void {
        this.paginationService.goToPreviousPage();
    }

    public paginationGoToFirstPage(): void {
        this.paginationService.goToFirstPage();
    }

    public paginationGoToLastPage(): void {
        this.paginationService.goToLastPage();
    }

    public paginationGoToPage(page: number): void {
        this.paginationService.goToPage(page);
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
