import type {
    AgColumn,
    BeanCollection,
    IColsService,
    IRowNode,
    ISelectionService,
    IServerSideStore,
    IsApplyServerSideTransactionParams,
    LoadSuccessParams,
    RowBounds,
    RowNode,
    ServerSideGroupLevelParams,
    ServerSideGroupLevelState,
    ServerSideTransaction,
    ServerSideTransactionResult,
    StoreRefreshAfterParams,
    WithoutGridCommon,
} from 'ag-grid-community';
import {
    BeanStub,
    ServerSideTransactionResultStatus,
    _getGrandTotalPinnedFloat,
    _getGrandTotalRow,
    _getGroupTotalRowCallback,
    _getRowHeightAsNumber,
    _getRowIdCallback,
} from 'ag-grid-community';

import { _createRowNodeFooter, _destroyRowNodeFooter } from '../../../aggregation/footerUtils';
import type { BlockUtils } from '../../blocks/blockUtils';
import type { SSRMParams } from '../../serverSideRowModel';
import type { StoreUtils } from '../storeUtils';
import type { HeldTransaction } from './lazyCache';
import { LazyCache } from './lazyCache';

export class LazyStore extends BeanStub implements IServerSideStore {
    private blockUtils: BlockUtils;
    private storeUtils: StoreUtils;
    private selectionSvc?: ISelectionService;
    private rowGroupColsSvc?: IColsService;

    public wireBeans(beans: BeanCollection) {
        this.blockUtils = beans.ssrmBlockUtils as BlockUtils;
        this.storeUtils = beans.ssrmStoreUtils as StoreUtils;
        this.selectionSvc = beans.selectionSvc;
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
    }

    // display indexes
    private displayIndexStart: number | undefined;
    private displayIndexEnd: number | undefined;

    // group positioning
    private topPx: number;
    private heightPx: number;

    // group details
    private readonly level: number;
    private readonly group: boolean;
    private readonly leafGroup: boolean;
    private readonly ssrmParams: SSRMParams;
    private readonly storeParams: ServerSideGroupLevelParams;
    private readonly parentRowNode: RowNode;
    private groupField: string | undefined;
    private rowGroupColumn: AgColumn;

    private readonly idSequence = { value: 0 };
    private cache: LazyCache;
    private readonly info: any;

    /** Raw data for the grand total row, kept even when grandTotalRow option is not set. */
    public grandTotalData: any;
    /** Whether the last display pass pinned the grand total, which then takes no row of this store. */
    private grandTotalPinned = false;

    constructor(ssrmParams: SSRMParams, storeParams: ServerSideGroupLevelParams, parentRowNode: RowNode) {
        super();
        this.ssrmParams = ssrmParams;
        this.parentRowNode = parentRowNode;
        this.storeParams = storeParams;
        this.level = parentRowNode.level + 1;
        this.group = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : false;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
        this.info = {};
    }

