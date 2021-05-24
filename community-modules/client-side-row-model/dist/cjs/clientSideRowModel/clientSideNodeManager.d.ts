import { ColumnApi, ColumnController, Context, EventService, GridApi, GridOptionsWrapper, RowDataTransaction, RowNode, RowNodeTransaction, SelectionController } from "@ag-grid-community/core";
export declare class ClientSideNodeManager {
    private static TOP_LEVEL;
    private readonly columnApi;
    private readonly gridApi;
    private readonly rootNode;
    private gridOptionsWrapper;
    private context;
    private eventService;
    private columnController;
    private selectionController;
    private nextId;
    private static ROOT_NODE_ID;
    private isRowMasterFunc?;
    private suppressParentsInRowNodes;
    private doingTreeData;
    private doingMasterDetail;
    private allNodesMap;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService, columnController: ColumnController, gridApi: GridApi, columnApi: ColumnApi, selectionController: SelectionController);
    postConstruct(): void;
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode;
    setRowData(rowData: any[]): RowNode[] | undefined;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {
        [id: string]: number;
    } | null | undefined): RowNodeTransaction;
    private updateSelection;
    private executeAdd;
    private executeRemove;
    private executeUpdate;
    private lookupRowNode;
    private recursiveFunction;
    private createNode;
    private setMasterForRow;
    private isExpanded;
}
