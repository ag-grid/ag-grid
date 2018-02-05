// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    private isRowMasterFunc;
    private suppressParentsInRowNodes;
    private doingLegacyTreeData;
    private doingMasterDetail;
    private allNodesMap;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService, columnController: ColumnController);
    postConstruct(): void;
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): RowNode[];
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {
        [id: string]: number;
    }): RowNodeTransaction;
    private addRowNode(data, index?);
    private updatedRowNode(data, update);
    private recursiveFunction(rowData, parent, level);
    private createNode(dataItem, parent, level);
    private isExpanded(level);
    private setLeafChildren(node);
    insertItemsAtIndex(index: number, rowData: any[]): RowNode[];
    addItems(items: any): RowNode[];
    isLegacyTreeData(): boolean;
}
