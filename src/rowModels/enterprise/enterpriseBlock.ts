import {
    _,
    Autowired,
    Context,
    RowRenderer,
    IEnterpriseGetRowsParams,
    IEnterpriseGetRowsRequest,
    Logger,
    NumberSequence,
    PostConstruct,
    RowNodeBlock,
    LoggerFactory,
    Qualifier,
    RowNode,
    Column,
    ColumnController,
    ValueService,
    GridOptionsWrapper,
    RowBounds
} from "ag-grid";

import {EnterpriseCache, EnterpriseCacheParams} from "./enterpriseCache";

export class EnterpriseBlock extends RowNodeBlock {

    @Autowired('context') private context: Context;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private logger: Logger;

    private displayIndexStart: number;
    private displayIndexEnd: number;

    private blockTop: number;
    private blockHeight: number;

    private params: EnterpriseCacheParams;
    private parentCache: EnterpriseCache;

    private parentRowNode: RowNode;

    private level: number;
    private groupLevel: boolean;
    private leafGroup: boolean;
    private groupField: string;
    private rowGroupColumn: Column;
    private nodeIdPrefix: string;

    constructor(pageNumber: number, parentRowNode: RowNode, params: EnterpriseCacheParams, parentCache: EnterpriseCache) {
        super(pageNumber, params);
        this.params = params;
        this.parentRowNode = parentRowNode;
        this.parentCache = parentCache;

        this.level = parentRowNode.level + 1;
        this.groupLevel = this.level < params.rowGroupCols.length;
        this.leafGroup = this.level === (params.rowGroupCols.length - 1);
    }

    private createNodeIdPrefix(): void {
        let parts: string[] = [];
        let rowNode = this.parentRowNode;

        // pull keys from all parent nodes, but do not include the root node
        while (rowNode.level >= 0) {
            parts.push(rowNode.key);
            rowNode = rowNode.parent;
        }

        if (parts.length>0) {
            this.nodeIdPrefix = parts.reverse().join('-') + '-';
        }
    }

    protected createIdForIndex(index: number): string {
        if (_.exists(this.nodeIdPrefix)) {
            return this.nodeIdPrefix + index.toString();
        } else {
            return index.toString();
        }
    }

    public getNodeIdPrefix(): string {
        return this.nodeIdPrefix;
    }

