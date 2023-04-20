import { Autowired, BeanStub, FocusService, GridApi, LoadSuccessParams, NumberSequence, PostConstruct, PreDestroy, RowNode, IRowNode, ServerSideGroupLevelParams, GetRowIdFunc, WithoutGridCommon, GetRowIdParams } from "@ag-grid-community/core";
import { BlockUtils } from "../../blocks/blockUtils";
import { NodeManager } from "../../nodeManager";
import { LazyStore } from "./lazyStore";
import { LazyBlockLoader } from "./lazyBlockLoader";
import { MultiIndexMap } from "./multiIndexMap";

interface LazyStoreNode {
    id: string;
    index: number;
    node: RowNode;
};

export class LazyCache extends BeanStub {
    @Autowired('gridApi') private api: GridApi;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;

    /**
     * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
     */
    private live = true;

    /**
     * A node map indexed by the node's id, index, and node.
     */
    private nodeMap: MultiIndexMap<LazyStoreNode>;

    /**
     * A map of nodes indexed by the display index.
     */
    private nodeDisplayIndexMap: Map<number, RowNode>;

    /**
     * A set of nodes waiting to be refreshed
     */
    private nodesToRefresh: Set<RowNode>;

    /**
     * A list of display indexes bounds which are not currently present in this store, this can be due to;
     * - Row stub hasn't been generated yet
     * - Display index belongs to a child store
     * - Display index is a detail node
     * 
     *    (Note, this is not always up to date, as stub nodes being generated do not refresh this, however
     *     this is a non issue as stub nodes are only ever default height and occupy 1 display index)
     */
    private skippedDisplayIndexes: { from: number, to: number }[];

    /**
     * End of store properties
     */
    private numberOfRows: number;
    private isLastRowKnown: boolean;

    /**
     * The prefix to use for node ids, this is used to ensure that node ids are unique across stores
     */
    private defaultNodeIdPrefix: string | undefined;

    /**
     * Sibling services - 1-1 relationships.
     */
    private store: LazyStore;
    private rowLoader: LazyBlockLoader;
    private storeParams: ServerSideGroupLevelParams;

    /**
     * Grid options properties - stored locally for access speed.
     */
    private getRowIdFunc?: ((params: WithoutGridCommon<GetRowIdParams<any, any>>) => string);
    private isMasterDetail: boolean;

    constructor(store: LazyStore, numberOfRows: number, storeParams: ServerSideGroupLevelParams) {
        super();
        this.store = store;
        this.numberOfRows = numberOfRows;
        this.isLastRowKnown = false;
        this.storeParams = storeParams;
    }

    @PostConstruct
    private init() {
        // initiate the node map to be indexed at 'index', 'id' and 'node' for quick look-up.
        // it's important id isn't first, as stub nodes overwrite each-other, and the first index is
        // used for iteration.
        this.nodeMap = new MultiIndexMap('index', 'id', 'node');

        this.nodeDisplayIndexMap = new Map();
        this.nodesToRefresh = new Set();

        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
        this.getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        this.isMasterDetail = this.gridOptionsService.isMasterDetail();
    }

    @PreDestroy
    private destroyRowNodes() {
        this.numberOfRows = 0;
        this.nodeMap.forEach(node => this.blockUtils.destroyRowNode(node.node));
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    }

    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    public getRowByDisplayIndex(displayIndex: number): IRowNode | undefined {
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }


        // first try to directly look this node up in the display index map
        const node = this.nodeDisplayIndexMap.get(displayIndex);
        if (node) {
            // if we have the node, check if it needs refreshed when rendered
            if (node.stub || node.__needsRefreshWhenVisible) {
                this.rowLoader.queueLoadCheck();
            }
            return node;
        }

        // next check if this is the first row, if so return a stub node
        // this is a performance optimisation, as it is the most common scenario
        // and enables the node - 1 check to kick in more often.
        if (displayIndex === this.store.getDisplayIndexStart()) {
            return this.createStubNode(0, displayIndex);
        }

