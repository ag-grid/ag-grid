import type { BeanCollection, EventService, FuncColsService, GridOptionsService, ISelectionService, RowDataTransaction, RowNodeTransaction } from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';
export declare class ClientSideNodeManager {
    private readonly rootNode;
    private gos;
    private eventService;
    private funcColsService;
    private selectionService;
    private beans;
    private nextId;
    private rowCountReady;
    private allNodesMap;
    constructor(rootNode: RowNode, gos: GridOptionsService, eventService: EventService, funcColsService: FuncColsService, selectionService: ISelectionService, beans: BeanCollection);
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