    public getRow(displayRowIndex: number): RowNode {

        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        let bottomPointer = this.getStartRow();

        // the end row depends on whether all this block is used or not. if the virtual row count
        // is before the end, then not all the row is used
        let virtualRowCount = this.parentCache.getVirtualRowCount();
        let endRow = this.getEndRow();
        let actualEnd = (virtualRowCount < endRow) ? virtualRowCount : endRow;

        let topPointer = actualEnd - 1;

        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn(`ag-grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return null;
        }

        while (true) {

            let midPointer = Math.floor((bottomPointer + topPointer) / 2);
            let currentRowNode = super.getRowUsingLocalIndex(midPointer);

            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }

            let childrenCache = <EnterpriseCache> currentRowNode.childrenCache;
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            } else if (currentRowNode.expanded && childrenCache && childrenCache.isDisplayIndexInCache(displayRowIndex)) {
                return childrenCache.getRow(displayRowIndex);
            } else if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            }
        }
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseBlock');
    }

    @PostConstruct
    protected init(): void {

        if (this.groupLevel) {
            let groupColVo = this.params.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }

        this.createNodeIdPrefix();

        super.init({
            context: this.context,
            rowRenderer: this.rowRenderer
        });
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        rowNode.stub = false;

        if (_.exists(data)) {
            // if the user is not providing id's, then we build an id based on the index.
            // for infinite scrolling, the index is used on it's own. for enterprise,
            // we combine the index with the level and group key, so that the id is
            // unique across the set.
            //
            // unique id is needed for selection (so selection can be maintained when
            // doing server side sorting / filtering) - if user is not providing id's
            // (and we use the indexes) then selection will not work between sorting &
            // filtering.
            //
            // id's are also used by the row renderer for updating the dom as it identifies
            // rowNodes by id
            let idToUse = this.createIdForIndex(index);

            rowNode.setDataAndId(data, idToUse);
            rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode));

            if (rowNode.group) {
                rowNode.key = this.valueService.getValue(this.rowGroupColumn, rowNode);
            }
        } else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }

        if (this.groupLevel) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
    }

    private setChildCountIntoRowNode(rowNode: RowNode): void {
        let getChildCount = this.gridOptionsWrapper.getChildCountFunc();
        if (getChildCount) {
            rowNode.allChildrenCount = getChildCount(rowNode.data);
        }
    }

    private setGroupDataIntoRowNode(rowNode: RowNode): void {
        let groupDisplayCols: Column[] = this.columnController.getGroupDisplayColumns();

        groupDisplayCols.forEach(col => {
            if (col.isRowGroupDisplayed(this.rowGroupColumn.getId())) {
                let groupValue = this.valueService.getValue(this.rowGroupColumn, rowNode);
                if (_.missing(rowNode.groupData)) {
                    rowNode.groupData = {};
                }
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });

    }

    protected loadFromDatasource(): void {
        let params = this.createLoadParams();
        setTimeout(()=> {
            this.params.datasource.getRows(params);
        }, 0);
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        let rowNode = super.createBlankRowNode(rowIndex);

        rowNode.group = this.groupLevel;
        rowNode.leafGroup = this.leafGroup;
        rowNode.level = this.level;
        rowNode.uiLevel = this.level;
        rowNode.parent = this.parentRowNode;

        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;

        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = this.groupField;
            rowNode.rowGroupColumn = this.rowGroupColumn;
        }

        return rowNode;
    }

    private createGroupKeys(groupNode: RowNode): string[] {
        let keys: string[] = [];

        let pointer = groupNode;
        while (pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }

        keys.reverse();

        return keys;
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.blockTop && pixel < (this.blockTop + this.blockHeight);
    }

    public getRowBounds(index: number, virtualRowCount: number): RowBounds {

        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<=end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) { continue; }

            let rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {

                if (rowNode.rowIndex === index) {
                    return {
                        rowHeight: rowNode.rowHeight,
                        rowTop: rowNode.rowTop
                    };
                }

                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                    if (enterpriseCache.isDisplayIndexInCache(index)) {
                        return enterpriseCache.getRowBounds(index);
                    }
                }
            }
        }

        console.error(`ag-Grid: looking for invalid row index in Enterprise Row Model, index=${index}`);

        return null;
    }

    public getRowIndexAtPixel(pixel: number, virtualRowCount: number): number {

        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<=end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) { continue; }

            let rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {

                if (rowNode.isPixelInRange(pixel)) {
                    return rowNode.rowIndex;
                }

                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                    if (enterpriseCache.isPixelInRange(pixel)) {
                        return enterpriseCache.getRowIndexAtPixel(pixel);
                    }
                }
            }
        }

        console.warn(`ag-Grid: invalid pixel range for enterprise block ${pixel}`);
        return 0;
    }

    public clearRowTops(virtualRowCount: number): void {
        this.forEachRowNode(virtualRowCount, rowNode => {
            rowNode.clearRowTop();

            let hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                enterpriseCache.clearRowTops();
            }
        });
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             virtualRowCount: number,
                             nextRowTop: {value: number}): void {
        this.displayIndexStart = displayIndexSeq.peek();
        
        this.blockTop = nextRowTop.value;

        this.forEachRowNode(virtualRowCount, rowNode => {
            let rowIndex = displayIndexSeq.next();

            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(nextRowTop.value);

            nextRowTop.value += rowNode.rowHeight;

            let hasChildCache = rowNode.group && _.exists(rowNode.childrenCache);
            if (hasChildCache) {
                let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                if (rowNode.expanded) {
                    enterpriseCache.setDisplayIndexes(displayIndexSeq, nextRowTop);
                } else {
                    // we need to clear the row tops, as the row renderer depends on
                    // this to know if the row should be faded out
                    enterpriseCache.clearRowTops();
                }
            }
        });

        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeight = nextRowTop.value - this.blockTop;
    }

    private forEachRowNode(virtualRowCount: number, callback: (rowNode: RowNode)=>void): void {
        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<=end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }

            let rowNode = this.getRowUsingLocalIndex(i);

            if (rowNode) {
                callback(rowNode);
            }
        }
    }

    private createLoadParams(): IEnterpriseGetRowsParams {
        let groupKeys = this.createGroupKeys(this.parentRowNode);

        let request: IEnterpriseGetRowsRequest = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            rowGroupCols: this.params.rowGroupCols,
            valueCols: this.params.valueCols,
            pivotCols: this.params.pivotCols,
            pivotMode: this.params.pivotMode,
            groupKeys: groupKeys,
            filterModel: this.params.filterModel,
            sortModel: this.params.sortModel
        };

        let params = <IEnterpriseGetRowsParams> {
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            request: request
        };

        return params;
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

    public getBlockHeight(): number {
        return this.blockHeight;
    }

    public getBlockTop(): number {
        return this.blockTop;
    }
}