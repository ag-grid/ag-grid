import { RowNode } from "./entities/rowNode";
import { BeanStub } from "./context/beanStub";
import { ChangedPath } from "./utils/changedPath";
export declare class SelectionService extends BeanStub {
    private rowModel;
    private selectedNodes;
    private logger;
    private lastSelectedNode;
    private groupSelectsChildren;
    private setBeans;
    private init;
    setLastSelectedNode(rowNode: RowNode): void;
    getLastSelectedNode(): RowNode | null;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    removeGroupsFromSelection(): void;
    updateGroupsFromChildrenSelections(changedPath?: ChangedPath): void;
    getNodeForIdIfSelected(id: number): RowNode | undefined;
    clearOtherNodes(rowNodeToKeepSelected: RowNode): number;
    private onRowSelected;
    syncInRowNode(rowNode: RowNode, oldNode: RowNode | null): void;
    private syncInOldRowNode;
    private syncInNewRowNode;
    reset(): void;
    getBestCostNodeSelection(): RowNode[] | undefined;
    setRowModel(rowModel: any): void;
    isEmpty(): boolean;
    deselectAllRowNodes(justFiltered?: boolean): void;
    selectAllRowNodes(justFiltered?: boolean): void;
    /**
     * @method
     * @deprecated
     */
    selectNode(rowNode: RowNode | undefined, tryMulti: boolean): void;
    /**
     * @method
     * @deprecated
     */
    deselectIndex(rowIndex: number): void;
    /**
     * @method
     * @deprecated
     */
    deselectNode(rowNode: RowNode | undefined): void;
    /**
     * @method
     * @deprecated
     */
    selectIndex(index: any, tryMulti: boolean): void;
}
