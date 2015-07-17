/// <reference path="grid.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRenderer.ts" />

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
                    private gridPanel: GridPanel) {}

        setDatasource(datasource:any) {
            this.grid.setDatasource(datasource);
        }

        onNewDatasource() {
            this.grid.setDatasource();
        }

        setRows(rows:any) {
            this.grid.setRows(rows);
        }

        onNewRows() {
            this.grid.setRows();
        }

        onNewCols() {
            this.grid.onNewCols();
        }

        unselectAll() {
            console.error("unselectAll deprecated, call deselectAll instead");
            this.deselectAll();
        }

        refreshView() {
            this.rowRenderer.refreshView();
        }

        softRefreshView() {
            this.rowRenderer.softRefreshView();
        }

        refreshGroupRows() {
            this.rowRenderer.refreshGroupRows();
        }

        refreshHeader() {
            // need to review this - the refreshHeader should also refresh all icons in the header
            this.headerRenderer.refreshHeader();
            this.headerRenderer.updateFilterIcons();
        }

        getModel() {
            return this.grid.rowModel;
        }

        onGroupExpandedOrCollapsed(refreshFromIndex:any) {
            this.grid.updateModelAndRefresh(Constants.STEP_MAP, refreshFromIndex);
        }

        expandAll() {
            this.inMemoryRowController.expandOrCollapseAll(true, null);
            this.grid.updateModelAndRefresh(Constants.STEP_MAP);
        }

        collapseAll() {
            this.inMemoryRowController.expandOrCollapseAll(false, null);
            this.grid.updateModelAndRefresh(Constants.STEP_MAP);
        }

        addVirtualRowListener(rowIndex:any, callback:any) {
            this.grid.addVirtualRowListener(rowIndex, callback);
        }

        rowDataChanged(rows:any) {
            this.rowRenderer.rowDataChanged(rows);
        }

        setQuickFilter(newFilter:any) {
            this.grid.onQuickFilterChanged(newFilter)
        }

        selectIndex(index:any, tryMulti:any, suppressEvents:any) {
            this.selectionController.selectIndex(index, tryMulti, suppressEvents);
        }

        deselectIndex(index:any) {
            this.selectionController.deselectIndex(index);
        }

        selectNode(node:any, tryMulti:any, suppressEvents:any) {
            this.selectionController.selectNode(node, tryMulti, suppressEvents);
        }

        deselectNode(node:any) {
            this.selectionController.deselectNode(node);
        }

        selectAll() {
            this.selectionController.selectAll();
            this.rowRenderer.refreshView();
        }

        deselectAll() {
            this.selectionController.deselectAll();
            this.rowRenderer.refreshView();
        }

        recomputeAggregates() {
            this.inMemoryRowController.doAggregate();
            this.rowRenderer.refreshGroupRows();
        }

        sizeColumnsToFit() {
            if (this.gridOptionsWrapper.isDontUseScrolls()) {
                console.warn('ag-grid: sizeColumnsToFit does not work when dontUseScrolls=true');
                return;
            }
            var availableWidth = this.gridPanel.getWidthForSizeColsToFit();
            this.columnController.sizeColumnsToFit(availableWidth);
        }

        showLoading(show:any) {
            this.grid.showLoadingPanel(show);
        }

        isNodeSelected(node:any) {
            return this.selectionController.isNodeSelected(node);
        }

        getSelectedNodes() {
            return this.selectionController.getSelectedNodes();
        }

        getBestCostNodeSelection() {
            return this.selectionController.getBestCostNodeSelection();
        }

        ensureColIndexVisible(index:any) {
            this.gridPanel.ensureColIndexVisible(index);
        }

        ensureIndexVisible(index:any) {
            this.gridPanel.ensureIndexVisible(index);
        }

        ensureNodeVisible(comparator:any) {
            this.grid.ensureNodeVisible(comparator);
        }

        forEachInMemory(callback:any) {
            this.grid.rowModel.forEachInMemory(callback);
        }

        getFilterApiForColDef(colDef:any) {
            console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
            return this.getFilterApi(colDef);
        }

        getFilterApi(key:any) {
            var column = this.grid.columnModel.getColumn(key);
            return this.filterManager.getFilterApi(column);
        }

        getColumnDef(key:any) {
            var column = this.grid.columnModel.getColumn(key);
            if (column) {
                return column.colDef;
            } else {
                return null;
            }
        }

        onFilterChanged() {
            this.grid.onFilterChanged();
        }

        setSortModel(sortModel:any) {
            this.grid.setSortModel(sortModel);
        }

        getSortModel() {
            return this.grid.getSortModel();
        }

        setFilterModel(model:any) {
            this.filterManager.setFilterModel(model);
        }

        getFilterModel() {
            return this.grid.getFilterModel();
        }

        getFocusedCell() {
            return this.rowRenderer.getFocusedCell();
        }

        setFocusedCell(rowIndex:any, colIndex:any) {
            this.grid.setFocusedCell(rowIndex, colIndex);
        }

        showToolPanel(show:any) {
            this.grid.showToolPanel(show);
        }

        isToolPanelShowing() {
            return this.grid.isToolPanelShowing();
        }

        hideColumn(colId:any, hide:any) {
            this.columnController.hideColumns([colId], hide);
        }

        hideColumns(colIds:any, hide:any) {
            this.columnController.hideColumns(colIds, hide);
        }

        getColumnState() {
            return this.columnController.getState();
        }

        setColumnState(state:any) {
            this.columnController.setState(state);
            this.inMemoryRowController.doGrouping();
            this.inMemoryRowController.updateModel(Constants.STEP_EVERYTHING);
            this.grid.refreshHeaderAndBody();
        }

        doLayout() {
            this.grid.doLayout();
        }
    }
}