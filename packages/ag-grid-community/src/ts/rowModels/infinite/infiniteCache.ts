import { RowNode } from "../../entities/rowNode";
import { Autowired, Context, PostConstruct, Qualifier } from "../../context/context";
import { EventService } from "../../eventService";
import { Events, RowDataUpdatedEvent } from "../../events";
import { LoggerFactory } from "../../logger";
import { IDatasource } from "../iDatasource";
import { InfiniteBlock } from "./infiniteBlock";
import { RowNodeCache, RowNodeCacheParams } from "../cache/rowNodeCache";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";

export interface InfiniteCacheParams extends RowNodeCacheParams {
    datasource: IDatasource;
}

export class InfiniteCache extends RowNodeCache<InfiniteBlock, InfiniteCacheParams> {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor(params: InfiniteCacheParams) {
        super(params);
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    }

    @PostConstruct
    protected init(): void {
        super.init();
        // start load of data, as the virtualRowCount will remain at 0 otherwise,
        // so we need this to kick things off, otherwise grid would never call getRow()
        this.getRow(0);
    }

    private moveItemsDown(block: InfiniteBlock, moveFromIndex: number, moveCount: number): void {
        const startRow = block.getStartRow();
        const endRow = block.getEndRow();
        const indexOfLastRowToMove = moveFromIndex + moveCount;

        // all rows need to be moved down below the insertion index
        for (let currentRowIndex = endRow - 1; currentRowIndex >= startRow; currentRowIndex--) {
            // don't move rows at or before the insertion index
            if (currentRowIndex < indexOfLastRowToMove) {
                continue;
            }

            const indexOfNodeWeWant = currentRowIndex - moveCount;
            const nodeForThisIndex = this.getRow(indexOfNodeWeWant, true);

            if (nodeForThisIndex) {
                block.setRowNode(currentRowIndex, nodeForThisIndex);
            } else {
                block.setBlankRowNode(currentRowIndex);
                block.setDirty();
            }
        }
    }

    private insertItems(block: InfiniteBlock, indexToInsert: number, items: any[]): RowNode[] {
        const pageStartRow = block.getStartRow();
        const pageEndRow = block.getEndRow();
        const newRowNodes: RowNode[] = [];

        // next stage is insert the rows into this page, if applicable
        for (let index = 0; index < items.length; index++) {
            const rowIndex = indexToInsert + index;

            const currentRowInThisPage = rowIndex >= pageStartRow && rowIndex < pageEndRow;

            if (currentRowInThisPage) {
                const dataItem = items[index];
                const newRowNode = block.setNewData(rowIndex, dataItem);
                newRowNodes.push(newRowNode);
            }
        }

        return newRowNodes;
    }

    public insertItemsAtIndex(indexToInsert: number | undefined, items: any[] | undefined): void {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order

        const newNodes: RowNode[] = [];
        this.forEachBlockInReverseOrder(block => {
            const pageEndRow = block.getEndRow();

            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) {
                return;
            }

            this.moveItemsDown(block, indexToInsert, items.length);
            const newNodesThisPage = this.insertItems(block, indexToInsert, items);
            newNodesThisPage.forEach(rowNode => newNodes.push(rowNode));
        });

        if (this.isMaxRowFound()) {
            this.hack_setVirtualRowCount(this.getVirtualRowCount() + items.length);
        }

        this.onCacheUpdated();

        const event: RowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    public getRow(rowIndex: number, dontCreatePage = false): RowNode {
        const blockId = Math.floor(rowIndex / this.cacheParams.blockSize);
        let block = this.getBlock(blockId);

        if (!block) {
            if (dontCreatePage) {
                return null;
            } else {
                block = this.createBlock(blockId);
            }
        }

        return block.getRow(rowIndex);
    }

    private createBlock(blockNumber: number): InfiniteBlock {
        const newBlock = new InfiniteBlock(blockNumber, this.cacheParams);
        this.getContext().wireBean(newBlock);
        this.postCreateBlock(newBlock);
        return newBlock;
    }

    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    public refreshCache(): void {
        this.forEachBlockInOrder(block => block.setDirty());
        this.checkBlockToLoad();
    }

}