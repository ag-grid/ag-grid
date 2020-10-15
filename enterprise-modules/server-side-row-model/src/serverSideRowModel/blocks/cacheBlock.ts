import {
    _,
    LoadSuccessParams,
    Autowired,
    Column,
    ColumnApi,
    ColumnController,
    GridApi,
    GridOptionsWrapper,
    IServerSideStore,
    Logger,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeBlock,
    RowRenderer,
    ValueService
} from "@ag-grid-community/core";
import {StoreUtils} from "../stores/storeUtils";
import {BlockUtils} from "./blockUtils";
import {StoreParams} from "../serverSideRowModel";
import {InfiniteStore} from "../stores/infiniteStore";
import {NodeManager} from "../nodeManager";

export class CacheBlock extends RowNodeBlock {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('ssrmCacheUtils') private cacheUtils: StoreUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('ssrmNodeManager') private nodeManager: NodeManager;

    private logger: Logger;

    private readonly storeParams: StoreParams;
    private readonly startRow: number;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;

    private readonly parentStore: InfiniteStore;
    private readonly parentRowNode: RowNode;

    private defaultRowHeight: number;
    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    private lastAccessed: number;

    public rowNodes: RowNode[];

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private blockTopPx: number;
    private blockHeightPx: number;

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    constructor(blockNumber: number, parentRowNode: RowNode, storeParams: StoreParams, parentStore: InfiniteStore) {
        super(blockNumber);

        this.storeParams = storeParams;
        this.parentRowNode = parentRowNode;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * storeParams.blockSize;

        this.parentStore = parentStore;
        this.level = parentRowNode.level + 1;
        this.groupLevel = storeParams.rowGroupCols ? this.level < storeParams.rowGroupCols.length : undefined;
        this.leafGroup = storeParams.rowGroupCols ? this.level === storeParams.rowGroupCols.length - 1 : false;
    }

    @PostConstruct
    protected postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.defaultRowHeight  = this.gridOptionsWrapper.getRowHeightAsNumber();

        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.storeParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    }

    public isDisplayIndexInBlock(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }

    public isBlockBefore(displayIndex: number): boolean {
        return displayIndex >= this.displayIndexEnd;
    }

    public getDisplayIndexStart(): number {
        return this.displayIndexStart;
    }

    public getDisplayIndexEnd(): number {
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

    public getBlockStateJson(): {id: string, state: any} {
        return {
            id: this.nodeIdPrefix + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.blockSize,
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
                        includeChildren: boolean): void {
        this.rowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());

            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childrenCache) {
                const childStore = rowNode.childrenCache as IServerSideStore;
                childStore.forEachNodeDeep(callback, sequence);
            }
        });
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence?: NumberSequence): void {
        this.forEachNode(callback, sequence, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode) => void, sequence?: NumberSequence): void {
        this.forEachNode(callback, sequence, false);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number): RowNode {
        return this.rowNodes[rowIndex - this.startRow];
    }

    private touchLastAccessed(): void {
        this.lastAccessed = this.storeParams.lastAccessedSequence.next();
    }

    protected processServerResult(params: LoadSuccessParams): void {
        this.parentStore.onBlockLoaded(this, params);
    }

    public setData(rows: any[] = []): void {

        this.destroyRowNodes();

        const storeRowCount = this.parentStore.getRowCount();
        const startRow = this.getId() * this.storeParams.blockSize;
        const endRow = Math.min(startRow + this.storeParams.blockSize, storeRowCount);
        const rowsToCreate = endRow - startRow;

        for (let i = 0; i < rowsToCreate; i++) {
            const rowNode = this.blockUtils.createRowNode(
                {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                    level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
            );
            const dataLoadedForThisRow = i < rows.length;
            if (dataLoadedForThisRow) {
                const data = rows[i];
                const defaultId = this.nodeIdPrefix + (this.startRow + i);
                this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId);
                this.nodeManager.addRowNode(rowNode);
            }
            this.rowNodes.push(rowNode);
        }
    }

    @PreDestroy
    private destroyRowNodes(): void {
        if (this.rowNodes) {
            this.rowNodes.forEach(rowNode => {
                if (rowNode.childrenCache) {
                    this.destroyBean(rowNode.childrenCache);
                    rowNode.childrenCache = null;
                }
                // this is needed, so row render knows to fade out the row, otherwise it
                // sees row top is present, and thinks the row should be shown. maybe
                // rowNode should have a flag on whether it is visible???
                rowNode.clearRowTop();
                if (rowNode.id != null) {
                    this.nodeManager.removeNode(rowNode);
                }
            });
        }
        this.rowNodes = [];
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    }

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | null {
        this.touchLastAccessed();
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    }

    protected loadFromDatasource(): void {
        this.cacheUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.blockSize,
            parentNode: this.parentRowNode,
            storeParams: this.storeParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            fail: this.pageLoadFailed.bind(this)
        });
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    }

    public getRowBounds(index: number): RowBounds | null {
        this.touchLastAccessed();

        let res: RowBounds;
        _.find(this.rowNodes, rowNode => {
            res = this.blockUtils.extractRowBounds(rowNode, index);
            return res != null;
        });

        return res;
    }

    public getRowIndexAtPixel(pixel: number): number {
        this.touchLastAccessed();

        let res: number;
        _.find(this.rowNodes, rowNode => {
            res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            return res != null;
        });

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
