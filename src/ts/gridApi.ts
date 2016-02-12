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
import {VirtualRowEventService} from "./rendering/virtualRowEventService";

@Bean('gridApi')
export class GridApi {

    @Qualifier('csvCreator') private csvCreator: CsvCreator;
    @Qualifier('gridCore') private gridCore: GridCore;
    @Qualifier('rowRenderer') private rowRenderer: RowRenderer;
    @Qualifier('headerRenderer') private headerRenderer: HeaderRenderer;
    @Qualifier('filterManager') private filterManager: FilterManager;
    @Qualifier('columnController') private columnController: ColumnController;
    @Qualifier('inMemoryRowController') private inMemoryRowController: InMemoryRowController;
    @Qualifier('selectionController') private selectionController: SelectionController;
    @Qualifier('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Qualifier('gridPanel') private gridPanel: GridPanel;
    @Qualifier('valueService') private valueService: ValueService;
    @Qualifier('masterSlaveService') private masterSlaveService: MasterSlaveService;
    @Qualifier('eventService') private eventService: EventService;
    @Qualifier('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Qualifier('context') private context: Context;
    @Qualifier('virtualRowEventService') private virtualRowEventService: VirtualRowEventService;

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

    public setRowData(rowData:any) {
        this.selectionController.reset();
        this.gridCore.setRowData(rowData);
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

    public setColumnDefs(colDefs: ColDef[]) {
        this.gridCore.setColumnDefs(colDefs);
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
            console.log('ag-Grid: addVirtualRowListener has changed, the first parameter should be the event name, please check the documentation.');
        }
        this.virtualRowEventService.addVirtualRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter:any) {
        this.gridCore.onQuickFilterChanged(newFilter)
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
        this.gridPanel.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.gridPanel.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.gridPanel.hideOverlay();
    }

    public showLoading(show: any) {
        console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
        if (show) {
            this.gridPanel.showLoadingOverlay();
        } else {
            this.gridPanel.hideOverlay();
        }
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
