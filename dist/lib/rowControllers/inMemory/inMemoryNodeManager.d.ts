// Type definitions for ag-grid v5.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Context } from "../../context/context";
import { EventService } from "../../eventService";
export declare class InMemoryNodeManager {
    private static TOP_LEVEL;
    private rootNode;
    private gridOptionsWrapper;
    private context;
    private eventService;
    private nextId;
    private getNodeChildDetails;
    private suppressParentsInRowNodes;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService);
    setRowData(rowData: any[], firstId?: number): RowNode[];
    private recursiveFunction(rowData, parent, level);
    private createNode(dataItem, parent, level);
    private setLeafChildren(node);
    insertItemsAtIndex(index: number, rowData: any[]): RowNode[];
    removeItems(rowNodes: RowNode[]): RowNode[];
    addItems(items: any): RowNode[];
    isRowsAlreadyGrouped(): boolean;
}
