import { AbstractColDef, BeanStub, IProvidedColumn } from "ag-grid-community";
export declare class ToolPanelColDefService extends BeanStub {
    private columnModel;
    createColumnTree(colDefs: AbstractColDef[]): IProvidedColumn[];
    syncLayoutWithGrid(syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void;
    private getLeafPathTrees;
    private mergeLeafPathTrees;
    private addChildrenToGroup;
    private isColGroupDef;
    private getId;
}
