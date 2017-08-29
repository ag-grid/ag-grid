// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Context } from "../../context/context";
import { EventService } from "../../eventService";
import { RowDataTransaction, RowNodeTransaction } from "./inMemoryRowModel";
import { ColumnController } from "../../columnController/columnController";
export declare class InMemoryNodeManager {
    private static TOP_LEVEL;
    private rootNode;
    private gridOptionsWrapper;
    private context;
    private eventService;
    private columnController;
    private nextId;
    private static ROOT_NODE_ID;
    private getNodeChildDetails;
    private doesDataFlower;
    private suppressParentsInRowNodes;
    private allNodesMap;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService, columnController: ColumnController);
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): RowNode[];
    updateRowData(rowDataTran: RowDataTransaction): RowNodeTransaction;
    private addRowNode(data, index?);
    private updatedRowNode(data, update);
    private recursiveFunction(rowData, parent, level);
    private createNode(dataItem, parent, level);
    private isExpanded(level);
    private setLeafChildren(node);
    insertItemsAtIndex(index: number, rowData: any[]): RowNode[];
    removeItems(rowNodes: RowNode[]): RowNode[];
    addItems(items: any): RowNode[];
    isRowsAlreadyGrouped(): boolean;
}
