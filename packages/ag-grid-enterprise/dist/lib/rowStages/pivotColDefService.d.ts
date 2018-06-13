// ag-grid-enterprise v18.0.1
import { ColDef, ColGroupDef } from "ag-grid/main";
export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}
export declare class PivotColDefService {
    private columnController;
    private gridOptionsWrapper;
    createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult;
    private recursivelyAddGroup(parentChildren, pivotColumnDefs, index, uniqueValues, pivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
    private addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);
    private recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
    private addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, pivotColumns, columnIdSequence);
    private extractColIdsForValueColumn(groupDef, valueColumn);
    private createRowGroupTotal(parentChildren, pivotColumnDefs, index, pivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns, valueColumn, colIds, insertAfter);
    private createColDef(valueColumn, headerName, pivotKeys, columnIdSequence);
    private sameAggFuncs(aggFuncs);
    private headerNameComparator(userComparator, a, b);
}
