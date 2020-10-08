import {
    _,
    Autowired,
    StoreUpdatedEvent,
    Column,
    ColumnController,
    Events,
    GridOptionsWrapper,
    IServerSideChildStore,
    LoadCompleteEvent,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowBounds,
    RowDataTransaction,
    RowNode,
    RowNodeBlock,
    RowNodeBlockLoader,
    RowNodeTransaction,
    RowRenderer,
} from "@ag-grid-community/core";
import {ChildStoreParams} from "../serverSideRowModel";
import {StoreUtils} from "./storeUtils";
import {BlockUtils} from "../blocks/blockUtils";

export class FiniteStore extends RowNodeBlock implements IServerSideChildStore {

    @Autowired('ssrmCacheUtils') private cacheUtils: StoreUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;
    private readonly storeParams: ChildStoreParams;
    private readonly parentRowNode: RowNode;

    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    private rowNodes: RowNode[];

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private topPx: number;
    private heightPx: number;

    constructor(storeParams: ChildStoreParams, parentRowNode: RowNode) {
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        super(0);
        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;
        this.level = parentRowNode.level + 1;
        this.groupLevel = storeParams.rowGroupCols ? this.level < storeParams.rowGroupCols.length : undefined;
        this.leafGroup = storeParams.rowGroupCols ? this.level === storeParams.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    private postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.storeParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.addManagedListener(this, RowNodeBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.initialiseRowNodes();

        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc( () => this.rowNodeBlockLoader.removeBlock(this) );
    }

    @PreDestroy
    private destroyRowNodes(): void {
        this.rowNodes.forEach(rowNode => {
            if (rowNode.childrenCache) {
                this.destroyBean(rowNode.childrenCache);
                rowNode.childrenCache = null;
            }
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown. maybe
            // rowNode should have a flag on whether it is visible???
            rowNode.clearRowTop();
        });
        this.rowNodes = [];
    }

    private initialiseRowNodes(): void {
        this.destroyRowNodes();
        const loadingRowNode = this.blockUtils.createRowNode(
            {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
        );
        this.rowNodes.push(loadingRowNode)
    }

    public getBlockStateJson(): { id: string, state: any } {
        return {
            id: this.nodeIdPrefix,
            state: this.getState()
        }
    }

    protected loadFromDatasource(): void {
        this.cacheUtils.loadFromDatasource({
            startRow: undefined,
            endRow: undefined,
            parentNode: this.parentRowNode,
            storeParams: this.storeParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this)
        });
    }

    public getStartRow(): number {
        return 0; // always zero as not in a cache
    }

    public getEndRow(): number {
        return this.rowNodes.length;
    }

    protected processServerResult(rowData: any[] = []): void {
        this.rowNodes = [];
        rowData.forEach( (item: any, index: number) => {
            const rowNode = this.blockUtils.createRowNode(
                {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                    level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
            );
            this.rowNodes.push(rowNode)
            this.blockUtils.setDataIntoRowNode(rowNode, item, index, this.nodeIdPrefix);
        });
    }

    public clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.rowNodes.forEach( rowNode => this.blockUtils.clearDisplayIndex(rowNode) );
    }

    public getDisplayIndexEnd(): number {
        return this.displayIndexEnd;
    }

    public isDisplayIndexInStore(displayIndex: number): boolean {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence, nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;

        this.rowNodes.forEach(rowNode =>
            this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop)
        );

        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.rowNodes.forEach( rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childrenCache as IServerSideChildStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        })
    }

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | null {
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    }

    public getRowBounds(index: number): RowBounds {

        for (let i=0; i<this.rowNodes.length; i++) {
            const rowNode = this.rowNodes[i];
            const res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) { return res; }
        }

        console.error(` ag-Grid: looking for invalid row index in Server Side Row Model, index=${index}`);
        return null;
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    }

    public getRowIndexAtPixel(pixel: number): number {
        let res: number = undefined;
        this.rowNodes.forEach( rowNode => {
            const res2 = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res2!=null) {
                res = res2;
            }
        });

        const pixelIsPastLastRow = res == null;

        if (pixelIsPastLastRow) {
            return this.displayIndexEnd - 1;
        } else {
            return res;
        }
    }

    public getChildStore(keys: string[]): IServerSideChildStore | null {
        return this.cacheUtils.getChildStore(keys, this, (key: string) => {
            const rowNode = _.find(this.rowNodes, rowNode => rowNode.key === key);
            return rowNode;
        });
    }

    public refreshStoreAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void {
        const shouldPurgeCache = this.cacheUtils.shouldPurgeStoreAfterSort({
            parentRowNode: this.parentRowNode,
            storeParams: this.storeParams,
            changedColumnsInSort: changedColumnsInSort,
            rowGroupColIds: rowGroupColIds
        });

        if (shouldPurgeCache) {
            this.purgeStore();
        } else {
            this.rowNodes.forEach(rowNode => {
                const nextCache = (rowNode.childrenCache as IServerSideChildStore);
                if (nextCache) {
                    nextCache.refreshStoreAfterSort(changedColumnsInSort, rowGroupColIds);
                }
            });
        }
    }

    public applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null {
        return null;
    }

    public purgeStore(): void {
        this.initialiseRowNodes();
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
        this.fireCacheUpdatedEvent();
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

    public getRowCount(): number {
        return this.rowNodes.length;
    }

    // listener on EVENT_LOAD_COMPLETE
    private onPageLoaded(event: LoadCompleteEvent): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) { return; }
        if (!event.success) { return; }
        this.fireCacheUpdatedEvent();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const rowNode = this.rowNodes[topLevelIndex];
        return rowNode.rowIndex;
    }

    public isLastRowIndexKnown(): boolean {
        return this.getState()==RowNodeBlock.STATE_LOADED;
    }

    public getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const result: RowNode[] = [];

        let inActiveRange = false;

        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }

        this.rowNodes.forEach(rowNode => {
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