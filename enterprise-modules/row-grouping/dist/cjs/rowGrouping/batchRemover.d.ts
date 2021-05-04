import { RowNode } from "@ag-grid-community/core";
export declare class BatchRemover {
    private allSets;
    private allParents;
    removeFromChildrenAfterGroup(parent: RowNode, child: RowNode): void;
    removeFromAllLeafChildren(parent: RowNode, child: RowNode): void;
    private getSet;
    getAllParents(): RowNode[];
    flush(): void;
}
