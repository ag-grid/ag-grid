// Type definitions for ag-grid-community v19.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from "../entities/colDef";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { Column } from "../entities/column";
export declare class BalancedColumnTreeBuilder {
    private gridOptionsWrapper;
    private columnUtils;
    private context;
    private logger;
    private setBeans;
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroupChild[];
    private createAutoGroupTreeItem;
    private findDept;
    createBalancedColumnGroups(abstractColDefs: (ColDef | ColGroupDef)[], primaryColumns: boolean): any;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    mergeColDefs(colDef: ColDef): ColDef;
    private assignColumnTypes;
    private checkForDeprecatedItems;
    private isColumnGroup;
}
