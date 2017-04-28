import {
    InfiniteCacheParams,
    _,
    Logger,
    IEnterpriseGetRowsRequest,
    RowNode,
    Context,
    PostConstruct,
    Autowired,
    Events,
    EventService,
    IEnterpriseCache,
    IEnterpriseDatasource,
    IEnterpriseGetRowsParams,
    NumberSequence,
    RowNodeBlock,
    RowNodeCache,
    RowNodeCacheParams,
    ColumnVO,
    Qualifier,
    LoggerFactory
} from "ag-grid";
import {EnterpriseRowModel} from "./enterpriseRowModel";
import {EnterpriseCache, EnterpriseCacheParams} from "./enterpriseCache";

export class EnterpriseBlock extends RowNodeBlock {

    @Autowired('context') private context: Context;

    private logger: Logger;

    private displayStartIndex: number;
    private displayEndIndex: number;
    private params: EnterpriseCacheParams;
    private parentCache: EnterpriseCache;

    private parentRowNode: RowNode;

    private level: number;
    private groupLevel: boolean;
    private groupField: string;

    constructor(pageNumber: number, parentRowNode: RowNode, params: EnterpriseCacheParams, parentCache: EnterpriseCache) {
        super(pageNumber, params);
        this.params = params;
        this.parentRowNode = parentRowNode;
        this.parentCache = parentCache;

        this.level = parentRowNode.level + 1;
        this.groupLevel = this.level < params.rowGroupCols.length;
        if (this.groupLevel) {
            this.groupField = params.rowGroupCols[this.level].field;
        }
    }

    public getRow(rowIndex: number): RowNode {

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
            console.log(`ag-grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return null;
        }

        while (true) {

            let midPointer = Math.floor((bottomPointer + topPointer) / 2);
            let currentRowNode = super.getRow(midPointer);

            if (currentRowNode.rowIndex === rowIndex) {
                return currentRowNode;
            }

            let childrenCache = <EnterpriseCache> currentRowNode.childrenCache;
            if (currentRowNode.rowIndex === rowIndex) {
                return currentRowNode;
            } else if (currentRowNode.expanded && childrenCache && childrenCache.isIndexInCache(rowIndex)) {
                return childrenCache.getRow(rowIndex);
            } else if (currentRowNode.rowIndex < rowIndex) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowIndex > rowIndex) {
                topPointer = midPointer - 1;
            }
        }
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseBlock');
    }

    @PostConstruct
    protected init(): void {
        super.init({
            context: this.context
        });
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = false;

        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
            rowNode.key = data[this.groupField];
        } else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
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
        rowNode.level = this.level;
        rowNode.parent = this.parentRowNode;

        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;

        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = this.groupField;
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

    public setDisplayIndexes(displayIndexSeq: NumberSequence, virtualRowCount: number): void {
        this.displayStartIndex = displayIndexSeq.peek();

        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<=end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            //
            if (i >= virtualRowCount) { continue; }

            let rowNode = super.getRow(i);
            if (rowNode) {
                let rowIndex = displayIndexSeq.next();
                rowNode.setRowIndex(rowIndex);
                rowNode.rowTop = this.params.rowHeight * rowIndex;

                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                    enterpriseCache.setDisplayIndexes(displayIndexSeq);
                }
            }
        }

        this.displayEndIndex = displayIndexSeq.peek();
    }

    private createLoadParams(): IEnterpriseGetRowsParams {
        let groupKeys = this.createGroupKeys(this.parentRowNode);

        let request: IEnterpriseGetRowsRequest = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            rowGroupCols: this.params.rowGroupCols,
            valueCols: this.params.valueCols,
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

    public isIndexInBlock(index: number): boolean {
        return index >= this.displayStartIndex && index < this.displayEndIndex;
    }

    public isBlockBefore(index: number): boolean {
        return index >= this.displayEndIndex;
    }

    public getDisplayStartIndex(): number {
        return this.displayStartIndex;
    }

}