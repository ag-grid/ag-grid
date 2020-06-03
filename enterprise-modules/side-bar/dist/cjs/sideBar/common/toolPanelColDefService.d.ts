import { AbstractColDef, BeanStub, OriginalColumnGroupChild } from "@ag-grid-community/core";
export declare class ToolPanelColDefService extends BeanStub {
    private columnController;
    createColumnTree(colDefs: AbstractColDef[]): OriginalColumnGroupChild[];
    syncLayoutWithGrid(syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void;
    private getLeafPathTrees;
    private mergeLeafPathTrees;
    private addChildrenToGroup;
    private isColGroupDef;
    private getId;
}
