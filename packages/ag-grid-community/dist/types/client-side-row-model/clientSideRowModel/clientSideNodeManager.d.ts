import { Beans, ColumnModel, EventService, RowDataTransaction, RowNode, RowNodeTransaction, GridOptionsService, ISelectionService } from "ag-grid-community";
export declare class ClientSideNodeManager {
    private static TOP_LEVEL;
    private readonly rootNode;
    private gos;
    private eventService;
    private columnModel;
    private selectionService;
    private beans;
    private nextId;
    private static ROOT_NODE_ID;
    private rowCountReady;
    private allNodesMap;
    constructor(rootNode: RowNode, gos: GridOptionsService, eventService: EventService, columnModel: ColumnModel, selectionService: ISelectionService, beans: Beans);
    getCopyOfNodesMap(): {
        [id: string]: RowNode;
    };
    getRowNode(id: string): RowNode | undefined;
    setRowData(rowData: any[]): RowNode[] | undefined;
    updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {
        [id: string]: number;
    } | null | undefined): RowNodeTransaction;
    isRowCountReady(): boolean;
    private dispatchRowDataUpdateStartedEvent;
    private updateSelection;
    private executeAdd;
    private executeRemove;
    private executeUpdate;
    private lookupRowNode;
    private createNode;
    private setMasterForRow;
    private isExpanded;
}
