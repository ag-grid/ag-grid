// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from "../entities/colDef";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { Column } from "../entities/column";
export declare class ColumnFactory {
    private gridOptionsWrapper;
    private columnUtils;
    private context;
    private logger;
    private setBeans;
    createColumnTree(defs: (ColDef | ColGroupDef)[], primaryColumns: boolean, existingColumns?: Column[]): {
        columnTree: OriginalColumnGroupChild[];
        treeDept: number;
    };
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroupChild[];
    private createAutoGroupTreeItem;
    private findDept;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    private findExistingColumn;
    mergeColDefs(colDef: ColDef): ColDef;
    private assignColumnTypes;
    private checkForDeprecatedItems;
    private isColumnGroup;
}
//# sourceMappingURL=columnFactory.d.ts.map