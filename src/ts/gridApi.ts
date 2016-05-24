import {CsvCreator, CsvExportParams} from "./csvCreator";
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
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {ColDef} from "./entities/colDef";
import {RowNode} from "./entities/rowNode";
import {Constants} from "./constants";
import {Column} from "./entities/column";
import {Bean, PostConstruct, Context, Autowired, Optional} from "./context/context";
import {GridCore} from "./gridCore";
import {IRowModel} from "./interfaces/iRowModel";
import {SortController} from "./sortController";
import {PaginationController} from "./rowControllers/paginationController";
import {FocusedCellController} from "./focusedCellController";
import {IRangeController, RangeSelection, AddRangeSelectionParams} from "./interfaces/iRangeController";
import {GridCell} from "./entities/gridCell";
import {IClipboardService} from "./interfaces/iClipboardService";
import {IInMemoryRowModel} from "./interfaces/iInMemoryRowModel";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {IMenuFactory} from "./interfaces/iMenuFactory";
import {VirtualPageRowModel} from "./rowControllers/virtualPageRowModel";
import {CellRendererFactory} from "./rendering/cellRendererFactory";
import {CellEditorFactory} from "./rendering/cellEditorFactory";

@Bean('gridApi')
export class GridApi {

    @Autowired('csvCreator') private csvCreator: CsvCreator;
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
    @Autowired('paginationController') private paginationController: PaginationController;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;

    private inMemoryRowModel: IInMemoryRowModel;

    @PostConstruct
    private init(): void {
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL) {
            this.inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
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

    public setDatasource(datasource:any) {
        if (this.gridOptionsWrapper.isRowModelPagination()) {
            this.paginationController.setDatasource(datasource);
        } else if (this.gridOptionsWrapper.isRowModelVirtual()) {
            (<VirtualPageRowModel>this.rowModel).setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIRTUAL}' or '${Constants.ROW_MODEL_TYPE_PAGINATION}'`)
        }
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            (<any>this.rowModel).setViewportDatasource(viewportDatasource);
        } else {
            console.warn(`ag-Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIEWPORT}'`)
        }
    }
    
    public setRowData(rowData: any[]) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call setRowData unless using normal row model') }
        this.inMemoryRowModel.setRowData(rowData, true);
    }

    public setFloatingTopRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingTopRowData(rows);
    }

    public setFloatingBottomRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingBottomRowData(rows);
    }

    public setColumnDefs(colDefs: ColDef[]) {
        this.columnController.setColumnDefs(colDefs);
    }

    public refreshRows(rowNodes: RowNode[]): void {
        this.rowRenderer.refreshRows(rowNodes);
    }

    public refreshCells(rowNodes: RowNode[], colIds: string[], animate = false): void {
        this.rowRenderer.refreshCells(rowNodes, colIds, animate);
    }

    public rowDataChanged(rows:any) {
        this.rowRenderer.rowDataChanged(rows);
    }

    public refreshView() {
        this.rowRenderer.refreshView();
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

    public onGroupExpandedOrCollapsed(refreshFromIndex?: any) {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call onGroupExpandedOrCollapsed unless using normal row model') }
        this.inMemoryRowModel.refreshModel(Constants.STEP_MAP, refreshFromIndex);
    }

    public refreshInMemoryRowModel(): any {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call refreshInMemoryRowModel unless using normal row model') }
        this.inMemoryRowModel.refreshModel(Constants.STEP_EVERYTHING);
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

    public setQuickFilter(newFilter:any) {
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

    public recomputeAggregates(): void {
        if (_.missing(this.inMemoryRowModel)) { console.log('cannot call recomputeAggregates unless using normal row model') }
        this.inMemoryRowModel.refreshModel(Constants.STEP_AGGREGATE);
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

    public getFilterApiForColDef(colDef:any) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterApi(colDef);
    }

    public getFilterApi(key: string|Column|ColDef) {
        var column = this.columnController.getOriginalColumn(key);
        if (column) {
            return this.filterManager.getFilterApi(column);
        }
    }

    public destroyFilter(key: string|Column|ColDef) {
        var column = this.columnController.getOriginalColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column);
        }
    }
    
    public getColumnDef(key: string|Column|ColDef) {
        var column = this.columnController.getOriginalColumn(key);
        if (column) {
            return column.getColDef();
        } else {
            return null;
        }
    }

    public onFilterChanged() {
        this.filterManager.onFilterChanged();
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

    public setFocusedCell(rowIndex: number, colKey: Column|ColDef|string, floating?: string) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setHeaderHeight(headerHeight);
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

    public getValue(colKey: string|ColDef|Column, rowNode: RowNode): any {
        var column = this.columnController.getOriginalColumn(colKey);
        return this.valueService.getValue(column, rowNode);
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

    public copySelectedRowsToClipboard(): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copySelectedRowsToClipboard();
    }

    public copySelectedRangeToClipboard(): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copySelectedRangeToClipboard();
    }

    public copySelectedRangeDown(): void {
        if (!this.clipboardService) { console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise'); }
        this.clipboardService.copyRangeDown();
    }

    public showColumnMenuAfterButtonClick(colKey: string|Column|ColDef, buttonElement: HTMLElement): void {
        var column = this.columnController.getOriginalColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    }

    public showColumnMenuAfterMouseClick(colKey: string|Column|ColDef, mouseEvent: MouseEvent): void {
        var column = this.columnController.getOriginalColumn(colKey);
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
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
