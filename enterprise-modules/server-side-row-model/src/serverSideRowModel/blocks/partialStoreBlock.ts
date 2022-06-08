import {
    _,
    LoadSuccessParams,
    Autowired,
    Column,
    ColumnModel,
    Logger,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeBlock,
    ServerSideGroupLevelParams,
    RowNodeBlockLoader,
} from "@ag-grid-community/core";
import { StoreUtils } from "../stores/storeUtils";
import { BlockUtils } from "./blockUtils";
import { SSRMParams } from "../serverSideRowModel";
import { PartialStore } from "../stores/partialStore";
import { NodeManager } from "../nodeManager";

export class PartialStoreBlock extends RowNodeBlock {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ssrmStoreUtils') private storeUtils: StoreUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;

    private logger: Logger;

    private readonly ssrmParams: SSRMParams;
    private readonly storeParams: ServerSideGroupLevelParams;
    private readonly startRow: number;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;

    private readonly parentStore: PartialStore;
    private readonly parentRowNode: RowNode;

    private usingTreeData: boolean;

    private lastAccessed: number;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: {[id:string]: RowNode};

    public rowNodes: RowNode[];

    private displayIndexStart: number | undefined;
    private displayIndexEnd: number | undefined;

    private blockTopPx: number;
    private blockHeightPx: number;

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string | undefined;