    public postConstruct() {
        let numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount() ?? 1;

            this.eventSvc.dispatchEventOnce({
                type: 'rowCountReady',
            });
        }
        this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, false, this.storeParams));

        const usingTreeData = this.gos.get('treeData');

        if (!usingTreeData && this.group && this.rowGroupColsSvc) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field!;
            this.rowGroupColumn = this.rowGroupColsSvc.columns[this.level];
        }
    }

    public override destroy(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.grandTotalData = undefined;
        this.destroyGrandTotalRow();
        this.destroyBean(this.cache);
        super.destroy();
    }

    /** Returns the grand total node if one exists (root store only). Accessed via parentRowNode.sibling. */
    public getGrandTotalNode(): RowNode | undefined {
        if (this.parentRowNode.level === -1) {
            const sibling = this.parentRowNode.sibling;
            if (sibling?.footer) {
                return sibling;
            }
        }
        return undefined;
    }

    private destroyGrandTotalRow(): void {
        const grandTotalNode = this.getGrandTotalNode();
        if (grandTotalNode) {
            this.parentRowNode.sibling = undefined as any;
            this.blockUtils.destroyRowNode(grandTotalNode);
        }
    }

    /**
     * Given a server response, ingest the rows outside of the data source lifecycle.
     *
     * @param rowDataParams the server response containing the rows to ingest
     * @param startRow the index to start ingesting rows
     * @param expectedRows the expected number of rows in the response (used to determine if the last row index is known)
     */
    applyRowData(rowDataParams: LoadSuccessParams, startRow: number, expectedRows: number) {
        this.cache.onLoadSuccess(startRow, expectedRows, rowDataParams);
    }

    /**
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {
        const idFunc = _getRowIdCallback(this.beans);
        if (!idFunc) {
            this.warn(206);
            return {
                status: ServerSideTransactionResultStatus.Cancelled,
            };
        }

        const applyCallback = this.gos.getCallback('isApplyServerSideTransaction');
        if (applyCallback) {
            const params: WithoutGridCommon<IsApplyServerSideTransactionParams> = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                groupLevelInfo: this.info,
            };
            const apply = applyCallback(params);
            if (!apply) {
                return { status: ServerSideTransactionResultStatus.Cancelled };
            }
        }

        const result = this.applyTransactionToCache(transaction);

        // The loading blocks may have been read before this transaction, so it is applied to them again when they load
        if (transaction.version != null && this.cache.isLoading()) {
            const ids = (nodes?: IRowNode[]) => new Set(nodes?.map((node) => node.id!));
            this.cache.holdTransaction(transaction, ids(result.add), ids(result.remove));
        }
        return result;
    }

    private applyTransactionToCache(transaction: ServerSideTransaction): ServerSideTransactionResult {
        const { version } = transaction;
        const unapplied: any[] = [];
        const update = this.cache.filterStaleRows(transaction.update, version, unapplied);
        const add = this.cache.filterStaleRows(transaction.add, version, unapplied);
        const remove = this.cache.filterStaleRows(transaction.remove, version, unapplied);

        // needs checked before transactions are applied, as rows won't be contiguous immediately
        // after
        const allRowsLoaded = this.cache.isStoreFullyLoaded();

        let updatedNodes: RowNode[] | undefined = undefined;
        if (update?.length) {
            updatedNodes = this.cache.updateRowNodes(update, version);
        }

        let insertedNodes: RowNode[] | undefined = undefined;
        if (add?.length) {
            let addIndex = transaction.addIndex;
            if (addIndex != null && addIndex < 0) {
                addIndex = undefined;
            }
            insertedNodes = this.cache.insertRowNodes(add, addIndex, version);
        }

        let removedNodes: RowNode[] | undefined = undefined;
        if (remove?.length) {
            const idFunc = _getRowIdCallback(this.beans)!;
            const allIdsToRemove = remove.map((data) =>
                idFunc({ level: this.level, parentKeys: this.parentRowNode.getRoute() ?? [], data })
            );
            const allUniqueIdsToRemove = [...new Set(allIdsToRemove)];
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove, transaction.rowCount);
        }

        if (version != null) {
            this.cache.advanceDataVersion(version);
        }

        const isClientSideSortingEnabled = this.gos.get('serverSideEnableClientSideSort');

        const isUpdateOrAdd = updatedNodes?.length || insertedNodes?.length;
        const isClientSideSort = allRowsLoaded && isClientSideSortingEnabled;
        if (isClientSideSort && isUpdateOrAdd) {
            // if client side sorting, we need to sort the rows after the transaction
            this.cache.clientSideSortRows();
        }

        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
            unapplied: unapplied.length ? unapplied : undefined,
        };
    }

    /**
     * Applies held transactions to a block read before them, in arrival order: updates and removes to the rows the
     * block loaded, and the rows they added that the block overwrote.
     */
    public replayTransactions(heldTransactions: HeldTransaction[], loadedIds: Set<string>): void {
        const { cache } = this;
        const inBlock = (rows?: any[]) => rows?.filter((data) => loadedIds.has(cache.getRowId(data)!));
        for (const { transaction, addedIds, removedIds } of heldTransactions) {
            const overwritten = transaction.add?.filter((data) => {
                const id = cache.getRowId(data)!;
                return addedIds.has(id) && !cache.isNodeInCache(id);
            });
            const result = this.applyTransactionToCache({
                version: transaction.version,
                addIndex: transaction.addIndex,
                add: overwritten,
                update: inBlock(transaction.update),
                remove: inBlock(transaction.remove),
            });
            const removedAgain = result.remove?.filter((node) => removedIds.has(node.id!)).length ?? 0;
            cache.uncountReplayedRows((result.add?.length ?? 0) - removedAgain);
        }
    }

    private updateSelectionAfterTransaction(updatedNodes?: RowNode[], removedNodes?: RowNode[]) {
        if (!this.selectionSvc) {
            return;
        }
        const nodesToDeselect: RowNode[] = [];
        for (const node of updatedNodes ?? []) {
            if (node.isSelected() && !node.selectable) {
                nodesToDeselect.push(node);
            }
        }

        for (const node of removedNodes ?? []) {
            if (node.isSelected()) {
                nodesToDeselect.push(node);
            }
        }

        if (nodesToDeselect.length) {
            this.selectionSvc.setNodesSelected({
                newValue: false,
                clearSelection: false,
                nodes: nodesToDeselect,
                source: 'rowDataChanged',
            });
        }
    }

    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getNodes().forEach((lazyNode) => this.blockUtils.clearDisplayIndex(lazyNode.node));

        if (this.parentRowNode.sibling) {
            this.blockUtils.clearDisplayIndex(this.parentRowNode.sibling);
        }
        this.cache.clearDisplayIndexes();
    }

    /**
     * @returns an index representing the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexStart(): number | undefined {
        return this.displayIndexStart;
    }

    /**
     * @returns the index representing one after the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexEnd(): number | undefined {
        return this.displayIndexEnd;
    }

    /**
     * @returns the virtual size of this store
     */
    getRowCount(): number {
        const rowCount = this.cache.getRowCount();
        return this.parentRowNode.sibling && !this.grandTotalPinned ? rowCount + 1 : rowCount;
    }

    /** How many rows this store holds, without its total row. */
    getChildRowCount(): number {
        return this.cache.getRowCount();
    }

    /**
     * Sets the current row count of the store, and whether the last row index is known
     */
    setRowCount(rowCount: number, isLastRowIndexKnown?: boolean): void {
        this.cache.setRowCount(rowCount, isLastRowIndexKnown);
    }

    /**
     * Given a display index, returns whether that row is within this store or a child store of this store
     *
     * @param displayIndex the visible index of a row
     * @returns whether or not the row exists within this store
     */
    isDisplayIndexInStore(displayIndex: number): boolean {
        if (this.getRowCount() === 0) {
            return false;
        }

        return this.displayIndexStart! <= displayIndex && displayIndex < this.getDisplayIndexEnd()!;
    }

    /**
     * Whether this store's rows have loaded and are empty, which shows no total row, so a total row option never
     * adds a row to an empty set. Read off the cache, as `getRowCount()` counts the total row.
     */
    private areRowsLoadedEmpty(): boolean {
        return this.cache.isLastRowIndexKnown() && this.cache.getRowCount() === 0;
    }

    /** The position of this store's group total row, or `undefined` when no total row should be shown. */
    private getGroupTotalRowPosition(): 'top' | 'bottom' | undefined {
        // the root store's total row is the grand total row, which is handled separately
        if (this.parentRowNode.level === -1 || this.areRowsLoadedEmpty()) {
            return undefined;
        }
        return _getGroupTotalRowCallback(this.gos)({ node: this.parentRowNode }) || undefined;
    }

    /**
     * Recursively sets up the display indexes and top position of every node belonging to this store.
     *
     * Called after a row height changes, or a store updated event.
     *
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq: { value: number }, nextRowTop: { value: number }, uiLevel: number): void {
        this.displayIndexStart = displayIndexSeq.value;
        this.topPx = nextRowTop.value;

        const footerNode = this.getGroupTotalRowPosition();
        if (!footerNode && this.parentRowNode.level > -1) {
            _destroyRowNodeFooter(this.parentRowNode);
        }

        if (footerNode === 'top') {
            this.blockUtils.setDisplayIndex(
                _createRowNodeFooter(this.parentRowNode, this.beans),
                displayIndexSeq,
                nextRowTop,
                uiLevel
            );
        }

        // Reconcile the grand total node and its pinned/inline placement. Root store only.
        // `inlineGrandTotal` is the node to display inline (top or bottom of root rows);
        // it stays undefined when the grand total is disabled or pinned.
        let inlineGrandTotalTop: RowNode | undefined;
        let inlineGrandTotalBottom: RowNode | undefined;
        if (this.parentRowNode.level === -1) {
            const grandTotalRow = _getGrandTotalRow(this.gos);
            let grandTotalNode = this.getGrandTotalNode();
            if (grandTotalRow && this.grandTotalData && !this.areRowsLoadedEmpty()) {
                grandTotalNode ??= this.cache.createOrUpdateGrandTotalNode(this.grandTotalData);
            } else if (grandTotalNode) {
                this.destroyGrandTotalRow();
                grandTotalNode = undefined;
            }

            this.beans.pinnedRowModel?.setGrandTotalNode(grandTotalNode);

            const grandTotalPinned = !!_getGrandTotalPinnedFloat(grandTotalRow);
            this.grandTotalPinned = grandTotalPinned;
            if (grandTotalNode) {
                if (grandTotalPinned) {
                    // Pinned grand totals don't take part in the inline display index;
                    // clear any stale index left from a previous inline placement.
                    this.blockUtils.clearDisplayIndex(grandTotalNode);
                } else if (grandTotalRow === 'top') {
                    inlineGrandTotalTop = grandTotalNode;
                } else if (grandTotalRow === 'bottom') {
                    inlineGrandTotalBottom = grandTotalNode;
                }
            }
        }

        if (inlineGrandTotalTop) {
            this.blockUtils.setDisplayIndex(inlineGrandTotalTop, displayIndexSeq, nextRowTop, uiLevel);
        }

        // delegate to the store to set the row display indexes
        this.cache.setDisplayIndexes(displayIndexSeq, nextRowTop, uiLevel);

        if (footerNode === 'bottom') {
            this.blockUtils.setDisplayIndex(
                _createRowNodeFooter(this.parentRowNode, this.beans),
                displayIndexSeq,
                nextRowTop,
                uiLevel
            );
        }

        if (inlineGrandTotalBottom) {
            this.blockUtils.setDisplayIndex(inlineGrandTotalBottom, displayIndexSeq, nextRowTop, uiLevel);
        }

        this.displayIndexEnd = displayIndexSeq.value;
        this.heightPx = nextRowTop.value - this.topPx;
    }

    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachStoreDeep(callback: (store: LazyStore, index: number) => void, sequence = { value: 0 }): void {
        callback(this, sequence.value++);
        this.cache.getNodes().forEach((lazyNode) => {
            const childCache = lazyNode.node.childStore as LazyStore | undefined;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    }

    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachNodeDeep(callback: (rowNode: RowNode<any>, index: number) => void, sequence = { value: 0 }): void {
        this.cache.getNodes().forEach((lazyNode) => {
            callback(lazyNode.node, sequence.value++);
            const childCache = lazyNode.node.childStore as LazyStore | undefined;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }

    public hasExpandableMasterRows(): boolean {
        return this.cache
            .getNodes()
            .some(({ node }) => (node.master && node.isExpandable()) || !!node.childStore?.hasExpandableMasterRows());
    }

    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeep
     */
    forEachNodeDeepAfterFilterAndSort(
        callback: (rowNode: RowNode<any>, index: number) => void,
        sequence = { value: 0 },
        includeFooterNodes = false
    ): void {
        // the node may not exist yet: `setDisplayIndexes` is what creates it
        const groupTotalPosition = this.getGroupTotalRowPosition();
        const groupTotalNode = this.parentRowNode.sibling;
        if (groupTotalPosition === 'top' && groupTotalNode) {
            callback(groupTotalNode, sequence.value++);
        }

        // Grand total at top
        const grandTotalPosition = this.parentRowNode.level === -1 ? _getGrandTotalRow(this.gos) : undefined;
        const grandTotalNode = this.getGrandTotalNode();
        if (grandTotalPosition === 'top' && grandTotalNode) {
            callback(grandTotalNode, sequence.value++);
        }

        const orderedNodes = this.cache.getOrderedNodeMap();
        for (const lazyNode of Object.values(orderedNodes)) {
            callback(lazyNode.node, sequence.value++);
            const childCache = lazyNode.node.childStore as LazyStore | undefined;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence, includeFooterNodes);
            }
        }

        if (groupTotalPosition === 'bottom' && groupTotalNode) {
            callback(groupTotalNode, sequence.value++);
        }

        // Grand total at bottom
        if (grandTotalPosition === 'bottom' && grandTotalNode) {
            callback(grandTotalNode, sequence.value++);
        }
    }

    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    retryLoads(): void {
        this.cache.getNodes().forEach(({ node }) => {
            if (node.failedLoad) {
                node.failedLoad = false;
                node.__needsRefreshWhenVisible = true;
                node.stub = true;
            }
        });
        this.forEachChildStoreShallow((store) => store.retryLoads());
        this.fireStoreUpdatedEvent();
    }

    /**
     * Given a display index, returns the row at that location.
     *
     * @param displayRowIndex the displayed index within the grid to search for
     * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
     */
    getRowUsingDisplayIndex(displayRowIndex: number): IRowNode<any> | undefined {
        if (displayRowIndex === this.parentRowNode.sibling?.rowIndex) {
            return this.parentRowNode.sibling;
        }
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    }

    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    getRowBounds(displayIndex: number): RowBounds | null {
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }

        const thisNode = this.cache.getNodeCachedByDisplayIndex(displayIndex);
        if (thisNode) {
            const boundsFromRow = this.blockUtils.extractRowBounds(thisNode, displayIndex);
            if (boundsFromRow) {
                return boundsFromRow;
            }
        }

        const { previousNode, nextNode } = this.cache.getSurroundingNodesByDisplayIndex(displayIndex) ?? {};

        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            const boundsFromRow = this.blockUtils.extractRowBounds(previousNode.node, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }

        const defaultRowHeight = _getRowHeightAsNumber(this.beans);
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            const numberOfRowDiff = (nextNode.node.rowIndex! - displayIndex) * defaultRowHeight;
            return {
                rowTop: nextNode.node.rowTop! - numberOfRowDiff,
                rowHeight: defaultRowHeight,
            };
        }

        // otherwise calculate from end of store
        const lastTop = this.topPx + this.heightPx;
        const numberOfRowDiff = (this.getDisplayIndexEnd()! - displayIndex) * defaultRowHeight;
        return {
            rowTop: lastTop - numberOfRowDiff,
            rowHeight: defaultRowHeight,
        };
    }

    /**
     * Given a vertical pixel, determines whether this store contains a row at that pixel
     *
     * @param pixel a vertical pixel position from the grid
     * @returns whether that pixel points to a virtual space belonging to this store
     */
    isPixelInRange(pixel: number): boolean {
        return pixel >= this.topPx && pixel < this.topPx + this.heightPx;
    }

    /**
     * Given a vertical pixel, returns the row existing at that pixel location
     *
     * @param pixel a vertical pixel position from the grid
     * @returns the display index at the given pixel location
     */
    getRowIndexAtPixel(pixel: number): number | null {
        if (pixel < this.topPx) {
            return this.getDisplayIndexStart()!;
        }

        if (pixel >= this.topPx + this.heightPx) {
            return this.getDisplayIndexEnd()! - 1;
        }

        if (
            this.parentRowNode.sibling &&
            pixel > this.parentRowNode.sibling.rowTop! &&
            pixel < this.parentRowNode.sibling.rowTop! + this.parentRowNode.sibling.rowHeight!
        ) {
            return this.parentRowNode.sibling.rowIndex!;
        }

        let distToPreviousNodeTop: number = Number.MAX_SAFE_INTEGER;
        let previousNode: RowNode | null = null;
        let distToNextNodeTop: number = Number.MAX_SAFE_INTEGER;
        let nextNode: RowNode | null = null;

        this.cache.getNodes().forEach(({ node }) => {
            const distBetween = Math.abs(pixel - node.rowTop!);

            // previous node
            if (node.rowTop! < pixel) {
                if (distBetween < distToPreviousNodeTop) {
                    distToPreviousNodeTop = distBetween;
                    previousNode = node;
                }
                return;
            }
            // next node
            if (distBetween < distToNextNodeTop) {
                distToNextNodeTop = distBetween;
                nextNode = node;
            }
        });

        // cast these back as typescript doesn't understand the forEach above
        previousNode = previousNode as RowNode | null;
        nextNode = nextNode as RowNode | null;

        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            const indexOfRow = this.blockUtils.getIndexAtPixel(previousNode, pixel);
            if (indexOfRow != null) {
                return indexOfRow;
            }
        }

        const defaultRowHeight = _getRowHeightAsNumber(this.beans);
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            const nextTop = nextNode.rowTop!;
            const numberOfRowDiff = Math.ceil((nextTop - pixel) / defaultRowHeight);
            return nextNode.rowIndex! - numberOfRowDiff;
        }

        // otherwise calculate from end of store
        const nextTop = this.topPx + this.heightPx;
        const numberOfRowDiff = Math.floor((nextTop - pixel) / defaultRowHeight);
        return this.getDisplayIndexEnd()! - numberOfRowDiff;
    }

    /**
     * Given a path of group keys, returns the child store for that group.
     *
     * @param keys the grouping path to the desired store
     * @returns the child store for the given keys, or null if not found
     */
    getChildStore(keys: string[]): LazyStore | null {
        return this.storeUtils.getChildStore(keys, this, (key: string) => {
            const lazyNode = this.cache.getNodes().find((lazyNode) => lazyNode.node.key == key);
            if (!lazyNode) {
                return null;
            }
            return lazyNode.node;
        });
    }

    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    private forEachChildStoreShallow(cb: (store: LazyStore) => void) {
        this.cache.getNodes().forEach(({ node }) => {
            if (node.childStore) {
                cb(node.childStore as LazyStore);
            }
        });
    }

    /**
     * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
     *
     * If a purge refresh occurs, the row count is preserved.
     *
     * @param params a set of properties pertaining to the sort changes
     */
    refreshAfterSort(params: StoreRefreshAfterParams) {
        const serverSortsAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (
            serverSortsAllLevels ||
            this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)
        ) {
            const allRowsLoaded = this.cache.isStoreFullyLoaded();
            const isClientSideSortingEnabled = this.gos.get('serverSideEnableClientSideSort');

            const isClientSideSort = allRowsLoaded && isClientSideSortingEnabled;
            if (!isClientSideSort) {
                // if last row index was known, add a row back for lazy loading.
                const oldCount = this.cache.getRowCount();
                const lastKnown = this.cache.isLastRowIndexKnown();
                const lastInferred = this.cache.isLastRowIndexInferred();
                this.destroyBean(this.cache);
                this.cache = this.createManagedBean(
                    new LazyCache(this, oldCount, lastKnown, this.storeParams, lastInferred)
                );
                return;
            }

            // client side sorting only handles one level, so allow it to pass through
            // to recursive sort.
            this.cache.clientSideSortRows();
        }

        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow((store) => store.refreshAfterSort(params));
    }

    /**
     * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
     *
     * If a refresh occurs, the row count is reset.
     *
     * @param params a set of properties pertaining to the filter changes
     */
    refreshAfterFilter(params: StoreRefreshAfterParams) {
        const serverFiltersAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
        if (
            serverFiltersAllLevels ||
            this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)
        ) {
            this.refreshStore(true);
            return;
        }

        // call refreshAfterFilter on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow((store) => store.refreshAfterFilter(params));
    }

    /**
     * Marks all existing nodes as requiring reloaded, and triggers a load check
     *
     * @param purge whether to remove all nodes and data in favour of stub nodes
     */
    refreshStore(purge: boolean) {
        if (purge) {
            this.grandTotalData = undefined;
            this.destroyGrandTotalRow();
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new LazyCache(this, 1, false, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }

        this.cache.markNodesForRefresh();
    }

    /**
     * Used for pagination, given a local/store index, returns the display index of that row
     *
     * @param topLevelIndex the store index of a row
     * @returns the display index for the given store index
     */
    getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const displayIndex = this.cache.getDisplayIndexFromStoreIndex(topLevelIndex);
        return displayIndex ?? topLevelIndex;
    }

    /**
     * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
     *
     * @returns whether the last index of this store is known, or if lazy loading still required
     */
    isLastRowIndexKnown(): boolean {
        return this.cache.isLastRowIndexKnown();
    }

    /**
     * Used by the selection service to select a range of nodes
     *
     * @param firstInRange the first node in the range to find
     * @param lastInRange the last node in the range to find
     * @returns a range of nodes between firstInRange and lastInRange inclusive
     */
    getRowNodesInRange(firstInRange: RowNode<any>, lastInRange: RowNode<any>): RowNode<any>[] {
        return this.cache
            .getNodes()
            .filter(({ node }) => {
                return node.rowIndex! >= firstInRange.rowIndex! && node.rowIndex! <= lastInRange.rowIndex!;
            })
            .map(({ node }) => node);
    }

    /**
     * Mutates a given array to add this stores state, and recursively add all the children store states.
     *
     * @param result a mutable results array
     */
    addStoreStates(result: ServerSideGroupLevelState[]) {
        result.push({
            route: this.parentRowNode.getRoute() ?? [],
            rowCount: this.getRowCount(),
            lastRowIndexKnown: this.isLastRowIndexKnown(),
            info: this.info,
            dataVersion: this.cache.getDataVersion(),
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize,
        });
        this.forEachChildStoreShallow((childStore) => childStore.addStoreStates(result));
    }

    public getIdSequence(): { value: number } {
        return this.idSequence;
    }

    public getParentNode() {
        return this.parentRowNode;
    }

    public getRowDetails() {
        return {
            field: this.groupField!,
            group: this.group,
            leafGroup: this.leafGroup,
            level: this.level,
            parent: this.parentRowNode,
            rowGroupColumn: this.rowGroupColumn,
        };
    }

    public getSsrmParams() {
        return this.ssrmParams;
    }

    public setStoreInfo(info: any) {
        if (info) {
            Object.assign(this.info, info);
        }
    }

    // gets called 1) row count changed 2) cache purged
    public fireStoreUpdatedEvent(): void {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        this.eventSvc.dispatchEvent({
            type: 'storeUpdated',
        });
    }

    // gets called when row data updated, and no more refreshing needed
    public fireRefreshFinishedEvent(): void {
        this.eventSvc.dispatchEvent({
            type: 'storeRefreshed',
            route: this.parentRowNode.getRoute(),
        });
    }

    public getBlockStates() {
        return this.cache.getBlockStates();
    }

    public getStoreBounds() {
        return {
            topPx: this.topPx,
            heightPx: this.heightPx,
        };
    }

    public getCache() {
        return this.cache;
    }

    public getFirstNode() {
        const firstNode = this.cache.getNodes().getBy('index', 0);
        return firstNode?.node ?? null;
    }
}
