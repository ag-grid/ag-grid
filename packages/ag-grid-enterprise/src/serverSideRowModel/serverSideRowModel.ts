import type {
    AdvancedFilterModel,
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    ColumnVO,
    FilterManager,
    FilterModel,
    FuncColsService,
    IPivotColDefService,
    IServerSideDatasource,
    IServerSideRowModel,
    IServerSideStore,
    LoadSuccessParams,
    NamedBean,
    PivotResultColsService,
    RefreshServerSideParams,
    RowBounds,
    RowModelType,
    RowRenderer,
    ServerSideGroupLevelState,
    SortController,
    SortModelItem,
    StoreRefreshAfterParams,
} from 'ag-grid-community';
import {
    BeanStub,
    ModuleNames,
    NumberSequence,
    RowNode,
    _debounce,
    _errorOnce,
    _getRowHeightAsNumber,
    _getRowHeightForNode,
    _isGetRowHeightFunction,
    _isRowSelection,
    _jsonEquals,
    _warnOnce,
} from 'ag-grid-community';

import type { NodeManager } from './nodeManager';
import { FullStore } from './stores/fullStore';
import { LazyStore } from './stores/lazy/lazyStore';
import type { StoreFactory } from './stores/storeFactory';

export interface SSRMParams {
    sortModel: SortModelItem[];
    filterModel: FilterModel | AdvancedFilterModel | null;
    lastAccessedSequence: NumberSequence;
    dynamicRowHeight: boolean;
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource?: IServerSideDatasource;
}

