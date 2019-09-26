// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Context } from "../../context/context";
import { EventService } from "../../eventService";
import { RowDataTransaction, RowNodeTransaction } from "./clientSideRowModel";
import { ColumnController } from "../../columnController/columnController";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";
import { SelectionController } from "../../selectionController";
export declare class ClientSideNodeManager {
    private static TOP_LEVEL;
    private rootNode;
    private gridOptionsWrapper;
    private context;
    private eventService;
    private columnController;
    private selectionController;
    private nextId;
    private static ROOT_NODE_ID;
    private getNodeChildDetails;
    private doesDataFlower;
    private isRowMasterFunc;
    private suppressParentsInRowNodes;
    private doingLegacyTreeData;
    private doingMasterDetail;
    private allNodesMap;
    private columnApi;
    private gridApi;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService, columnController: ColumnController, gridApi: GridApi, columnApi: ColumnApi, selectionController: SelectionController);
    postConstruct(): void;
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): RowNode[];
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {
        [id: string]: number;
    } | null | undefined): RowNodeTransaction | null;
    private executeAdd;
    private executeRemove;
    private executeUpdate;
    private addRowNode;
    private lookupRowNode;
    private recursiveFunction;
    private createNode;
    private isExpanded;
    private setLeafChildren;
    isLegacyTreeData(): boolean;
}
