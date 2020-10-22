import { BeanStub, ColDef, ColGroupDef } from "@ag-grid-community/core";
export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}
export declare class PivotColDefService extends BeanStub {
    static PIVOT_ROW_TOTAL_PREFIX: string;
    private columnController;
    private gridOptionsWrapper;
    createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult;
    private recursivelyAddGroup;
    private addExpandablePivotGroups;
    private addPivotTotalsToGroups;
    private recursivelyAddPivotTotal;
    private addRowGroupTotals;
    private extractColIdsForValueColumn;
    private createRowGroupTotal;
    private createColDef;
    private sameAggFuncs;
    private headerNameComparator;
    private merge;
}
