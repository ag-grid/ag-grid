import { ColDef, ColGroupDef } from "../entities/colDef";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnFactory extends BeanStub {
    private columnUtils;
    private logger;
    private setBeans;
    createColumnTree(defs: (ColDef | ColGroupDef)[] | null, primaryColumns: boolean, existingTree?: OriginalColumnGroupChild[]): {
        columnTree: OriginalColumnGroupChild[];
        treeDept: number;
    };
    private extractExistingTreeData;
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroupChild[];
    private createAutoGroupTreeItem;
    private findDepth;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    private applyColumnState;
    findExistingColumn(newColDef: ColDef, existingColsCopy: Column[] | null): Column | null;
    findExistingGroup(newGroupDef: ColGroupDef, existingGroups: OriginalColumnGroup[]): OriginalColumnGroup | null;
    mergeColDefs(colDef: ColDef): ColDef;
    private assignColumnTypes;
    private checkForDeprecatedItems;
    private isColumnGroup;
}
