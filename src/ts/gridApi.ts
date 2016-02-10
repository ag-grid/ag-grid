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
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {GridCore} from "./gridCore";
import {Context} from "./context/context";

@Bean('gridApi')
export class GridApi {

    private csvCreator: CsvCreator;

    private gridCore: GridCore;
    private rowRenderer: RowRenderer;
    private headerRenderer: HeaderRenderer;
    private filterManager: FilterManager;
    private columnController: ColumnController;
    private inMemoryRowController: InMemoryRowController;
    private selectionController: SelectionController;
    private gridOptionsWrapper: GridOptionsWrapper;
    private gridPanel: GridPanel;
    private valueService: ValueService;
    private masterSlaveService: MasterSlaveService;
    private eventService: EventService;
    private floatingRowModel: FloatingRowModel;
    private context: Context;

    constructor() {
    }

    public agInit(@Qualifier('gridCore') gridCore: GridCore,
                @Qualifier('rowRenderer') rowRenderer: RowRenderer,
                @Qualifier('headerRenderer') headerRenderer: HeaderRenderer,
                @Qualifier('filterManager') filterManager: FilterManager,
                @Qualifier('columnController') columnController: ColumnController,
                @Qualifier('inMemoryRowController') inMemoryRowController: InMemoryRowController,
                @Qualifier('selectionController') selectionController: SelectionController,
                @Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper,
                @Qualifier('gridPanel') gridPanel: GridPanel,
                @Qualifier('valueService') valueService: ValueService,
                @Qualifier('masterSlaveService') masterSlaveService: MasterSlaveService,
                @Qualifier('eventService') eventService: EventService,
                @Qualifier('csvCreator') csvCreator: CsvCreator,
                @Qualifier('context') context: Context,
                @Qualifier('floatingRowModel') floatingRowModel: FloatingRowModel) {

        this.gridCore = gridCore;
        this.rowRenderer = rowRenderer;
        this.headerRenderer = headerRenderer;
        this.filterManager = filterManager;
        this.columnController = columnController;
        this.inMemoryRowController = inMemoryRowController;
        this.selectionController = selectionController;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.gridPanel = gridPanel;
        this.valueService = valueService;
        this.masterSlaveService = masterSlaveService;
        this.eventService = eventService;
        this.floatingRowModel = floatingRowModel;
        this.csvCreator = csvCreator;
        this.context = context;
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
        this.gridCore.setDatasource(datasource);
    }

    public onNewDatasource() {
        console.log('ag-Grid: onNewDatasource deprecated, please use setDatasource()');
        this.gridCore.setDatasource();
    }

    public setRowData(rowData:any) {
        this.gridCore.setRowData(rowData);
    }

    public setRows(rows:any) {
        console.log('ag-Grid: setRows deprecated, please use setRowData()');
        this.gridCore.setRowData(rows);
    }

    public onNewRows() {
        console.log('ag-Grid: onNewRows deprecated, please use setRowData()');
        this.gridCore.setRowData();
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
        this.gridCore.setColumnDefs();
    }

    public setColumnDefs(colDefs: ColDef[]) {
        this.gridCore.setColumnDefs(colDefs);
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
        return this.gridCore.getRowModel();
    }

    public onGroupExpandedOrCollapsed(refreshFromIndex:any) {
        this.gridCore.updateModelAndRefresh(Constants.STEP_MAP, refreshFromIndex);
    }

    public expandAll() {
        this.inMemoryRowController.expandOrCollapseAll(true, null);
        this.gridCore.updateModelAndRefresh(Constants.STEP_MAP);
    }

    public collapseAll() {
        this.inMemoryRowController.expandOrCollapseAll(false, null);
        this.gridCore.updateModelAndRefresh(Constants.STEP_MAP);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener has changed, the first parameter should be the event name, pleae check the documentation.');
        }
        this.gridCore.addVirtualRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter:any) {
        this.gridCore.onQuickFilterChanged(newFilter)
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
        this.gridCore.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.gridCore.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.gridCore.hideOverlay();
    }

    public showLoading(show: any) {
        console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
        if (show) {
            this.gridCore.showLoadingOverlay();
        } else {
            this.gridCore.hideOverlay();
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
        this.gridCore.ensureNodeVisible(comparator);
    }

    public forEachInMemory(callback: Function) {
        console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
        this.forEachNode(callback);
    }

    public forEachNode(callback: Function) {
        this.gridCore.getRowModel().forEachNode(callback);
    }

    public forEachNodeAfterFilter(callback: Function) {
        this.gridCore.getRowModel().forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: Function) {
        this.gridCore.getRowModel().forEachNodeAfterFilterAndSort(callback);
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
        this.gridCore.onFilterChanged();
    }

    public setSortModel(sortModel:any) {
        this.gridCore.setSortModel(sortModel);
    }

    public getSortModel() {
        return this.gridCore.getSortModel();
    }

    public setFilterModel(model:any) {
        this.filterManager.setFilterModel(model);
    }

    public getFilterModel() {
        return this.gridCore.getFilterModel();
    }

    public getFocusedCell() {
        return this.rowRenderer.getFocusedCell();
    }

    public setFocusedCell(rowIndex:any, colId:any) {
        this.gridCore.setFocusedCell(rowIndex, colId);
    }

    public setHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setHeaderHeight(headerHeight);
        this.gridPanel.onBodyHeightChange();
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
        this.gridCore.refreshRowGroup();
    }

    public destroy(): void {
        this.context.destroy();
    }
}
