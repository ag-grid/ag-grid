import {
    _,
    Autowired,
    Column,
    ColumnModel,
    Events,
    FilterManager,
    IServerSideStore,
    LoadSuccessParams,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowBounds,
    RowNode,
    RowNodeBlock,
    RowNodeBlockLoader,
    RowNodeSorter,
    SelectionChangedEvent,
    ServerSideGroupLevelParams,
    ServerSideGroupLevelState,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ServerSideTransactionResultStatus,
    SortController,
    StoreRefreshAfterParams,
    StoreUpdatedEvent,
    WithoutGridCommon,
    IsApplyServerSideTransactionParams
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
import { StoreUtils } from "./storeUtils";
import { BlockUtils } from "../blocks/blockUtils";
import { NodeManager } from "../nodeManager";
import { TransactionManager } from "../transactionManager";

export class FullStore extends RowNodeBlock implements IServerSideStore {

    @Autowired('ssrmStoreUtils') private storeUtils: StoreUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('rowNodeSorter') private rowNodeSorter: RowNodeSorter;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('ssrmTransactionManager') private transactionManager: TransactionManager;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;
    private readonly ssrmParams: SSRMParams;
    private readonly parentRowNode: RowNode;

    private nodeIdSequence: NumberSequence = new NumberSequence();

    private usingTreeData: boolean;

    private allRowNodes: RowNode[];
    private nodesAfterFilter: RowNode[];
    private nodesAfterSort: RowNode[];

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: { [id: string]: RowNode };

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string | undefined;

    private displayIndexStart: number | undefined;
    private displayIndexEnd: number | undefined;

    private topPx: number;
    private heightPx: number;

    private info: any = {};

    constructor(ssrmParams: SSRMParams, storeParams: ServerSideGroupLevelParams, parentRowNode: RowNode) {
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        super(0);
        this.ssrmParams = ssrmParams;
        this.parentRowNode = parentRowNode;
        this.level = parentRowNode.level + 1;
        this.groupLevel = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : undefined;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    private postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field!;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }

        this.initialiseRowNodes();

        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(() => this.rowNodeBlockLoader.removeBlock(this));
    }

    @PreDestroy
    private destroyRowNodes(): void {
        this.blockUtils.destroyRowNodes(this.allRowNodes);

        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
    }

    private initialiseRowNodes(loadingRowsCount = 1, failedLoad = false): void {
        this.destroyRowNodes();
        for (let i = 0; i < loadingRowsCount; i++) {
            const loadingRowNode = this.blockUtils.createRowNode(
                {
                    field: this.groupField, group: this.groupLevel!, leafGroup: this.leafGroup,
                    level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
                }
            );
            if (failedLoad) {
                loadingRowNode.failedLoad = true;
            }
            this.allRowNodes.push(loadingRowNode);
            this.nodesAfterFilter.push(loadingRowNode);
            this.nodesAfterSort.push(loadingRowNode);
        }
    }

    public getBlockStateJson(): { id: string, state: any } {
        return {
            id: this.nodeIdPrefix ? this.nodeIdPrefix : '',
            state: this.getState()
        };
    }

    protected loadFromDatasource(): void {
        this.storeUtils.loadFromDatasource({
            startRow: undefined,
            endRow: undefined,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    }

    public getStartRow(): number {
        return 0; // always zero as not in a cache
    }

    public getEndRow(): number {
        return this.nodesAfterSort.length;
    }

    private createDataNode(data: any, index?: number): RowNode {
        const rowNode = this.blockUtils.createRowNode(
            {
                field: this.groupField, group: this.groupLevel!, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
            }
        );

        if (index != null) {
            _.insertIntoArray(this.allRowNodes, rowNode, index);
        } else {
            this.allRowNodes.push(rowNode);
        }

        const defaultId = this.prefixId(this.nodeIdSequence.next());
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, undefined);
        this.nodeManager.addRowNode(rowNode);

        this.blockUtils.checkOpenByDefault(rowNode);

        this.allNodesMap[rowNode.id!] = rowNode;

        return rowNode;
    }

    private prefixId(id: number): string {
        if (this.nodeIdPrefix) {
            return this.nodeIdPrefix + '-' + id;
        } else {
            return id.toString();
        }
    }

    protected processServerFail(): void {
        this.initialiseRowNodes(1, true);
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    }

    protected processServerResult(params: LoadSuccessParams): void {
        if (!this.isAlive()) { return; }

        const info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }

        const nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : undefined;

        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};

        if (!params.rowData) {
            const message = 'AG Grid: "params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.';
            _.doOnce(() => console.warn(message, params), 'FullStore.noData');
        }

        this.createOrRecycleNodes(nodesToRecycle, params.rowData);

        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(_.getAllValuesInObject(nodesToRecycle));
        }

        this.filterAndSortNodes();
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    }

    private createOrRecycleNodes(nodesToRecycle?: { [id: string]: RowNode }, rowData?: any[]): void {
        if (!rowData) { return; }

        const lookupNodeToRecycle = (data: any): RowNode | undefined => {
            if (!nodesToRecycle) { return undefined; }

            const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
            if (!getRowIdFunc) { return undefined; }

            const parentKeys = this.parentRowNode.getGroupKeys();
            const level = this.level;
            const id = getRowIdFunc({
                data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level,
            });
            const foundNode = nodesToRecycle[id];
            if (!foundNode) { return undefined; }

            delete nodesToRecycle[id];
            return foundNode;
        };

        const recycleNode = (rowNode: RowNode, dataItem: any) => {
            this.allNodesMap[rowNode.id!] = rowNode;
            this.blockUtils.updateDataIntoRowNode(rowNode, dataItem);
            this.allRowNodes.push(rowNode);
        };

        rowData.forEach(dataItem => {
            const nodeToRecycle = lookupNodeToRecycle(dataItem);
            if (nodeToRecycle) {
                recycleNode(nodeToRecycle, dataItem);
            } else {
                this.createDataNode(dataItem);
            }
        });
    }

    private flushAsyncTransactions(): void {
        // we want to update the store with any outstanding transactions straight away,
        // as otherwise if waitTimeMillis is large (eg 5s), then the user could be looking
        // at old data for a few seconds before the transactions is applied, which isn't what
        // you would expect when we advertise 'transaction is applied when data is loaded'.
        // we do this in a timeout as flushAsyncTransactions expects the grid to be in a settled
        // state, not in the middle of loading rows! keeps the VM Turns more simple and deterministic.
        window.setTimeout(() => this.transactionManager.flushAsyncTransactions(), 0);
    }

    private filterAndSortNodes(): void {
        this.filterRowNodes();
        this.sortRowNodes();
    }

    private sortRowNodes(): void {
        const serverIsSorting = this.gridOptionsWrapper.isServerSideSortAllLevels() || this.gridOptionsWrapper.isServerSideSortOnServer();
        const sortOptions = this.sortController.getSortOptions();
        const noSortApplied = !sortOptions || sortOptions.length == 0;
        if (serverIsSorting || noSortApplied) {
            this.nodesAfterSort = this.nodesAfterFilter;
            return;
        }

        this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    }

    private filterRowNodes(): void {
        const serverIsFiltering = this.gridOptionsWrapper.isServerSideFilterAllLevels() || this.gridOptionsWrapper.isServerSideFilterOnServer();
        // filtering for InFullStore only works at lowest level details.
        // reason is the logic for group filtering was to difficult to work out how it should work at time of writing.
        const groupLevel = this.groupLevel;

        if (serverIsFiltering || groupLevel) {
            this.nodesAfterFilter = this.allRowNodes;
            return;
        }

        this.nodesAfterFilter = this.allRowNodes.filter(
            rowNode => this.filterManager.doesRowPassFilter({ rowNode: rowNode })
        );
    }

    public clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.allRowNodes.forEach(rowNode => this.blockUtils.clearDisplayIndex(rowNode));
    }

    public getDisplayIndexEnd(): number | undefined {
        return this.displayIndexEnd;
    }

    public isDisplayIndexInStore(displayIndex: number): boolean {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart! && displayIndex < this.displayIndexEnd!;
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;

        const visibleNodeIds: { [id: string]: boolean } = {};

        // set on all visible nodes
        this.nodesAfterSort.forEach(rowNode => {
            this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop);
            visibleNodeIds[rowNode.id!] = true;
        });

        // and clear on all non-visible nodes
        this.allRowNodes.forEach(rowNode => {
            if (!visibleNodeIds[rowNode.id!]) {
                this.blockUtils.clearDisplayIndex(rowNode);
            }
        });

        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.allRowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }

    public forEachNodeDeepAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.nodesAfterSort.forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    }

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | undefined {
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) { return undefined; }

        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
        return res;
    }

    public getRowBounds(index: number): RowBounds | null {
        for (let i = 0; i < this.nodesAfterSort.length; i++) {
            const rowNode = this.nodesAfterSort[i];
            const res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) { return res; }
        }

        return null;
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    }

    public getRowIndexAtPixel(pixel: number): number | null {

        // if pixel before block, return first row
        const pixelBeforeThisStore = pixel <= this.topPx;
        if (pixelBeforeThisStore) {
            const firstNode = this.nodesAfterSort[0];
            return firstNode.rowIndex!;
        }
        // if pixel after store, return last row, however the last
        // row could be a child store
        const pixelAfterThisStore = pixel >= (this.topPx + this.heightPx);
        if (pixelAfterThisStore) {
            const lastRowNode = this.nodesAfterSort[this.nodesAfterSort.length - 1];
            const lastRowNodeBottomPx = lastRowNode.rowTop! + lastRowNode.rowHeight!;

            if (pixel >= lastRowNodeBottomPx && lastRowNode.expanded) {
                if (lastRowNode.childStore && lastRowNode.childStore.getRowCount() > 0) {
                    return lastRowNode.childStore.getRowIndexAtPixel(pixel);
                }
                if (lastRowNode.detailNode) {
                    return lastRowNode.detailNode.rowIndex;
                }
            }

            return lastRowNode.rowIndex;
        }

        let res: number | null = null;
        this.nodesAfterSort.forEach(rowNode => {
            const res2 = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res2 != null) {
                res = res2;
            }
        });

        const pixelIsPastLastRow = res == null;

        if (pixelIsPastLastRow) {
            return this.displayIndexEnd! - 1;
        }

        return res;
    }

    public getChildStore(keys: string[]): IServerSideStore | null {
        return this.storeUtils.getChildStore(keys, this, (key: string) => {
            const rowNode = this.allRowNodes.find(currentRowNode => {
                return currentRowNode.key == key;
            });

            return rowNode!;
        });
    }

    private forEachChildStoreShallow(callback: (childStore: IServerSideStore) => void): void {
        this.allRowNodes.forEach(rowNode => {
            const childStore = rowNode.childStore;
            if (childStore) {
                callback(childStore);
            }
        });
    }

    public refreshAfterFilter(params: StoreRefreshAfterParams): void {
        const serverIsFiltering = this.gridOptionsWrapper.isServerSideFilterOnServer();
        const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        const serverIsFilteringAllLevels = this.gridOptionsWrapper.isServerSideFilterAllLevels();
        if (serverIsFilteringAllLevels || (serverIsFiltering && storeIsImpacted)) {
            this.refreshStore(true);
            this.sortRowNodes();
            return;
        }

        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(store => store.refreshAfterFilter(params));
    }

    public refreshAfterSort(params: StoreRefreshAfterParams): void {
        const serverIsSorting = this.gridOptionsWrapper.isServerSideSortOnServer();
        const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        const serverIsSortingAllLevels = this.gridOptionsWrapper.isServerSideSortAllLevels();
        if (serverIsSortingAllLevels || (serverIsSorting && storeIsImpacted)) {
            this.refreshStore(true);
            this.filterRowNodes();
            return;
        }

        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(store => store.refreshAfterSort(params));
    }

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {

        // we only apply transactions to loaded state
        switch (this.getState()) {
            case RowNodeBlock.STATE_FAILED:
                return { status: ServerSideTransactionResultStatus.StoreLoadingFailed };
            case RowNodeBlock.STATE_LOADING:
                return { status: ServerSideTransactionResultStatus.StoreLoading };
            case RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: ServerSideTransactionResultStatus.StoreWaitingToLoad };
        }

        const applyCallback = this.gridOptionsWrapper.getIsApplyServerSideTransactionFunc();
        if (applyCallback) {
            const params: WithoutGridCommon<IsApplyServerSideTransactionParams> = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                storeInfo: this.info,
                groupLevelInfo: this.info
            };
            const apply = applyCallback(params);
            if (!apply) {
                return { status: ServerSideTransactionResultStatus.Cancelled };
            }
        }

        const res: ServerSideTransactionResult = {
            status: ServerSideTransactionResultStatus.Applied,
            remove: [],
            update: [],
            add: []
        };

        const nodesToUnselect: RowNode[] = [];

        this.executeAdd(transaction, res);
        this.executeRemove(transaction, res, nodesToUnselect);
        this.executeUpdate(transaction, res, nodesToUnselect);

        this.filterAndSortNodes();

        this.updateSelection(nodesToUnselect);

        return res;
    }

    private updateSelection(nodesToUnselect: RowNode[]): void {
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(rowNode => {
                rowNode.setSelected(false, false, true);
            });

            const event: SelectionChangedEvent = {
                type: Events.EVENT_SELECTION_CHANGED,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!
            };
            this.eventService.dispatchEvent(event);
        }
    }

    private executeAdd(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult): void {
        const { add, addIndex } = rowDataTran;
        if (_.missingOrEmpty(add)) { return; }

        const useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add!.reverse().forEach(item => {
                const newRowNode: RowNode = this.createDataNode(item, addIndex);
                rowNodeTransaction.add!.push(newRowNode);
            });
        } else {
            add!.forEach(item => {
                const newRowNode: RowNode = this.createDataNode(item);
                rowNodeTransaction.add!.push(newRowNode);
            });
        }
    }

    private executeRemove(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult, nodesToUnselect: RowNode[]): void {
        const { remove } = rowDataTran;

        if (remove == null) { return; }

        const rowIdsRemoved: { [key: string]: boolean } = {};

        remove.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();

            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id!] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id!];

            rowNodeTransaction.remove!.push(rowNode);

            this.nodeManager.removeNode(rowNode);
        });

        this.allRowNodes = this.allRowNodes.filter(rowNode => !rowIdsRemoved[rowNode.id!]);
    }

    private executeUpdate(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult, nodesToUnselect: RowNode[]): void {
        const { update } = rowDataTran;
        if (update == null) { return; }

        update.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            rowNodeTransaction.update!.push(rowNode);
        });
    }

    private lookupRowNode(data: any): RowNode | null {
        const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();

        let rowNode: RowNode;
        if (getRowIdFunc != null) {
            // find rowNode using id
            const level = this.level;
            const parentKeys = this.parentRowNode.getGroupKeys();
            const id: string = getRowIdFunc({
                data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level,
            });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.allRowNodes.find(currentRowNode => currentRowNode.data === data)!;
            if (!rowNode) {
                console.error(`AG Grid: could not find data item as object was not found`, data);
                return null;
            }
        }

        return rowNode;
    }

    public addStoreStates(result: ServerSideGroupLevelState[]): void {
        result.push({
            infiniteScroll: false,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.allRowNodes.length,
            info: this.info
        });
        this.forEachChildStoreShallow(childStore => childStore.addStoreStates(result));
    }

    public refreshStore(purge: boolean): void {
        if (purge) {
            const loadingRowsToShow = this.nodesAfterSort ? this.nodesAfterSort.length : 1;
            this.initialiseRowNodes(loadingRowsToShow);
        }
        this.scheduleLoad();
        this.fireStoreUpdatedEvent();
    }

    public retryLoads(): void {
        if (this.getState() === RowNodeBlock.STATE_FAILED) {
            this.initialiseRowNodes(1);
            this.scheduleLoad();
        }

        this.forEachChildStoreShallow(store => store.retryLoads());
    }

    private scheduleLoad(): void {
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    private fireStoreUpdatedEvent(): void {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        const event: StoreUpdatedEvent = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }

    public getRowCount(): number {
        return this.nodesAfterSort.length;
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const rowNode = this.nodesAfterSort[topLevelIndex];
        return rowNode.rowIndex!;
    }

    public isLastRowIndexKnown(): boolean {
        return this.getState() == RowNodeBlock.STATE_LOADED;
    }

    public getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const result: RowNode[] = [];

        let inActiveRange = false;

        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }

        this.nodesAfterSort.forEach(rowNode => {
            const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
            if (inActiveRange || hitFirstOrLast) {
                result.push(rowNode);
            }

            if (hitFirstOrLast) {
                inActiveRange = !inActiveRange;
            }
        });

        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = inActiveRange;
        return invalidRange ? [] : result;
    }

}