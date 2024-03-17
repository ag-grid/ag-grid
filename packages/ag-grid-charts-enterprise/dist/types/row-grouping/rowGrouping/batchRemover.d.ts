import { RowNode } from "ag-grid-community";
export declare class BatchRemover {
    private allSets;
    private allParents;
    removeFromChildrenAfterGroup(parent: RowNode, child: RowNode): void;
    isRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): boolean;
    preventRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): void;
    removeFromAllLeafChildren(parent: RowNode, child: RowNode): void;
    private getSet;
    getAllParents(): RowNode[];
    flush(): void;
}
