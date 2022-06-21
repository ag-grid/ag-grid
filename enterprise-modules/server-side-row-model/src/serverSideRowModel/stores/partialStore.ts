import {
    _,
    Autowired,
    BeanStub,
    Events,
    IServerSideStore,
    LoadSuccessParams,
    Logger,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeBlockLoader,
    RowRenderer,
    ServerSideGroupLevelParams,
    ServerSideGroupLevelState,
    ServerSideTransaction,
    ServerSideTransactionResult,
    ServerSideTransactionResultStatus,
    StoreRefreshAfterParams,
    StoreUpdatedEvent,
    FocusService,
    ColumnModel
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
import { StoreUtils } from "./storeUtils";
import { PartialStoreBlock } from "../blocks/partialStoreBlock";

enum FindResult { FOUND, CONTINUE_FIND, BREAK_FIND }

export class PartialStore extends BeanStub implements IServerSideStore {

    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    private static MAX_EMPTY_BLOCKS_TO_KEEP = 2;

    private static INITIAL_ROW_COUNT = 1;
    private static OVERFLOW_SIZE = 1;

    @Autowired('rowRenderer') protected rowRenderer: RowRenderer;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('ssrmStoreUtils') private storeUtils: StoreUtils;
    @Autowired("focusService") private focusService: FocusService;
    @Autowired("columnModel") private columnModel: ColumnModel;

    private readonly ssrmParams: SSRMParams;
    private readonly storeParams: ServerSideGroupLevelParams;
    private readonly parentRowNode: RowNode;
    private readonly blocks: { [blockNumber: string]: PartialStoreBlock; } = {};
    private readonly blockHeights: { [blockId: number]: number } = {};

    private defaultRowHeight: number;

    private logger: Logger;

    private rowCount: number;
    private lastRowIndexKnown = false;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private displayIndexStart: number | undefined = 0;
    private displayIndexEnd: number | undefined = 0; // not sure if setting this one to zero is necessary

    private cacheTopPixel = 0;
    private cacheHeightPixels: number;

    private info: any = {};

    constructor(ssrmParams: SSRMParams, storeParams: ServerSideGroupLevelParams, parentRowNode: RowNode) {
        super();
        this.ssrmParams = ssrmParams;
        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;
        this.rowCount = PartialStore.INITIAL_ROW_COUNT;
    }

    @PostConstruct
    private postConstruct(): void {
        this.defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
    }

    @PreDestroy
    private destroyAllBlocks(): void {
        this.getBlocksInOrder().forEach(block => this.destroyBlock(block));
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    }

    public getRowCount(): number {
        return this.rowCount;
    }

    public isLastRowIndexKnown(): boolean {
        return this.lastRowIndexKnown;
    }

    public retryLoads(): void {
        this.getBlocksInOrder().forEach(block => block.retryLoads());
    }

    public onBlockLoadFailed(block: PartialStoreBlock): void {
        block.setData([], true);
        this.fireCacheUpdatedEvent();
    }

    public onBlockLoaded(block: PartialStoreBlock, params: LoadSuccessParams): void {

        this.logger.log(`onPageLoaded: page = ${block.getId()}, lastRow = ${params.rowCount}`);

        const info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }

        if (!params.rowData) {
            const message = 'AG Grid: "params.rowData" is missing from Server-Side Row Model success() callback. Please use the "rowData" attribute. If no data is returned, set an empty list.';
            _.doOnce(() => console.warn(message, params), 'InfiniteStore.noData');
        }

        const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;

        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) { return; }

        this.checkRowCount(block, finalRowCount);

        block.setData(params.rowData);

        // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
        // in the valid range. so we must remove these. this can happen if the datasource returns a
        // result and sets lastRow to something less than virtualRowCount (can happen if user scrolls
        // down, server reduces dataset size).
        this.destroyAllBlocksPastVirtualRowCount();

        this.fireCacheUpdatedEvent();
    }

    private purgeBlocksIfNeeded(blockToExclude: PartialStoreBlock): void {
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        const blocksForPurging = this.getBlocksInOrder().filter(b => b != blockToExclude);
        const lastAccessedComparator = (a: PartialStoreBlock, b: PartialStoreBlock) => b.getLastAccessed() - a.getLastAccessed();
        blocksForPurging.sort(lastAccessedComparator);

        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        const maxBlocksProvided = this.storeParams.maxBlocksInCache! > 0;
        const blocksToKeep = maxBlocksProvided ? this.storeParams.maxBlocksInCache! - 1 : null;
        const emptyBlocksToKeep = PartialStore.MAX_EMPTY_BLOCKS_TO_KEEP - 1;

        blocksForPurging.forEach((block: PartialStoreBlock, index: number) => {

            const purgeBecauseBlockEmpty = block.getState() === PartialStoreBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;

            const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep! : false;

            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {

                // we never purge blocks if they are open, as purging them would mess up with
                // our indexes, it would be very messy to restore the purged block to it's
                // previous state if it had open children.
                if (block.isAnyNodeOpen()) { return; }

                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (this.isBlockCurrentlyDisplayed(block)) { return; }

                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (this.isBlockFocused(block)) { return; }

                // at this point, block is not needed, and no open nodes, so burn baby burn
                this.destroyBlock(block);
            }

        });
    }

    private isBlockFocused(block: PartialStoreBlock): boolean {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) { return false; }
        if (focusedCell.rowPinned != null) { return false; }

        const blockIndexStart = block.getDisplayIndexStart();
        const blockIndexEnd = block.getDisplayIndexEnd();
        if (blockIndexEnd == null || blockIndexStart == null) { return false; }

        const hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    }

    private isBlockCurrentlyDisplayed(block: PartialStoreBlock): boolean {
        const startIndex = block.getDisplayIndexStart();
        const endIndex = block.getDisplayIndexEnd()! - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex!, endIndex);
    }

    public removeDuplicateNode(id: string): void {
        this.getBlocksInOrder().forEach(block => block.removeDuplicateNode(id));
    }

    private checkRowCount(block: PartialStoreBlock, lastRow?: number): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        } else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            const lastRowIndex = (block.getId() + 1) * this.storeParams.cacheBlockSize!;
            const lastRowIndexPlusOverflow = lastRowIndex + PartialStore.OVERFLOW_SIZE;

            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.getBlocksInOrder().forEach(block => block.forEachNodeDeep(callback, sequence));
    }

    public forEachNodeDeepAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.getBlocksInOrder().forEach(block => block.forEachNodeAfterFilterAndSort(callback, sequence));
    }

    public getBlocksInOrder(): PartialStoreBlock[] {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        const blockComparator = (a: PartialStoreBlock, b: PartialStoreBlock) => a.getId() - b.getId();
        const blocks = _.getAllValuesInObject(this.blocks).sort(blockComparator);

        return blocks;
    }

    private destroyBlock(block: PartialStoreBlock): void {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.rowNodeBlockLoader.removeBlock(block);
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    private fireCacheUpdatedEvent(): void {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        const event: StoreUpdatedEvent = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }

    private destroyAllBlocksPastVirtualRowCount(): void {
        const blocksToDestroy: PartialStoreBlock[] = [];
        this.getBlocksInOrder().forEach((block: PartialStoreBlock) => {
            const startRow = block.getId() * this.storeParams.cacheBlockSize!;
            if (startRow >= this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(block => this.destroyBlock(block));
        }
    }

    public refreshStore(purge: boolean): void {
        const noBlocksToRefresh = this.getRowCount() == 0;
        if (noBlocksToRefresh || purge) {
            this.resetStore();
        } else {
            this.refreshBlocks();
        }
        this.fireCacheUpdatedEvent();
    }

    private refreshBlocks(): void {
        this.getBlocksInOrder().forEach(block => {
            block.refresh();
        });
        this.lastRowIndexKnown = false;
        this.rowNodeBlockLoader.checkBlockToLoad();
    }

    private resetStore(): void {

        this.destroyAllBlocks();
        this.lastRowIndexKnown = false;

        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.columnModel.isAutoRowHeightActive() || this.rowCount === 0) {
            this.rowCount = PartialStore.INITIAL_ROW_COUNT;
        }
    }

    public getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const result: RowNode[] = [];

        let lastBlockId = -1;
        let inActiveRange = false;

        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }

        let foundGapInSelection = false;

        this.getBlocksInOrder().forEach(block => {
            if (foundGapInSelection) { return; }

            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }

            lastBlockId = block.getId();

            block.forEachNodeShallow(rowNode => {
                const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }

                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }

            });
        });

        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    }

    private findBlockAndExecute<T>(matchBlockFunc: (block: PartialStoreBlock) => FindResult,
        blockFoundFunc: (foundBlock: PartialStoreBlock) => T,
        blockNotFoundFunc: (previousBlock: PartialStoreBlock) => T | undefined,
    ): T {

        let blockFound = false;
        let breakSearch = false;
        let lastBlock: PartialStoreBlock | null = null;

        let res: T;

        this.getBlocksInOrder().forEach(block => {
            if (blockFound || breakSearch) { return; }

            const comparatorResult = matchBlockFunc(block);

            if (comparatorResult == FindResult.FOUND) {
                res = blockFoundFunc(block);
                blockFound = true;
            } else if (comparatorResult == FindResult.CONTINUE_FIND) {
                lastBlock = block;
            } else if (comparatorResult == FindResult.BREAK_FIND) {
                breakSearch = true;
            }
        });

        if (!blockFound) {
            res = blockNotFoundFunc(lastBlock!)!;
        }

        return res!;
    }

    public getRowBounds(index: number): RowBounds {

        const matchBlockFunc = (block: PartialStoreBlock): FindResult => {
            if (block.isDisplayIndexInBlock(index)) {
                return FindResult.FOUND;
            } else {
                return block.isBlockBefore(index) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };

        const blockFoundFunc = (foundBlock: PartialStoreBlock): RowBounds => {
            return foundBlock.getRowBounds(index)!;
        };

        const blockNotFoundFunc = (previousBlock: PartialStoreBlock): RowBounds => {
            let nextRowTop: number;
            let nextRowIndex: number;

            if (previousBlock !== null) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd()!;
            } else {
                nextRowTop = this.cacheTopPixel;
                nextRowIndex = this.displayIndexStart!;
            }

            const rowsBetween = index - nextRowIndex;

            return {
                rowHeight: this.defaultRowHeight,
                rowTop: nextRowTop + rowsBetween * this.defaultRowHeight
            };
        };

        return this.findBlockAndExecute<RowBounds>(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    }

    public getRowIndexAtPixel(pixel: number): number {

        const matchBlockFunc = (block: PartialStoreBlock): FindResult => {
            if (block.isPixelInRange(pixel)) {
                return FindResult.FOUND;
            } else {
                return block.getBlockTopPx() < pixel ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };

        const blockFoundFunc = (foundBlock: PartialStoreBlock): number => {
            return foundBlock.getRowIndexAtPixel(pixel)!;
        };

        const blockNotFoundFunc = (previousBlock: PartialStoreBlock): number => {
            let nextRowTop: number;
            let nextRowIndex: number;

            if (previousBlock) {
                nextRowTop = previousBlock.getBlockTopPx() + previousBlock.getBlockHeightPx();
                nextRowIndex = previousBlock.getDisplayIndexEnd()!;
            } else {
                nextRowTop = this.cacheTopPixel;
                nextRowIndex = this.displayIndexStart!;
            }

            // we start at the last loaded block before this block, and go down
            // block by block, adding in the block sizes (using cached sizes if available)
            // until we get to a block that does should have the pixel

            const blockSize = this.storeParams.cacheBlockSize!;
            const defaultBlockHeight = this.defaultRowHeight * blockSize;

            let nextBlockId = previousBlock ? (previousBlock.getId()+1) : 0;

            const getBlockDetails = (id: number) => {
                let cachedBlockHeight = this.getCachedBlockHeight(id);
                let blockHeight = cachedBlockHeight != null ? cachedBlockHeight : defaultBlockHeight;
                let pixelInBlock = pixel <= (blockHeight + nextRowTop);
                return {
                    height: blockHeight, pixelInBlock: pixelInBlock
                };
            };

            let blockDetails = getBlockDetails(nextBlockId);

            while (!blockDetails.pixelInBlock) {
                nextRowTop += blockDetails.height;
                nextRowIndex += blockSize;

                nextBlockId++;
                blockDetails = getBlockDetails(nextBlockId);
            }

            const pixelsBetween = pixel - nextRowTop;
            const rowHeight = blockDetails.height / blockSize;
            const rowsBetween = Math.floor(pixelsBetween / rowHeight) | 0;

            return nextRowIndex + rowsBetween;
        };

        let result = this.findBlockAndExecute<number>(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);

        const lastAllowedIndex = this.getDisplayIndexEnd()! - 1;
        result = Math.min(result, lastAllowedIndex);

        return result;
    }

    public clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.getBlocksInOrder().forEach(block => block.clearDisplayIndexes());
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
        nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.cacheTopPixel = nextRowTop.value;

        let lastBlockId = -1;

        const blockSize = this.storeParams.cacheBlockSize;

        this.getBlocksInOrder().forEach(currentBlock => {

            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            const blockId = currentBlock.getId();
            const blocksSkippedCount = blockId - lastBlockId - 1;
            const rowsSkippedCount = blocksSkippedCount * blockSize!;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }

            for (let i = 1; i <= blocksSkippedCount; i++) {
                const blockToAddId = blockId - i;
                if (_.exists(this.blockHeights[blockToAddId])) {
                    nextRowTop.value += this.blockHeights[blockToAddId];
                } else {
                    nextRowTop.value += blockSize! * this.defaultRowHeight;
                }
            }

            lastBlockId = blockId;

            currentBlock.setDisplayIndexes(displayIndexSeq, nextRowTop);

            this.blockHeights[blockId] = currentBlock.getBlockHeightPx();
        });

        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        const lastVisitedRow = ((lastBlockId + 1) * blockSize!) - 1;
        const rowCount = this.getRowCount();
        const rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.defaultRowHeight;
        }

        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeightPixels = nextRowTop.value - this.cacheTopPixel;
    }

    // gets called in a) init() above and b) by the grid
    public getRowUsingDisplayIndex(displayRowIndex: number, dontCreateBlock = false): RowNode | undefined {

        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) { return undefined; }

        const matchBlockFunc = (block: PartialStoreBlock): FindResult => {
            if (block.isDisplayIndexInBlock(displayRowIndex)) {
                return FindResult.FOUND;
            } else {
                return block.isBlockBefore(displayRowIndex) ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
            }
        };

        const blockFoundFunc = (foundBlock: PartialStoreBlock): RowNode => {
            return foundBlock.getRowUsingDisplayIndex(displayRowIndex)!;
        };

        const blockNotFoundFunc = (previousBlock: PartialStoreBlock): RowNode | undefined => {
            if (dontCreateBlock) { return; }

            let blockNumber: number;
            let displayIndexStart: number;
            let nextRowTop: number;

            const blockSize = this.storeParams.cacheBlockSize;

            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (previousBlock) {
                blockNumber = previousBlock.getId() + 1;
                displayIndexStart = previousBlock.getDisplayIndexEnd()!;
                nextRowTop = previousBlock.getBlockHeightPx() + previousBlock.getBlockTopPx();

                const isInRange = (): boolean => {
                    return displayRowIndex >= displayIndexStart && displayRowIndex < (displayIndexStart + blockSize!);
                };

                while (!isInRange()) {
                    displayIndexStart += blockSize!;

                    const cachedBlockHeight = this.blockHeights[blockNumber];
                    if (_.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    } else {
                        nextRowTop += this.defaultRowHeight * blockSize!;
                    }

                    blockNumber++;
                }
            } else {
                const localIndex = displayRowIndex - this.displayIndexStart!;
                blockNumber = Math.floor(localIndex / blockSize!);
                displayIndexStart = this.displayIndexStart! + (blockNumber * blockSize!);
                nextRowTop = this.cacheTopPixel + (blockNumber * blockSize! * this.defaultRowHeight);
            }

            this.logger.log(`block missing, rowIndex = ${displayRowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);

            const newBlock = this.createBlock(blockNumber, displayIndexStart, { value: nextRowTop });
            return newBlock.getRowUsingDisplayIndex(displayRowIndex)!;
        };

        return this.findBlockAndExecute<RowNode>(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {

        const blockSize = this.storeParams.cacheBlockSize;
        const blockId = Math.floor(topLevelIndex / blockSize!);

        const matchBlockFunc = (block: PartialStoreBlock): FindResult => {
            if (block.getId() === blockId) {
                return FindResult.FOUND;
            }
            return block.getId() < blockId ? FindResult.CONTINUE_FIND : FindResult.BREAK_FIND;
        };

        const blockFoundFunc = (foundBlock: PartialStoreBlock): number => {
            const rowNode = foundBlock.getRowUsingLocalIndex(topLevelIndex);
            return rowNode.rowIndex!;
        };

        const blockNotFoundFunc = (previousBlock: PartialStoreBlock): number => {
            if (!previousBlock) {
                return topLevelIndex;
            }

            // note: the local index is the same as the top level index, two terms for same thing
            //
            // get index of the last row before this row
            // eg if blocksize = 100, then:
            //   last row of first block is 99 (100 * 1) -1;
            //   last row of second block is 199 (100 * 2) -1;
            const lastRowTopLevelIndex = (blockSize! * (previousBlock.getId() + 1)) - 1;

            // get the last top level node in the block before the wanted block. this will be the last
            // loaded displayed top level node.
            const lastRowNode = previousBlock.getRowUsingLocalIndex(lastRowTopLevelIndex);

            // we want the index of the last displayed node, not just the top level node, so if the last top level node
            // is open, we get the index of the last displayed child node.
            let lastDisplayedNodeIndexInBlockBefore: number;
            if (lastRowNode.expanded && lastRowNode.childStore) {
                const serverSideCache = lastRowNode.childStore;
                lastDisplayedNodeIndexInBlockBefore = serverSideCache.getDisplayIndexEnd()! - 1;
            } else if (lastRowNode.expanded && lastRowNode.detailNode) {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.detailNode.rowIndex!;
            } else {
                lastDisplayedNodeIndexInBlockBefore = lastRowNode.rowIndex!;
            }

            // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
            // same as the difference between the displayed index
            const indexDiff = topLevelIndex - lastRowTopLevelIndex;

            return lastDisplayedNodeIndexInBlockBefore + indexDiff;
        };

        return this.findBlockAndExecute(matchBlockFunc, blockFoundFunc, blockNotFoundFunc);
    }

    public addStoreStates(result: ServerSideGroupLevelState[]): void {
        result.push({
            infiniteScroll: true,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.rowCount,
            lastRowIndexKnown: this.lastRowIndexKnown,
            info: this.info,
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize
        });
        this.forEachChildStoreShallow(childStore => childStore.addStoreStates(result));
    }

    public getCachedBlockHeight(blockNumber: number): number | undefined {
        return this.blockHeights[blockNumber];
    }

    private createBlock(blockNumber: number, displayIndex: number, nextRowTop: { value: number }): PartialStoreBlock {

        const block = this.createBean(new PartialStoreBlock(
            blockNumber, this.parentRowNode, this.ssrmParams, this.storeParams, this));
        block.setDisplayIndexes(new NumberSequence(displayIndex), nextRowTop);

        this.blocks[block.getId()] = block;
        this.purgeBlocksIfNeeded(block);

        this.rowNodeBlockLoader.addBlock(block);

        return block;
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

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {
        return { status: ServerSideTransactionResultStatus.StoreWrongType };
    }

    public getChildStore(keys: string[]): IServerSideStore | null {

        const findNodeCallback = (key: string): RowNode => {
            let nextNode: RowNode | null = null;
            this.getBlocksInOrder().forEach(block => {
                block.forEachNodeShallow(rowNode => {
                    if (rowNode.key === key) {
                        nextNode = rowNode;
                    }
                }, new NumberSequence());
            });
            return nextNode!;
        };

        return this.storeUtils.getChildStore(keys, this, findNodeCallback);
    }

    public isPixelInRange(pixel: number): boolean {
        if (this.getRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTopPixel && pixel < (this.cacheTopPixel + this.cacheHeightPixels);
    }

    public refreshAfterFilter(params: StoreRefreshAfterParams): void {
        const serverFiltersAllLevels = this.gridOptionsWrapper.isServerSideFilterAllLevels();
        if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.resetStore();
            return;
        }

        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(store => store.refreshAfterFilter(params));
    }

    public refreshAfterSort(params: StoreRefreshAfterParams): void {
        const serverSortsAllLevels = this.gridOptionsWrapper.isServerSideSortAllLevels();
        if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.resetStore();
            return;
        }

        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(store => store.refreshAfterSort(params));
    }

    private forEachChildStoreShallow(callback: (childStore: IServerSideStore) => void): void {
        this.getBlocksInOrder().forEach(block => {
            if (block.isGroupLevel()) {
                const innerCallback = (rowNode: RowNode) => {
                    const nextCache = rowNode.childStore;
                    if (nextCache) {
                        callback(nextCache);
                    }
                };
                block.forEachNodeShallow(innerCallback, new NumberSequence());
            }
        });
    }

}