    constructor(blockNumber: number, parentRowNode: RowNode, ssrmParams: SSRMParams,
                storeParams: ServerSideGroupLevelParams, parentStore: PartialStore) {
        super(blockNumber);

        this.ssrmParams = ssrmParams;
        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * storeParams.cacheBlockSize!;

        this.parentStore = parentStore;
        this.level = parentRowNode.level + 1;
        this.groupLevel = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : undefined;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    protected postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field!;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }

        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    }

    public isDisplayIndexInBlock(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexStart! && displayIndex < this.displayIndexEnd!;
    }

    public isBlockBefore(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexEnd!;
    }

    public getDisplayIndexStart(): number | undefined {
        return this.displayIndexStart;
    }

    public getDisplayIndexEnd(): number | undefined {
        return this.displayIndexEnd;
    }

    public getBlockHeightPx(): number {
        return this.blockHeightPx;
    }

    public getBlockTopPx(): number {
        return this.blockTopPx;
    }

    public isGroupLevel(): boolean | undefined {
        return this.groupLevel;
    }

    public getGroupField(): string {
        return this.groupField;
    }

    private prefixId(id: number): string {
        if (this.nodeIdPrefix != null) {
            return this.nodeIdPrefix + '-' + id;
        } else {
            return id.toString();
        }
    }

    public getBlockStateJson(): {id: string, state: any} {
        return {
            id: this.prefixId(this.getId()),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize!,
                pageStatus: this.getState()
            }
        };
    }

    public isAnyNodeOpen(): boolean {
        const openNodeCount = this.rowNodes.filter(node => node.expanded).length;
        return openNodeCount > 0;
    }

    // this method is repeated, see forEachRowNode, why?
    private forEachNode(callback: (rowNode: RowNode, index: number) => void,
                        sequence: NumberSequence = new NumberSequence(),
                        includeChildren: boolean, filterAndSort: boolean): void {
        this.rowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());

            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childStore) {
                const childStore = rowNode.childStore;
                if (filterAndSort) {
                    childStore.forEachNodeDeepAfterFilterAndSort(callback, sequence);
                } else {
                    childStore.forEachNodeDeep(callback, sequence);
                }
            }
        });
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void {
        this.forEachNode(callback, sequence, true, false);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void {
        this.forEachNode(callback, sequence, true, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode) => void, sequence?: NumberSequence): void {
        this.forEachNode(callback, sequence, false, false);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number): RowNode {
        return this.rowNodes[rowIndex - this.startRow];
    }

    private touchLastAccessed(): void {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    }

    protected processServerFail(): void {
        this.parentStore.onBlockLoadFailed(this);
    }

    public retryLoads(): void {
        if (this.getState() === RowNodeBlock.STATE_FAILED) {
            this.setStateWaitingToLoad();
            this.rowNodeBlockLoader.checkBlockToLoad();
            this.setData();
        }

        this.forEachNodeShallow(node => {
            if (node.childStore) {
                node.childStore.retryLoads();
            }
        });
    }

    protected processServerResult(params: LoadSuccessParams): void {
        this.parentStore.onBlockLoaded(this, params);
    }

    public setData(rows: any[] = [], failedLoad = false): void {
        this.destroyRowNodes();

        const storeRowCount = this.parentStore.getRowCount();
        const startRow = this.getId() * this.storeParams.cacheBlockSize!;
        const endRow = Math.min(startRow + this.storeParams.cacheBlockSize!, storeRowCount);
        const rowsToCreate = endRow - startRow;

        // when using autoHeight, we default the row heights to a height to fill the old height of the block.
        // we only ever do this to autoHeight, as we could be setting invalid heights (especially if different
        // number of rows in the block due to a filter, less rows would mean bigger rows), and autoHeight is
        // the only pattern that will automatically correct this. we check for visible autoHeight cols,
        // to omit the case where all autoHeight cols are hidden.
        const showingAutoHeightCols = this.columnModel.getAllDisplayedAutoHeightCols().length>0;
        const cachedBlockHeight = showingAutoHeightCols ? this.parentStore.getCachedBlockHeight(this.getId()) : undefined;
        const cachedRowHeight = cachedBlockHeight ? Math.round(cachedBlockHeight / rowsToCreate) : undefined;


        for (let i = 0; i < rowsToCreate; i++) {
            const dataLoadedForThisRow = i < rows.length;

            const getNodeWithData = (existingNode?: RowNode) => {
                // if there's not an existing node to reuse, create a fresh node
                const rowNode = existingNode ?? this.blockUtils.createRowNode(
                    {
                        field: this.groupField, 
                        group: this.groupLevel!, 
                        leafGroup: this.leafGroup,
                        level: this.level, 
                        parent: this.parentRowNode, 
                        rowGroupColumn: this.rowGroupColumn,
                        rowHeight: cachedRowHeight
                    }
                );
    
                if (dataLoadedForThisRow) {
                    const data = rows[i];
                    if (!!existingNode) {
                        this.blockUtils.updateDataIntoRowNode(rowNode, data);
                    } else {
                        const defaultId = this.prefixId(this.startRow + i);
                        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight);
                        this.blockUtils.checkOpenByDefault(rowNode);
                    }

                    this.parentStore.removeDuplicateNode(rowNode.id!);
                    this.nodeManager.addRowNode(rowNode);
                    this.allNodesMap[rowNode.id!] = rowNode;
                }
    
                if (failedLoad) {
                    rowNode.failedLoad = true;
                }
    
                return rowNode;
            };

            const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
            let row: RowNode | undefined;
            if (getRowIdFunc && dataLoadedForThisRow) {
                const data = rows[i];
                const parentKeys = this.parentRowNode.getGroupKeys();
                const id = getRowIdFunc({
                    data,
                    level: this.level,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                });

                const cachedRow = this.parentStore.retrieveNodeFromCache(id);
                row = getNodeWithData(cachedRow);
            }

            if (!row) {
                row = getNodeWithData();
            }

            this.rowNodes.push(row);
        }
    }

    // to safeguard the grid against duplicate nodes, when a row is loaded, we check
    // for another row in the same cache. if another row does exist, we delete it.
    // this covers for when user refreshes the store (which typically happens after a
    // data change) and the same row ends up coming back in a different block, and the
    // new block finishes refreshing before the old block has finished refreshing.
    public removeDuplicateNode(id: string): void {

        // we don't remove duplicates if this block is loaded, as that's a duplicate ID.
        // we are only interested in removing rows in blocks that are in the middle of a refresh,
        // ie two blocks, A and B, both are refreshed (as in the same cache) but A comes back
        // first and some rows have moved from B to A, we must remove the old rows from B.
        // however if B is not also getting refreshed (ie it's loaded) this is a bug
        // we need to tell the application about, as they provided duplicate ID's (done in Node Manager)
        if (this.getState()==RowNodeBlock.STATE_LOADED) { return; }

        const rowNode = this.allNodesMap[id];
        if (!rowNode) { return; }

        this.blockUtils.destroyRowNode(rowNode);

        const index = this.rowNodes.indexOf(rowNode);

        const stubRowNode = this.blockUtils.createRowNode(
            {field: this.groupField, group: this.groupLevel!, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
        );

        this.rowNodes[index] = stubRowNode;
    }

    public refresh(): void {
        if (this.getState() !== RowNodeBlock.STATE_WAITING_TO_LOAD) {
            this.setStateWaitingToLoad();
        }
    }

    @PreDestroy
    private destroyRowNodes(): void {
        this.rowNodes?.forEach(row => {
            const isStoreCachingNode = this.parentStore.isNodeCached(row.id!);
            this.blockUtils.destroyRowNode(row, isStoreCachingNode);
        } );
        this.rowNodes = [];
        this.allNodesMap = {};
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    }

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | undefined {
        this.touchLastAccessed();
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    }

    protected loadFromDatasource(): void {
        this.storeUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize!,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    }

    public getRowBounds(index: number): RowBounds | undefined {
        this.touchLastAccessed();

        let res: RowBounds | undefined;

        for (const rowNode of this.rowNodes) {
            res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res != null) { break; }
        }

        return res;
    }

    public getRowIndexAtPixel(pixel: number): number | null {
        this.touchLastAccessed();

        let res: number | null = null;

        for (const rowNode of this.rowNodes) {
            res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res != null) { break; }
        }

        return res;
    }

    public clearDisplayIndexes(): void {
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(rowNode => this.blockUtils.clearDisplayIndex(rowNode));
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;

        this.rowNodes.forEach(rowNode => this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop));

        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    }

}