        // check if the row immediately prior is available in the store
        const contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
        if (contiguouslyPreviousNode) {
            // if previous row is master detail, and expanded, this node must be detail
            if (this.isMasterDetail && contiguouslyPreviousNode.master && contiguouslyPreviousNode.expanded) {
                return contiguouslyPreviousNode.detailNode;
            }

            // if previous row is expanded group, this node will belong to that group.
            if (contiguouslyPreviousNode.expanded && contiguouslyPreviousNode.childStore?.isDisplayIndexInStore(displayIndex)) {
                return contiguouslyPreviousNode.childStore?.getRowUsingDisplayIndex(displayIndex);
            }

            // otherwise, row must be a stub node
            const lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode)!;
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }

        const adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);

        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd()! - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }

        const {previousNode, nextNode} = adjacentNodes;

        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.expanded && previousNode.childStore?.isDisplayIndexInStore(displayIndex)) {
            return previousNode.childStore?.getRowUsingDisplayIndex(displayIndex);
        }

        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            const nextSimpleRowStoreIndex = this.nodeMap.getBy('node', nextNode)!;
            const displayIndexDiff = nextNode.rowIndex! - displayIndex;
            const newStoreIndex = nextSimpleRowStoreIndex.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }

        // if no next node, calculate from end index of this store
        const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd()! - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
    }

    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    private createStubNode(storeIndex: number, displayIndex: number): RowNode {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        const rowBounds = this.store.getRowBounds(displayIndex!);
        const newNode = this.createRowAtIndex(storeIndex, null, node => {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds!.rowTop);
            this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    }

    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    public getRowByStoreIndex(index: number) {
        return this.nodeMap.getBy('index', index)?.node;
    }

    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    private skipDisplayIndexes(numberOfRowsToSkip: number, displayIndexSeq: NumberSequence, nextRowTop: { value: number; }) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // these are recorded so that the previous node can be found more quickly when a node is missing
        this.skippedDisplayIndexes.push({
            from: displayIndexSeq.peek(),
            to: displayIndexSeq.peek() + numberOfRowsToSkip
        });
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    }

    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    public setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number; }): void {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        this.skippedDisplayIndexes = [];

        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        const orderedMap: {[key: number]: RowNode} = {};
        this.nodeMap.forEach(lazyNode => {
            orderedMap[lazyNode.index] = lazyNode.node;
        });

        let lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node. When display indexes
        // are skipped, they're added to the skippedDisplayIndexes array
        for (const stringIndex in orderedMap) {
            const node = orderedMap[stringIndex];
            const numericIndex = Number(stringIndex);

            // if any nodes aren't currently in the store, skip the display indexes too
            const numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);


            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex!, node);
            const passedRows = displayIndexSeq.peek() - node.rowIndex!;
            if (passedRows > 1) {
                this.skippedDisplayIndexes.push({
                    from: node.rowIndex! + 1,
                    to: displayIndexSeq.peek()
                });
            }



            // store this index for skipping after this
            lastIndex = numericIndex;
        }

        // need to skip rows until the end of this store
        const numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);

        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    }

    public getRowCount(): number {
        return this.numberOfRows;
    }
    
    setRowCount(rowCount: number, isLastRowIndexKnown?: boolean): void {
        if (rowCount < 0) {
            throw new Error('AG Grid: setRowCount can only accept a positive row count.');
        }

        this.numberOfRows = rowCount;

        if (isLastRowIndexKnown != null) {
            this.isLastRowKnown = isLastRowIndexKnown;

            if (isLastRowIndexKnown === false) {
                this.numberOfRows += 1;
            }
        }

        this.fireStoreUpdatedEvent();
    }

    public getNodes() {
        return this.nodeMap;
    }

    public getNodeCachedByDisplayIndex(displayIndex: number): RowNode | null {
        return this.nodeDisplayIndexMap.get(displayIndex) ?? null;
    }

    public getNodesToRefresh(): Set<RowNode> {
        return this.nodesToRefresh;
    }

    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    public getSurroundingNodesByDisplayIndex(displayIndex: number) {
        // iterate over the skipped display indexes to find the bound this display index belongs to
        for (let i in this.skippedDisplayIndexes) {
            const skippedRowBound = this.skippedDisplayIndexes[i];
            if (skippedRowBound.from <= displayIndex && skippedRowBound.to >= displayIndex) {
                // take the node before and after the boundary and return those
                const previousNode = this.nodeDisplayIndexMap.get(skippedRowBound.from - 1);
                const nextNode = this.nodeDisplayIndexMap.get(skippedRowBound.to + 1);
                return { previousNode, nextNode };
            }
        }
        return null;
    }

    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    public getDisplayIndexFromStoreIndex(storeIndex: number): number | null {
        const nodesAfterThis = this.nodeMap.filter(lazyNode => lazyNode.index > storeIndex);

        if (nodesAfterThis.length === 0) {
            return this.store.getDisplayIndexEnd()! - (this.numberOfRows - storeIndex);
        }

        let nextNode: LazyStoreNode | undefined;
        for (let i = 0; i < nodesAfterThis.length; i++) {
            const lazyNode = nodesAfterThis[i];
            if (nextNode == null || nextNode.index > lazyNode.index) {
                nextNode = lazyNode;
            }
        }

        const nextDisplayIndex = nextNode!.node.rowIndex!;
        const storeIndexDiff = nextNode!.index - storeIndex;
        return nextDisplayIndex - storeIndexDiff;
    }

    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with 
     * @returns the new row node
     */
    private createRowAtIndex(atStoreIndex: number, data?: any, createNodeCallback?: (node: RowNode) => void): RowNode {
        // make sure an existing node isn't being overwritten
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);

        // if node already exists, update it or destroy it
        if (lazyNode) {
            const { node } = lazyNode;
            this.nodesToRefresh.delete(node);
            node.__needsRefreshWhenVisible = false;

            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                return node;
            }

            // if there's no id and this is an open group, protect this node from changes
            if (this.getRowIdFunc == null && node.group && node.expanded) {
                return node;
            }

            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }

        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            const id = this.getRowId(data);

            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode);

                const { node, index } = lazyNode;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id!,
                    node,
                    index: atStoreIndex
                });

                // mark all of the old block as needsVerify to trigger it for a refresh, as nodes
                // should not be out of place
                this.markBlockForVerify(index);

                return node;
            }
        }

        // node doesn't exist, create a new one
        const newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            const defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
        }

        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeMap.set({
            id: newNode.id!,
            node: newNode,
            index: atStoreIndex,
        });

        if (createNodeCallback) {
            createNodeCallback(newNode);
        }

        return newNode;
    }

    public getBlockStates() {
        const blockCounts: { [key: string]: number } = {};
        const blockStates: { [key: string]: Set<string> } = {};
        const dirtyBlocks = new Set<number>();

        this.nodeMap.forEach(({ node, index }) => {
            const blockStart = this.rowLoader.getBlockStartIndexForIndex(index);

            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = (blockCounts[blockStart] ?? 0) + 1;
            }

            let rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            } else if (this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            } else if (this.nodesToRefresh.has(node)) {
                rowState = 'needsLoading';
            }
            
            if (node.__needsRefreshWhenVisible || node.stub) {
                dirtyBlocks.add(blockStart);
            }

            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set<string>();
            }
            blockStates[blockStart].add(rowState);
        });

        const statePriorityMap: { [key: string]: number } = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };

        const blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());

        const results: { [key: string]: any } = {};
        Object.entries(blockStates).forEach(([blockStart, uniqueStates]) => {
            const sortedStates = [...uniqueStates].sort((a, b) => (statePriorityMap[a] ?? 0) - (statePriorityMap[b] ?? 0));
            const priorityState = sortedStates[0];

            const blockNumber = Number(blockStart) / this.rowLoader.getBlockSize();

            const blockId = blockPrefix ? `${blockPrefix}-${blockNumber}` : String(blockNumber);
            results[blockId] = {
                blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: blockCounts[blockStart] ?? 0,
            };
        });
        return results;
    }

    public destroyRowAtIndex(atStoreIndex: number) {
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        if (!lazyNode) { return; }

        this.nodeMap.delete(lazyNode);
        
        this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex!);
        this.nodesToRefresh.delete(lazyNode.node);
        
        this.blockUtils.destroyRowNode(lazyNode.node);
    }

    public getSsrmParams() {
        return this.store.getSsrmParams();
    }

    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    private getPrefixedId(id: number): string {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        } else {
            return id.toString();
        }
    }

    private markBlockForVerify(rowIndex: number) {
        const [start, end] = this.rowLoader.getBlockBoundsForIndex(rowIndex);
        const lazyNodesInRange = this.nodeMap.filter((lazyNode) => lazyNode.index >= start && lazyNode.index < end);
        lazyNodesInRange.forEach(({ node }) => {
            node.__needsRefreshWhenVisible = true;
        });
    }

    private doesNodeMatch(data: any, node: RowNode): boolean {
        if (node.stub) {
            return false;
        }

        if (this.getRowIdFunc != null) {
            const id: string = this.getRowId(data)!;
            return node.id === id;
        }
        return node.data === data;
    }

    /**
     * Deletes any stub nodes not within the given range
     */
    public purgeStubsOutsideOfViewport() {
        const firstRow = this.api.getFirstDisplayedRow();
        const lastRow = this.api.getLastDisplayedRow();
        const firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        const [_, lastRowBlockEnd] = this.rowLoader.getBlockBoundsForIndex(lastRow);

        this.nodeMap.forEach(lazyNode => {
            if (this.rowLoader.isRowLoading(lazyNode.index)) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                this.destroyRowAtIndex(lazyNode.index);
            }
        });
    }

    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks 
     */
    private getNumberOfRowsToRetain(firstRow: number, lastRow: number): number | null {
        const numberOfCachedBlocks = this.storeParams.maxBlocksInCache;
        if (numberOfCachedBlocks == null) {
            return null;
        }
    
        const blockSize = this.rowLoader.getBlockSize();
        const numberOfViewportBlocks = Math.ceil((lastRow - firstRow) / blockSize);
        const numberOfBlocksToRetain = Math.max(numberOfCachedBlocks, numberOfViewportBlocks);
        const numberOfRowsToRetain = numberOfBlocksToRetain * blockSize;
        return numberOfRowsToRetain;
    }

    private getBlocksDistanceFromRow(nodes: LazyStoreNode[], otherDisplayIndex: number) {
        const blockDistanceToMiddle: { [key: number]: number } = {};
        nodes.forEach(({ node, index }) => {
            const [blockStart, blockEnd] = this.rowLoader.getBlockBoundsForIndex(index);
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            const distStart = Math.abs(node.rowIndex! - otherDisplayIndex);
            let distEnd;
            // may not have an end node if the block came back small 
            const lastLazyNode = this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode) distEnd = Math.abs(lastLazyNode.node.rowIndex! - otherDisplayIndex);
            const farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;

            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    }

    private purgeExcessRows() {
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();

        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        const firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRowInViewport);
        const [_, lastRowBlockEnd] = this.rowLoader.getBlockBoundsForIndex(lastRowInViewport);

        // number of blocks to cache on top of the viewport blocks
        let numberOfRowsToRetain = this.getNumberOfRowsToRetain(firstRowBlockStart, lastRowBlockEnd);
        if (this.store.getDisplayIndexEnd() == null || numberOfRowsToRetain == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }

        // don't check the nodes that could have been cached out of necessity
        const disposableNodes = this.nodeMap.filter(({ node }) => !node.stub && !this.isNodeCached(node));
        if (disposableNodes.length <= numberOfRowsToRetain) {
            // not enough rows to bother clearing any
            return;
        }

        const disposableNodesNotInViewport = disposableNodes.filter(({ node }) => {
            const startRowNum = node.rowIndex;

            if (startRowNum == null || startRowNum === -1) {
                // row is not displayed and can be disposed
                return true;
            }
    
            if (firstRowBlockStart <= startRowNum && startRowNum < lastRowBlockEnd) {
                // start row in viewport, block is in viewport
                return false;
            }

            const lastRowNum = startRowNum + blockSize;
            if (firstRowBlockStart <= lastRowNum && lastRowNum < lastRowBlockEnd) {
                // end row in viewport, block is in viewport
                return false;
            }

            if (startRowNum < firstRowBlockStart && lastRowNum >= lastRowBlockEnd) {
                // full block surrounds in viewport
                return false;
            }

            // block does not appear in viewport and can be disposed
            return true;
        });

        // reduce the number of rows to retain by the number in viewport which were retained
        numberOfRowsToRetain = numberOfRowsToRetain - (disposableNodes.length - disposableNodesNotInViewport.length);

        if (!disposableNodesNotInViewport.length) {
            return;
        }

        const midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        const blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodesNotInViewport, midViewportRow);

        const blockSize = this.rowLoader.getBlockSize();
        const numberOfBlocksToRetain = Math.ceil(numberOfRowsToRetain / blockSize);
        if (blockDistanceArray.length <= numberOfBlocksToRetain) {
            return;
        }

        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort((a, b) => Math.sign(b[1] - a[1]));
        const blocksToRemove = blockDistanceArray.length - Math.max(numberOfBlocksToRetain, 0);
        for (let i = 0; i < blocksToRemove; i++) {
            const blockStart = Number(blockDistanceArray[i][0]);
            for (let x = blockStart; x < blockStart + blockSize; x++) {
                const lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    }

    private isNodeFocused(node: RowNode): boolean {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) { return false; }
        if (focusedCell.rowPinned != null) { return false; }

        const hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    }

    private isNodeCached(node: RowNode): boolean {
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    }

    private extractDuplicateIds(rows: any[]) {
        if (!this.getRowIdFunc == null) {
            return [];
        }

        const newIds = new Set();
        const duplicates = new Set();
        rows.forEach(data => {
            const id = this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });

        return [...duplicates];
    }

    public onLoadSuccess(firstRowIndex: number, numberOfRowsExpected: number, response: LoadSuccessParams) {
        if (!this.live) return;

        if (this.getRowIdFunc != null) {
            const duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                const duplicateIdText = duplicates.join(', ');
                console.warn(`AG Grid: Unable to display rows as duplicate row ids (${duplicateIdText}) were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.`);
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        
        const wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach((data, responseRowIndex) => {
            const rowIndex = firstRowIndex + responseRowIndex;
            const nodeFromCache = this.nodeMap.getBy('index', rowIndex);
        
            // if stub, overwrite
            if (nodeFromCache?.node?.stub) {
                this.createRowAtIndex(rowIndex, data);
                return;
            }

            if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache.node)) {
                this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            this.createRowAtIndex(rowIndex, data);
        });

        const finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }

        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        } else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        } else if (!this.isLastRowKnown) {
            // add 1 for loading row, as we don't know the last row
            const lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }

        if (this.isLastRowKnown) {
            // delete any rows after the last index
            const lazyNodesAfterStoreEnd = this.nodeMap.filter(lazyNode => lazyNode.index >= this.numberOfRows);
            lazyNodesAfterStoreEnd.forEach(lazyNode => this.destroyRowAtIndex(lazyNode.index));
        }

        this.fireStoreUpdatedEvent();
    }

    public fireRefreshFinishedEvent() {
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }

        this.store.fireRefreshFinishedEvent();
    }

    public isLastRowIndexKnown() {
        return this.isLastRowKnown;
    }

    public onLoadFailed(firstRowIndex: number, numberOfRowsExpected: number) {
        if (!this.live) return;
        const failedNodes = this.nodeMap.filter(node => node.index >= firstRowIndex && node.index < firstRowIndex + numberOfRowsExpected);
        failedNodes.forEach(node => node.node.failedLoad = true);

        this.fireStoreUpdatedEvent();
    }

    public markNodesForRefresh() {
        this.nodeMap.forEach(lazyNode => {
            if (lazyNode.node.stub) {
                return;
            }
            this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();

        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    }

    public isNodeInCache(id: string): boolean {
        return !!this.nodeMap.getBy('id', id);
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    private fireStoreUpdatedEvent(): void {
        if (!this.live) { return; }

        this.store.fireStoreUpdatedEvent();
    }

    private getRowId(data: any) {
        if (this.getRowIdFunc == null) {
            return null;
        }

        // find rowNode using id
        const { level } = this.store.getRowDetails();
        const parentKeys = this.store.getParentNode().getGroupKeys();
        const id: string = this.getRowIdFunc({
            data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level,
        });
        return String(id);
    }

    public updateRowNodes(updates: any[]): RowNode[] {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        
        const updatedNodes: RowNode[] = [];
        updates.forEach(data => {
            const id: string = this.getRowId(data)!;
            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    }

    public insertRowNodes(inserts: any[], indexToAdd?: number): RowNode[] {
        // if missing and we know the last row, we're inserting at the end
        const addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;

        // can't insert nodes past the end of the store
        if(addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }

        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }

        const uniqueInsertsMap: { [id: string]: any } = {};
        
        inserts.forEach(data => {
            const dataId = this.getRowId(data)!;
            if (dataId && this.isNodeInCache(dataId)) {
                return;
            }
            
            uniqueInsertsMap[dataId] = data;
        });

        const uniqueInserts = Object.values(uniqueInsertsMap);

        let numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }

        const nodesToMove = this.nodeMap.filter(node => node.index >= addIndex);
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(lazyNode => this.nodeMap.delete(lazyNode));
        // then move the nodes to their new locations
        nodesToMove.forEach(lazyNode => {
            this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
                    
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;

        // finally insert the new rows
        return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
    }

    public getOrderedNodeMap() {
        const obj: { [key: number]: LazyStoreNode } = {};
        this.nodeMap.forEach(node => obj[node.index] = node);
        return obj;
    }

    public clearDisplayIndexes() {
        this.nodeDisplayIndexMap.clear();
    }

    public removeRowNodes(idsToRemove: string[]): RowNode[] {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }

        const removedNodes: RowNode[] = [];
        const nodesToVerify: RowNode[] = [];

        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        let deletedNodeCount = 0;

        const remainingIdsToRemove = [...idsToRemove];

        const allNodes = this.getOrderedNodeMap();
        let contiguousIndex = -1;
        for (let stringIndex in allNodes) {
            contiguousIndex += 1;
            const node = allNodes[stringIndex];

            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            const matchIndex = remainingIdsToRemove.findIndex(idToRemove => idToRemove === node.id);
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);

                this.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                continue;
            }

            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                continue;
            }

            const numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }

            // shift normal node up by number of deleted prior to this point
            this.nodeMap.delete(allNodes[stringIndex]);
            this.nodeMap.set({
                id: node.id!,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        }

        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;

        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(node => node.__needsRefreshWhenVisible = true);
            this.rowLoader.queueLoadCheck();
        }

        return removedNodes;
    }
}