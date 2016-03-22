import {CsvCreator} from "./csvCreator";
import {Grid} from "./grid";
import {RowRenderer} from "./rendering/rowRenderer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {FilterManager} from "./filter/filterManager";
import {ColumnController} from "./columnController/columnController";
import {InMemoryRowController} from "./rowControllers/inMemory/inMemoryRowController";
import {SelectionController} from "./selectionController";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {GridPanel} from "./gridPanel/gridPanel";
import {ValueService} from "./valueService";
import {MasterSlaveService} from "./masterSlaveService";
import {EventService} from "./eventService";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {CsvExportParams} from "./csvCreator";
import {ColDef} from "./entities/colDef";
import {RowNode} from "./entities/rowNode";
import {Constants} from "./constants";
import {Column} from "./entities/column";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {GridCore} from "./gridCore";
import {Context} from "./context/context";
import {Autowired} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {SortController} from "./sortController";
import {PaginationController} from "./rowControllers/paginationController";
import {FocusedCellController} from "./focusedCellController";
import {IRangeController} from "./interfaces/iRangeController";
import {RangeSelection} from "./interfaces/iRangeController";
import {Optional} from "./context/context";
import {GridCell} from "./entities/gridCell";
import {AddRangeSelectionParams} from "./interfaces/iRangeController";
import {IClipboardService} from "./interfaces/iClipboardService";

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
            this.rowModel.setDatasource(datasource);
        } else {
            console.warn(`ag-Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIRTUAL}' or '${Constants.ROW_MODEL_TYPE_PAGINATION}'`)
        }
    }

    public setRowData(rowData: any[]) {
        this.rowModel.setRowData(rowData, true);
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

    public refreshCells(rowNodes: RowNode[], colIds: string[]): void {
        this.rowRenderer.refreshCells(rowNodes, colIds);
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

    public onGroupExpandedOrCollapsed(refreshFromIndex: any) {
        this.rowModel.refreshModel(Constants.STEP_MAP, refreshFromIndex);
    }

    public expandAll() {
        this.rowModel.expandOrCollapseAll(true);
    }

    public collapseAll() {
        this.rowModel.expandOrCollapseAll(false);
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
        this.selectionController.selectIndex(index, tryMulti, suppressEvents);
    }

    public deselectIndex(index: number, suppressEvents: boolean = false) {
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        this.selectionController.deselectIndex(index, suppressEvents);
    }

    public selectNode(node: RowNode, tryMulti: boolean = false, suppressEvents: boolean = false) {
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        node.setSelected(true, !tryMulti, suppressEvents);
    }

    public deselectNode(node:any, suppressEvents: boolean = false) {
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        node.setSelected(false, false, suppressEvents);
    }

    public selectAll() {
        this.selectionController.selectAllRowNodes();
    }

    public deselectAll() {
        this.selectionController.deselectAllRowNodes();
    }

    public recomputeAggregates(): void {
        this.rowModel.refreshModel(Constants.STEP_AGGREGATE);
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
        this.rowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=>void) {
        this.rowModel.forEachNodeAfterFilterAndSort(callback);
    }

    public getFilterApiForColDef(colDef:any) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterApi(colDef);
    }

    public getFilterApi(key: string|Column|ColDef) {
        var column = this.columnController.getColumn(key);
        return this.filterManager.getFilterApi(column);
    }

    public getColumnDef(key: string|Column|ColDef) {
        var column = this.columnController.getColumn(key);
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
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating);
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
        var column = this.columnController.getColumn(colKey);
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
}
