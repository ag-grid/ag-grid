import { ColDef, ColGroupDef } from "../entities/colDef";
import { IProvidedColumn } from "../entities/iProvidedColumn";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnFactory extends BeanStub {
    private columnUtils;
    private logger;
    private setBeans;
    createColumnTree(defs: (ColDef | ColGroupDef)[] | null, primaryColumns: boolean, existingTree?: IProvidedColumn[]): {
        columnTree: IProvidedColumn[];
        treeDept: number;
    };
    private extractExistingTreeData;
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: IProvidedColumn[]): IProvidedColumn[];
    private createAutoGroupTreeItem;
    private findDepth;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    applyColumnState(column: Column, colDef: ColDef): void;
    private findExistingColumn;
    private findExistingGroup;
    mergeColDefs(colDef: ColDef): ColDef;
    private assignColumnTypes;
    private checkForDeprecatedItems;
    private isColumnGroup;
}
