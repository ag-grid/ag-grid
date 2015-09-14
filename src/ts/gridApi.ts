/// <reference path="grid.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />

module awk.grid {

    export class GridApi {

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
                    private masterSlaveService: MasterSlaveService) {
        }

        /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
        public __getMasterSlaveService(): MasterSlaveService {
            return this.masterSlaveService;
        }

        public setDatasource(datasource:any) {
            this.grid.setDatasource(datasource);
        }

        public onNewDatasource() {
            this.grid.setDatasource();
        }

        public setRows(rows:any) {
            this.grid.setRows(rows);
        }

        public onNewRows() {
            this.grid.setRows();
        }

        public setFloatingTopRowData(rows: any[]): void {
            this.gridOptionsWrapper.setFloatingTopRowData(rows);
            this.gridPanel.onBodyHeightChange();
            this.refreshView();
        }

        public setFloatingBottomRowData(rows: any[]): void {
            this.gridOptionsWrapper.setFloatingBottomRowData(rows);
            this.gridPanel.onBodyHeightChange();
            this.refreshView();
        }

        public onNewCols() {
            this.grid.onNewCols();
        }

        public unselectAll() {
            console.error("unselectAll deprecated, call deselectAll instead");
            this.deselectAll();
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

        public addVirtualRowListener(rowIndex:any, callback:any) {
            this.grid.addVirtualRowListener(rowIndex, callback);
        }

        public rowDataChanged(rows:any) {
            this.rowRenderer.rowDataChanged(rows);
        }

        public setQuickFilter(newFilter:any) {
            this.grid.onQuickFilterChanged(newFilter)
        }

        public selectIndex(index:any, tryMulti:any, suppressEvents:any) {
            this.selectionController.selectIndex(index, tryMulti, suppressEvents);
        }

        public deselectIndex(index:any) {
            this.selectionController.deselectIndex(index);
        }

        public selectNode(node:any, tryMulti:any, suppressEvents:any) {
            this.selectionController.selectNode(node, tryMulti, suppressEvents);
        }

        public deselectNode(node:any) {
            this.selectionController.deselectNode(node);
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
            if (this.gridOptionsWrapper.isDontUseScrolls()) {
                console.warn('ag-grid: sizeColumnsToFit does not work when dontUseScrolls=true');
                return;
            }
            var availableWidth = this.gridPanel.getWidthForSizeColsToFit();
            this.columnController.sizeColumnsToFit(availableWidth);
        }

        public showLoading(show:any) {
            this.grid.showLoadingPanel(show);
        }

        public isNodeSelected(node:any) {
            return this.selectionController.isNodeSelected(node);
        }

        public getSelectedNodes() {
            return this.selectionController.getSelectedNodes();
        }

        public getBestCostNodeSelection() {
            return this.selectionController.getBestCostNodeSelection();
        }

        public getRenderedNodes() {
            return this.rowRenderer.getRenderedNodes();
        }

        public ensureColIndexVisible(index:any) {
            this.gridPanel.ensureColIndexVisible(index);
        }

        public ensureIndexVisible(index:any) {
            this.gridPanel.ensureIndexVisible(index);
        }

        public ensureNodeVisible(comparator:any) {
            this.grid.ensureNodeVisible(comparator);
        }

        public forEachInMemory(callback:any) {
            this.grid.getRowModel().forEachInMemory(callback);
        }

        public getFilterApiForColDef(colDef:any) {
            console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
            return this.getFilterApi(colDef);
        }

        public getFilterApi(key:any) {
            var column = this.columnController.getColumn(key);
            return this.filterManager.getFilterApi(column);
        }

        public getColumnDef(key:any) {
            var column = this.columnController.getColumn(key);
            if (column) {
                return column.colDef;
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

        public setFocusedCell(rowIndex:any, colIndex:any) {
            this.grid.setFocusedCell(rowIndex, colIndex);
        }

        public setHeaderHeight(headerHeight: number) {
            this.gridOptionsWrapper.setHeaderHeight(headerHeight);
            this.gridPanel.onBodyHeightChange();
        }

        public setGroupHeaders(groupHeaders: boolean) {
            this.gridOptionsWrapper.setGroupHeaders(groupHeaders);
            this.columnController.onColumnsChanged();
            // if using the default height, then this is impacted by the header count
            this.gridPanel.onBodyHeightChange();
        }

        public showToolPanel(show:any) {
            this.grid.showToolPanel(show);
        }

        public isToolPanelShowing() {
            return this.grid.isToolPanelShowing();
        }

        public hideColumn(colId:any, hide:any) {
            console.warn('ag-Grid: hideColumn deprecated - use hideColumn on columnApi instead eg api.columnApi.hideColumn()');
            this.columnController.hideColumns([colId], hide);
        }

        public hideColumns(colIds:any, hide:any) {
            console.warn('ag-Grid: hideColumns deprecated - use hideColumns on columnApi instead eg api.columnApi.hideColumns()');
            this.columnController.hideColumns(colIds, hide);
        }

        public getColumnState() {
            console.warn('ag-Grid: getColumnState deprecated - use getColumnState on columnApi instead eg api.columnApi.getState()');
            return this.columnController.getState();
        }

        public setColumnState(state:any) {
            console.warn('ag-Grid: setColumnState deprecated - use setColumnState on columnApi instead eg api.columnApi.setState()');
            this.columnController.setState(state);
        }

        public doLayout() {
            this.grid.doLayout();
        }

        public getValue(colDef: ColDef, data: any, node: any): any {
            return this.valueService.getValue(colDef, data, node);
        }

    }
}