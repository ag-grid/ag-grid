// ag-grid-enterprise v19.1.3
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
//# sourceMappingURL=pivotColDefService.d.ts.map