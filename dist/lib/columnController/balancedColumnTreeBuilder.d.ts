// Type definitions for ag-grid v16.0.1
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
    private setBeans(loggerFactory);
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroupChild[];
    private createAutoGroupTreeItem(balancedColumnTree, column);
    private findDept(balancedColumnTree);
    createBalancedColumnGroups(abstractColDefs: (ColDef | ColGroupDef)[], primaryColumns: boolean): any;
    private balanceColumnTree(unbalancedTree, currentDept, columnDept, columnKeyCreator);
    private findMaxDept(treeChildren, dept);
    private recursivelyCreateColumns(abstractColDefs, level, columnKeyCreator, primaryColumns);
    private createColumnGroup(columnKeyCreator, primaryColumns, colGroupDef, level);
    private createMergedColGroupDef(colGroupDef);
    private createColumn(columnKeyCreator, primaryColumns, colDef);
    private mergeColDefs(colDef);
    private assignColumnTypes(colDef, colDefMerged);
    private checkForDeprecatedItems(colDef);
    private isColumnGroup(abstractColDef);
}
