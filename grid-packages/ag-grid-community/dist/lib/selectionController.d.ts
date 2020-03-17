import { RowNode } from "./entities/rowNode";
import { ChangedPath } from "./utils/changedPath";
export declare class SelectionController {
    private eventService;
    private rowModel;
    private gridOptionsWrapper;
    private columnApi;
    private gridApi;
    private selectedNodes;
    private logger;
    private lastSelectedNode;
    private groupSelectsChildren;
    private setBeans;
    init(): void;
    setLastSelectedNode(rowNode: RowNode): void;
    getLastSelectedNode(): RowNode | null;
    getSelectedNodes(): RowNode[];
    getSelectedRows(): any[];
    removeGroupsFromSelection(): void;
    updateGroupsFromChildrenSelections(changedPath?: ChangedPath): void;
    getNodeForIdIfSelected(id: number): RowNode | undefined;
    clearOtherNodes(rowNodeToKeepSelected: RowNode): number;
    private onRowSelected;
    syncInRowNode(rowNode: RowNode, oldNode: RowNode): void;
    private syncInOldRowNode;
    private syncInNewRowNode;
    reset(): void;
    getBestCostNodeSelection(): any;
    setRowModel(rowModel: any): void;
    isEmpty(): boolean;
    deselectAllRowNodes(justFiltered?: boolean): void;
    selectAllRowNodes(justFiltered?: boolean): void;
    /**
     * @method
     * @deprecated
     */
    selectNode(rowNode: RowNode | null, tryMulti: boolean): void;
    /**
     * @method
     * @deprecated
     */
    deselectIndex(rowIndex: number): void;
    /**
     * @method
     * @deprecated
     */
    deselectNode(rowNode: RowNode | null): void;
    /**
     * @method
     * @deprecated
     */
    selectIndex(index: any, tryMulti: boolean): void;
}
