import CsvCreator from "./csvCreator";
import {Grid} from "./grid";
import RowRenderer from "./rendering/rowRenderer";
import HeaderRenderer from "./headerRendering/headerRenderer";
import FilterManager from "./filter/filterManager";
import {ColumnController} from "./columnController/columnController";
import InMemoryRowController from "./rowControllers/inMemoryRowController";
import SelectionController from "./selectionController";
import GridOptionsWrapper from "./gridOptionsWrapper";
import GridPanel from "./gridPanel/gridPanel";
import ValueService from "./valueService";
import MasterSlaveService from "./masterSlaveService";
import EventService from "./eventService";
import FloatingRowModel from "./rowControllers/floatingRowModel";
import CsvExportParams from "./csvCreator";
import {ColDef} from "./entities/colDef";
import {RowNode} from "./entities/rowNode";
import Constants from "./constants";
import Column from "./entities/column";

export class GridApi {

    private csvCreator: CsvCreator;

    constructor(private grid: Grid,
                private rowRenderer: RowRenderer,
                private headerRenderer: HeaderRenderer,
                private filterManager: FilterManager,
                private columnController: ColumnController,
                private inMemoryRowController: InMemoryRowController,
                private selectionController: SelectionController,
                private gridOptionsWrapper: GridOptionsWrapper,
                private gridPanel: GridPanel,
                private valueService: ValueService,
                private masterSlaveService: MasterSlaveService,
                private eventService: EventService,
                private floatingRowModel: FloatingRowModel) {
        this.csvCreator = new CsvCreator(this.inMemoryRowController, this.columnController, this.grid, this.valueService);
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getMasterSlaveService(): MasterSlaveService {
        return this.masterSlaveService;
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        return this.csvCreator.getDataAsCsv(params);
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        this.csvCreator.exportDataAsCsv(params)
    }

    public setDatasource(datasource:any) {
        this.grid.setDatasource(datasource);
    }

    public onNewDatasource() {
        console.log('ag-Grid: onNewDatasource deprecated, please use setDatasource()');
        this.grid.setDatasource();
    }

    public setRowData(rowData:any) {
        this.grid.setRowData(rowData);
    }

    public setRows(rows:any) {
        console.log('ag-Grid: setRows deprecated, please use setRowData()');
        this.grid.setRowData(rows);
    }

    public onNewRows() {
        console.log('ag-Grid: onNewRows deprecated, please use setRowData()');
        this.grid.setRowData();
    }

    public setFloatingTopRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingTopRowData(rows);
        this.gridPanel.onBodyHeightChange();
        this.refreshView();
    }

    public setFloatingBottomRowData(rows: any[]): void {
        this.floatingRowModel.setFloatingBottomRowData(rows);
        this.gridPanel.onBodyHeightChange();
        this.refreshView();
    }

    public onNewCols() {
        console.error("ag-Grid: deprecated, please call setColumnDefs instead providing a list of the defs");
        this.grid.setColumnDefs();
    }

    public setColumnDefs(colDefs: ColDef[]) {
        this.grid.setColumnDefs(colDefs);
    }

    public unselectAll() {
        console.error("unselectAll deprecated, call deselectAll instead");
        this.deselectAll();
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
        this.headerRenderer.updateFilterIcons();
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

    public getModel() {
        return this.grid.getRowModel();
    }

    public onGroupExpandedOrCollapsed(refreshFromIndex:any) {
        this.grid.updateModelAndRefresh(Constants.STEP_MAP, refreshFromIndex);
    }

    public expandAll() {
        this.inMemoryRowController.expandOrCollapseAll(true, null);
        this.grid.updateModelAndRefresh(Constants.STEP_MAP);
    }

    public collapseAll() {
        this.inMemoryRowController.expandOrCollapseAll(false, null);
        this.grid.updateModelAndRefresh(Constants.STEP_MAP);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener has changed, the first parameter should be the event name, pleae check the documentation.');
        }
        this.grid.addVirtualRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter:any) {
        this.grid.onQuickFilterChanged(newFilter)
    }

    public selectIndex(index:any, tryMulti:any, suppressEvents:any) {
        this.selectionController.selectIndex(index, tryMulti, suppressEvents);
    }

    public deselectIndex(index: number, suppressEvents: boolean = false) {
        this.selectionController.deselectIndex(index, suppressEvents);
    }

    public selectNode(node:any, tryMulti: boolean = false, suppressEvents: boolean = false) {
        this.selectionController.selectNode(node, tryMulti, suppressEvents);
    }

    public deselectNode(node:any, suppressEvents: boolean = false) {
        this.selectionController.deselectNode(node, suppressEvents);
    }

    public selectAll() {
        this.selectionController.selectAll();
        this.rowRenderer.refreshView();
    }

    public deselectAll() {
        this.selectionController.deselectAll();
        this.rowRenderer.refreshView();
    }

    public recomputeAggregates() {
        this.inMemoryRowController.doAggregate();
        this.rowRenderer.refreshGroupRows();
    }

    public sizeColumnsToFit() {
        if (this.gridOptionsWrapper.isForPrint()) {
            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
            return;
        }
        this.gridPanel.sizeColumnsToFit();
    }

    public showLoadingOverlay(): void {
        this.grid.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.grid.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.grid.hideOverlay();
    }

    public showLoading(show: any) {
        console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
        if (show) {
            this.grid.showLoadingOverlay();
        } else {
            this.grid.hideOverlay();
        }
    }

    public isNodeSelected(node:any) {
        return this.selectionController.isNodeSelected(node);
    }

    public getSelectedNodesById(): {[nodeId: number]: RowNode;} {
        return this.selectionController.getSelectedNodesById();
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
        this.grid.ensureNodeVisible(comparator);
    }

    public forEachInMemory(callback: Function) {
        console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
        this.forEachNode(callback);
    }

    public forEachNode(callback: Function) {
        this.grid.getRowModel().forEachNode(callback);
    }

    public forEachNodeAfterFilter(callback: Function) {
        this.grid.getRowModel().forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: Function) {
        this.grid.getRowModel().forEachNodeAfterFilterAndSort(callback);
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
        this.grid.onFilterChanged();
    }

    public setSortModel(sortModel:any) {
        this.grid.setSortModel(sortModel);
    }

    public getSortModel() {
        return this.grid.getSortModel();
    }

    public setFilterModel(model:any) {
        this.filterManager.setFilterModel(model);
    }

    public getFilterModel() {
        return this.grid.getFilterModel();
    }

    public getFocusedCell() {
        return this.rowRenderer.getFocusedCell();
    }

    public setFocusedCell(rowIndex:any, colId:any) {
        this.grid.setFocusedCell(rowIndex, colId);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setHeaderHeight(headerHeight);
        this.gridPanel.onBodyHeightChange();
    }

    public showToolPanel(show:any) {
        this.grid.showToolPanel(show);
    }

    public isToolPanelShowing() {
        return this.grid.isToolPanelShowing();
    }

    public doLayout() {
        this.grid.doLayout();
    }

    public getValue(colDef: ColDef, data: any, node: any): any {
        return this.valueService.getValue(colDef, data, node);
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

    public refreshRowGroup(): void {
        this.grid.refreshRowGroup();
    }

    public destroy(): void {
        this.grid.destroy();
    }
}
