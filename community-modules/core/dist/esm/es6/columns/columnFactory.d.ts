// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from "../entities/colDef";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
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
    private isColumnGroup;
}
