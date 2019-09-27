// ag-grid-enterprise v21.2.2
import { ColDef, ColGroupDef } from "ag-grid-community";
export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}
export declare class PivotColDefService {
    private columnController;
    private gridOptionsWrapper;
    createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult;
    private recursivelyAddGroup;
    private addPivotTotalsToGroups;
    private recursivelyAddPivotTotal;
    private addRowGroupTotals;
    private extractColIdsForValueColumn;
    private createRowGroupTotal;
    private createColDef;
    private sameAggFuncs;
    private headerNameComparator;
}
