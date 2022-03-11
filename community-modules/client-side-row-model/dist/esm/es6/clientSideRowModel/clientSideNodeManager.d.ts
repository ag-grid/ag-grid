import { ColumnApi, ColumnModel, EventService, GridApi, GridOptionsWrapper, RowDataTransaction, RowNode, RowNodeTransaction, SelectionService, Beans } from "@ag-grid-community/core";
export declare class ClientSideNodeManager {
    private static TOP_LEVEL;
    private readonly columnApi;
    private readonly gridApi;
    private readonly rootNode;
    private gridOptionsWrapper;
    private eventService;
    private columnModel;
    private selectionService;
    private beans;
    private nextId;
    private static ROOT_NODE_ID;
    private isRowMasterFunc?;
    private suppressParentsInRowNodes;
    private doingTreeData;
    private doingMasterDetail;
    private allNodesMap;
    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, columnModel: ColumnModel, gridApi: GridApi, columnApi: ColumnApi, selectionService: SelectionService, beans: Beans);
    postConstruct(): void;
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode | undefined;
    setRowData(rowData: any[]): RowNode[] | undefined;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {
        [id: string]: number;
    } | null | undefined): RowNodeTransaction;
    private updateSelection;
    private executeAdd;
    private executeRemove;
    private executeUpdate;
    private lookupRowNode;
    private createNode;
    private setMasterForRow;
    private isExpanded;
}