export class ServerSideRowModel extends BeanStub implements NamedBean, IServerSideRowModel {
    beanName = 'rowModel' as const;

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private pivotResultColsService: PivotResultColsService;
    private funcColsService: FuncColsService;
    private filterManager?: FilterManager;
    private sortController?: SortController;
    private rowRenderer: RowRenderer;
    private nodeManager: NodeManager;
    private storeFactory: StoreFactory;
    private beans: BeanCollection;
    private pivotColDefService?: IPivotColDefService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.funcColsService = beans.funcColsService;
        this.filterManager = beans.filterManager;
        this.sortController = beans.sortController;
        this.rowRenderer = beans.rowRenderer;
        this.nodeManager = beans.ssrmNodeManager as NodeManager;
        this.storeFactory = beans.ssrmStoreFactory as StoreFactory;
        this.beans = beans;
        this.pivotColDefService = beans.pivotColDefService;
    }

    private onRowHeightChanged_debounced = _debounce(this.onRowHeightChanged.bind(this), 100);

    private rootNode: RowNode;
    private datasource: IServerSideDatasource | undefined;

    private storeParams: SSRMParams;

    private pauseStoreUpdateListening = false;

    private started = false;

    private managingPivotResultColumns = false;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(): boolean {
        return false;
    }

    public start(): void {
        this.started = true;
        this.updateDatasource();
    }

    private destroyDatasource(): void {
        if (!this.datasource) {
            return;
        }

        if (this.datasource.destroy) {
            this.datasource.destroy();
        }

        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    }

    public postConstruct(): void {
        const resetListener = this.resetRootStore.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: this.onColumnEverything.bind(this),
            storeUpdated: this.onStoreUpdated.bind(this),
            columnValueChanged: resetListener,
            columnPivotChanged: resetListener,
            columnRowGroupChanged: resetListener,
            columnPivotModeChanged: resetListener,
        });

        this.addManagedPropertyListeners(
            [
                /**
                 * Following properties omitted as they are likely to come with undesired  side effects.
                 * 'getRowId', 'isRowMaster', 'getRowHeight', 'isServerSideGroup', 'getServerSideGroupKey',
                 * */
                'masterDetail',
                'treeData',
                'removePivotHeaderRowWhenSingleValueColumn',
                'suppressServerSideInfiniteScroll',
                'cacheBlockSize',
            ],
            resetListener
        );
        this.addManagedPropertyListener('groupAllowUnbalanced', () => this.onStoreUpdated());
        this.addManagedPropertyListener('rowHeight', () => this.resetRowHeights());
        this.verifyProps();

        this.addManagedPropertyListener('serverSideDatasource', () => this.updateDatasource());
    }

    private updateDatasource(): void {
        const datasource = this.gos.get('serverSideDatasource');

        if (datasource) {
            this.setDatasource(datasource);
        }
    }

    private verifyProps(): void {
        if (this.gos.exists('initialGroupOrderComparator')) {
            _warnOnce(`initialGroupOrderComparator cannot be used with Server Side Row Model.`);
        }
        if (_isRowSelection(this.gos) && !this.gos.exists('getRowId')) {
            _warnOnce(`getRowId callback must be provided for Server Side Row Model selection to work correctly.`);
        }
    }

    public setDatasource(datasource: IServerSideDatasource): void {
        // sometimes React, due to async, can call gridApi.setDatasource() before we have started.
        // this happens when React app does this:
        //      useEffect(() => setDatasource(ds), []);
        // thus if we set the datasource before the grid UI has finished initialising, we do not set it,
        // and the ssrm.start() method will set the datasoure when the grid is ready.
        if (!this.started) {
            return;
        }

        this.destroyDatasource();
        this.datasource = datasource;
        this.resetRootStore();
    }

    public applyRowData(rowDataParams: LoadSuccessParams, startRow: number, route: string[]) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }

        const storeToExecuteOn = rootStore.getChildStore(route);

        if (!storeToExecuteOn) {
            return;
        }

        if (storeToExecuteOn instanceof LazyStore) {
            storeToExecuteOn.applyRowData(rowDataParams, startRow, rowDataParams.rowData.length);
        } else if (storeToExecuteOn instanceof FullStore) {
            storeToExecuteOn.processServerResult(rowDataParams);
        }
    }

    public isLastRowIndexKnown(): boolean {
        const cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
    }

    private onColumnEverything(): void {
        // if first time, always reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }

        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        const rowGroupColumnVos = this.columnsToValueObjects(this.funcColsService.rowGroupCols);
        const valueColumnVos = this.columnsToValueObjects(this.funcColsService.valueCols);
        const pivotColumnVos = this.columnsToValueObjects(this.funcColsService.pivotCols);

        // compares two sets of columns, ensuring no columns have been added or removed (unless specified via allowRemovedColumns)
        // if the columns are found, also ensures the field and aggFunc properties have not been changed.
        const areColsSame = (params: { oldCols: ColumnVO[]; newCols: ColumnVO[]; allowRemovedColumns?: boolean }) => {
            const oldColsMap: { [key: string]: ColumnVO } = {};
            params.oldCols.forEach((col) => (oldColsMap[col.id] = col));

            const allColsUnchanged = params.newCols.every((col) => {
                const equivalentCol = oldColsMap[col.id];
                if (equivalentCol) {
                    delete oldColsMap[col.id];
                }
                return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
            });

            const missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
            return allColsUnchanged && !missingCols;
        };

        const sortModelDifferent = !_jsonEquals(this.storeParams.sortModel, this.sortController?.getSortModel() ?? []);
        const rowGroupDifferent = !areColsSame({
            oldCols: this.storeParams.rowGroupCols,
            newCols: rowGroupColumnVos,
        });
        const pivotDifferent = !areColsSame({
            oldCols: this.storeParams.pivotCols,
            newCols: pivotColumnVos,
        });
        const valuesDifferent =
            !!rowGroupColumnVos?.length &&
            !areColsSame({
                oldCols: this.storeParams.valueCols,
                newCols: valueColumnVos,
                allowRemovedColumns: true,
            });

        const resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;

        if (resetRequired) {
            this.resetRootStore();
        } else {
            // cols may have changed even if we didn't do a reset. storeParams ref will be provided when getRows
            // is called, so it's important to keep it up to date.
            const newParams = this.createStoreParams();
            this.storeParams.rowGroupCols = newParams.rowGroupCols;
            this.storeParams.pivotCols = newParams.pivotCols;
            this.storeParams.valueCols = newParams.valueCols;
        }
    }

    private destroyRootStore(): void {
        if (!this.rootNode || !this.rootNode.childStore) {
            return;
        }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore)!;
        this.nodeManager.clear();
    }

    public refreshAfterSort(newSortModel: SortModelItem[], params: StoreRefreshAfterParams): void {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }

        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }

        rootStore.refreshAfterSort(params);

        this.onStoreUpdated();
    }

    public generateSecondaryColumns(pivotFields: string[]) {
        if (!this.pivotColDefService) {
            this.gos.assertModuleRegistered(ModuleNames.RowGroupingModule, 'pivotResultFields');
            return;
        }

        const pivotColumnGroupDefs = this.pivotColDefService.createColDefsFromFields(pivotFields);
        this.managingPivotResultColumns = true;
        this.pivotResultColsService.setPivotResultCols(pivotColumnGroupDefs, 'rowModelUpdated');
    }

    public resetRowHeights(): void {
        const atLeastOne = this.resetRowHeightsForAllRowNodes();

        const rootNodeHeight = _getRowHeightForNode(this.gos, this.rootNode);
        this.rootNode.setRowHeight(rootNodeHeight.height, rootNodeHeight.estimated);
        if (this.rootNode.sibling) {
            const rootNodeSibling = _getRowHeightForNode(this.gos, this.rootNode.sibling);
            this.rootNode.sibling.setRowHeight(rootNodeSibling.height, rootNodeSibling.estimated);
        }

        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    }

    private resetRowHeightsForAllRowNodes(): boolean {
        let atLeastOne = false;
        this.forEachNode((rowNode) => {
            const rowHeightForNode = _getRowHeightForNode(this.gos, rowNode);
            rowNode.setRowHeight(rowHeightForNode.height, rowHeightForNode.estimated);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            const detailNode = rowNode.detailNode;
            if (detailNode) {
                const detailRowHeight = _getRowHeightForNode(this.gos, detailNode);
                detailNode.setRowHeight(detailRowHeight.height, detailRowHeight.estimated);
            }

            if (rowNode.sibling) {
                const siblingRowHeight = _getRowHeightForNode(this.gos, rowNode.sibling);
                detailNode.setRowHeight(siblingRowHeight.height, siblingRowHeight.estimated);
            }
            atLeastOne = true;
        });

        return atLeastOne;
    }

    public resetRootStore(): void {
        this.destroyRootStore();

        this.rootNode = new RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;

        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }

        if (this.managingPivotResultColumns) {
            // if managing pivot columns, also reset secondary columns.
            this.pivotResultColsService.setPivotResultCols(null, 'api');
            this.managingPivotResultColumns = false;
        }

        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    }

    public columnsToValueObjects(columns: AgColumn[]): ColumnVO[] {
        return columns.map(
            (col) =>
                ({
                    id: col.getId(),
                    aggFunc: col.getAggFunc(),
                    displayName: this.columnNameService.getDisplayNameForColumn(col, 'model'),
                    field: col.getColDef().field,
                }) as ColumnVO
        );
    }

    private createStoreParams(): SSRMParams {
        const rowGroupColumnVos = this.columnsToValueObjects(this.funcColsService.rowGroupCols);
        const valueColumnVos = this.columnsToValueObjects(this.funcColsService.valueCols);
        const pivotColumnVos = this.columnsToValueObjects(this.funcColsService.pivotCols);

        const dynamicRowHeight = _isGetRowHeightFunction(this.gos);

        const params: SSRMParams = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),

            // sort and filter model
            filterModel: this.filterManager?.isAdvancedFilterEnabled()
                ? this.filterManager?.getAdvancedFilterModel()
                : this.filterManager?.getFilterModel() ?? {},
            sortModel: this.sortController?.getSortModel() ?? [],

            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight,
        };

        return params;
    }

    public getParams(): SSRMParams {
        return this.storeParams;
    }

    private dispatchModelUpdated(reset = false): void {
        this.eventService.dispatchEvent({
            type: 'modelUpdated',
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false,
        });
    }

    private onStoreUpdated(): void {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) {
            return;
        }

        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }

    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    public onRowHeightChangedDebounced(): void {
        this.onRowHeightChanged_debounced();
    }

    public onRowHeightChanged(): void {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }

    public updateRowIndexesAndBounds(): void {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 }, 0);
    }

    public retryLoads(): void {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.retryLoads();
        this.onStoreUpdated();
    }

    public getRow(index: number): RowNode | undefined {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return undefined;
        }
        return rootStore.getRowUsingDisplayIndex(index) as RowNode;
    }

    /**
     * Pauses the store, to prevent it updating the UI. This is used when doing batch updates to the store.
     */
    public setPaused(paused: boolean): void {
        this.pauseStoreUpdateListening = paused;
    }

    public expandAll(value: boolean): void {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            if (node.hasChildren()) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    }

    public refreshAfterFilter(
        newFilterModel: FilterModel | AdvancedFilterModel | null,
        params: StoreRefreshAfterParams
    ): void {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter(params);

        this.onStoreUpdated();
    }

    public getRootStore(): IServerSideStore | undefined {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    }

    public getRowCount(): number {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 0;
        }

        return rootStore.getDisplayIndexEnd()!;
    }

    public getTopLevelRowCount(): number {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    }

    public getRowBounds(index: number): RowBounds {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            const rowHeight = _getRowHeightAsNumber(this.gos);
            return {
                rowTop: 0,
                rowHeight: rowHeight,
            };
        }
        return rootStore.getRowBounds(index)!;
    }

    public getBlockStates() {
        const root = this.getRootStore();
        if (!root) {
            return undefined;
        }

        const states: any = {};
        root.forEachStoreDeep((store) => {
            if (store instanceof FullStore) {
                const { id, state } = store.getBlockStateJson();
                states[id] = state;
            } else if (store instanceof LazyStore) {
                Object.entries(store.getBlockStates()).forEach(([block, state]) => {
                    states[block] = state;
                });
            } else {
                throw new Error('AG Grid: Unsupported store type');
            }
        });
        return states;
    }

    public getRowIndexAtPixel(pixel: number): number {
        const rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }

        return rootStore.getRowIndexAtPixel(pixel)!;
    }

    public isEmpty(): boolean {
        return false;
    }

    public isRowsToRender(): boolean {
        return this.getRootStore() != null && this.getRowCount() > 0;
    }

    public getType(): RowModelType {
        return 'serverSide';
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    }

    public forEachNodeAfterFilterAndSort(
        callback: (node: RowNode, index: number) => void,
        includeFooterNodes = false
    ): void {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback, undefined, includeFooterNodes);
    }

    /** @return false if store hasn't started */
    public executeOnStore(route: string[], callback: (cache: IServerSideStore) => void): boolean {
        if (!this.started) {
            return false;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return true;
        }

        const storeToExecuteOn = rootStore.getChildStore(route);

        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
        return true;
    }

    public refreshStore(params: RefreshServerSideParams = {}): void {
        const route = params.route ? params.route : [];
        this.executeOnStore(route, (store) => store.refreshStore(params.purge == true));
    }

    public getStoreState(): ServerSideGroupLevelState[] {
        const res: ServerSideGroupLevelState[] = [];
        const rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const startIndex = firstInRange.rowIndex;
        const endIndex = lastInRange.rowIndex;

        if (startIndex === null && endIndex === null) {
            return [];
        }

        if (endIndex === null) {
            return firstInRange ? [firstInRange] : [];
        }

        if (startIndex === null) {
            return [lastInRange];
        }

        const nodeRange: RowNode[] = [];
        const [firstIndex, lastIndex] = [startIndex, endIndex].sort((a, b) => a - b);
        this.forEachNode((node) => {
            const thisRowIndex = node.rowIndex;
            if (thisRowIndex == null || node.stub) {
                return;
            }

            if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
                nodeRange.push(node);
            }
        });

        // don't allow range selection if we don't have the full range of rows
        if (nodeRange.length !== lastIndex - firstIndex + 1) {
            return firstInRange ? [firstInRange, lastInRange] : [];
        }

        return nodeRange;
    }

    public getRowNode(id: string): RowNode | undefined {
        let result: RowNode | undefined;
        this.forEachNode((rowNode) => {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    }

    public isRowPresent(rowNode: RowNode): boolean {
        const foundRowNode = this.getRowNode(rowNode.id!);
        return !!foundRowNode;
    }

    public setRowCount(rowCount: number, lastRowIndexKnown?: boolean): void {
        const rootStore = this.getRootStore();
        if (rootStore) {
            if (rootStore instanceof LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            _errorOnce('Infinite scrolling must be enabled in order to set the row count.');
        }
    }

    public override destroy(): void {
        this.destroyDatasource();
        this.destroyRootStore();
        super.destroy();
    }
}
