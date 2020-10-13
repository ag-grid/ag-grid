import {
    _,
    Autowired,
    Column,
    ColumnController,
    Events,
    GridOptionsWrapper,
    IServerSideStore,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowBounds,
    RowNode,
    RowNodeBlock,
    RowNodeBlockLoader,
    RowRenderer,
    ServerSideTransaction,
    ServerSideTransactionResult,
    StoreUpdatedEvent,
} from "@ag-grid-community/core";
import {StoreParams} from "../serverSideRowModel";
import {StoreUtils} from "./storeUtils";
import {BlockUtils} from "../blocks/blockUtils";

export class ClientSideStore extends RowNodeBlock implements IServerSideStore {

    @Autowired('ssrmCacheUtils') private cacheUtils: StoreUtils;
    @Autowired('ssrmBlockUtils') private blockUtils: BlockUtils;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;

    private readonly level: number;
    private readonly groupLevel: boolean | undefined;
    private readonly leafGroup: boolean;
    private readonly storeParams: StoreParams;
    private readonly parentRowNode: RowNode;

    private nodeIdSequence: NumberSequence = new NumberSequence()

    private usingTreeData: boolean;
    private usingMasterDetail: boolean;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: {[id:string]: RowNode};

    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private topPx: number;
    private heightPx: number;

    constructor(storeParams: StoreParams, parentRowNode: RowNode) {
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

        this.initialiseRowNodes();

        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc( () => this.rowNodeBlockLoader.removeBlock(this) );
    }

    @PreDestroy
    private destroyRowNodes(): void {
        if (this.getAllRowNodes()) {
            this.getAllRowNodes().forEach(rowNode => {
                if (rowNode.childrenCache) {
                    this.destroyBean(rowNode.childrenCache);
                    rowNode.childrenCache = null;
                }
                // this is needed, so row render knows to fade out the row, otherwise it
                // sees row top is present, and thinks the row should be shown. maybe
                // rowNode should have a flag on whether it is visible???
                rowNode.clearRowTop();
            });
        }
        this.parentRowNode.childrenAfterGroup = [];
        this.allNodesMap = {};
    }

    private initialiseRowNodes(): void {
        this.destroyRowNodes();
        const loadingRowNode = this.blockUtils.createRowNode(
            {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
        );
        this.getAllRowNodes().push(loadingRowNode)
    }

    private getAllRowNodes(): RowNode[] {
        return this.parentRowNode.childrenAfterGroup;
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
        return this.getAllRowNodes().length;
    }

    private createDataNode(data: any, index?: number): RowNode {
        const rowNode = this.blockUtils.createRowNode(
            {field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn}
        );

        const rowNodes = this.getAllRowNodes();
        if (index!=null) {
            _.insertIntoArray(rowNodes, rowNode, index);
        } else {
            rowNodes.push(rowNode);
        }

        const defaultId = this.nodeIdPrefix + this.nodeIdSequence.next();
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId);

        this.allNodesMap[rowNode.id] = rowNode;

        return rowNode;
    }

    protected processServerResult(rowData: any[] = []): void {
        if (!this.isAlive()) { return; }

        this.destroyRowNodes();
        rowData.forEach(this.createDataNode.bind(this));

        this.fireStoreUpdatedEvent();
    }

    public clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.getAllRowNodes().forEach( rowNode => this.blockUtils.clearDisplayIndex(rowNode) );
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

        this.getAllRowNodes().forEach(rowNode =>
            this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop)
        );

        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.getAllRowNodes().forEach( rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childrenCache as IServerSideStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        })
    }

    public getRowUsingDisplayIndex(displayRowIndex: number): RowNode | null {
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.parentRowNode.childrenAfterGroup);
        return res;
    }

    public getRowBounds(index: number): RowBounds {

        const rowNodes = this.getAllRowNodes();
        for (let i=0; i<rowNodes.length; i++) {
            const rowNode = rowNodes[i];
            const res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) { return res; }
        }

        return null;
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    }

    public getRowIndexAtPixel(pixel: number): number {

        const rowNodes = this.getAllRowNodes();
        if (pixel<=this.topPx) { return rowNodes[0].rowIndex; }
        if (pixel>=(this.topPx + this.heightPx)) { return rowNodes[rowNodes.length-1].rowIndex; }

        let res: number = undefined;
        rowNodes.forEach( rowNode => {
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

    public getChildStore(keys: string[]): IServerSideStore | null {
        return this.cacheUtils.getChildStore(keys, this, (key: string) => {
            const rowNode = _.find(this.getAllRowNodes(), rowNode => rowNode.key === key);
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
            this.getAllRowNodes().forEach(rowNode => {
                const nextCache = (rowNode.childrenCache as IServerSideStore);
                if (nextCache) {
                    nextCache.refreshStoreAfterSort(changedColumnsInSort, rowGroupColIds);
                }
            });
        }
    }

    public applyTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult {
        const res: ServerSideTransactionResult = {
            routeFound: true,
            remove: [],
            update: [],
            add: []
        };

        const nodesToUnselect: RowNode[] = [];

        this.executeAdd(transaction, res);
        this.executeRemove(transaction, res, nodesToUnselect);
        this.executeUpdate(transaction, res, nodesToUnselect);

        // this.updateSelection(nodesToUnselect);

        return res;
    }

    private executeAdd(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult): void {
        const {add, addIndex} = rowDataTran;
        if (_.missingOrEmpty(add)) { return; }

        const useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(item => {
                const newRowNode: RowNode = this.createDataNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        } else {
            add.forEach(item => {
                const newRowNode: RowNode = this.createDataNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    }

    private executeRemove(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult, nodesToUnselect: RowNode[]): void {
        const {remove} = rowDataTran;

        if (remove==null) { return; }

        const rowIdsRemoved: {[key: string]: boolean} = {};

        remove.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTop();

            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id];

            rowNodeTransaction.remove.push(rowNode);
        });

        this.parentRowNode.childrenAfterGroup = this.parentRowNode.childrenAfterGroup.filter(rowNode => !rowIdsRemoved[rowNode.id]);
    }

    private executeUpdate(rowDataTran: ServerSideTransaction, rowNodeTransaction: ServerSideTransactionResult, nodesToUnselect: RowNode[]): void {
        const {update} = rowDataTran;
        if (update==null) { return; }

        update.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            rowNodeTransaction.update.push(rowNode);
        });
    }

    private lookupRowNode(data: any): RowNode {
        const rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();

        let rowNode: RowNode;
        if (_.exists(rowNodeIdFunc)) {
            // find rowNode using id
            const id: string = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`ag-Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = _.find(this.getAllRowNodes(), rowNode => rowNode.data === data);
            if (!rowNode) {
                console.error(`ag-Grid: could not find data item as object was not found`, data);
                return null;
            }
        }

        return rowNode;
    }

    public purgeStore(): void {
        this.initialiseRowNodes();
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
        this.fireStoreUpdatedEvent();
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
        return this.getAllRowNodes().length;
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const rowNode = this.getAllRowNodes()[topLevelIndex];
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

        this.getAllRowNodes().forEach(rowNode => {
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