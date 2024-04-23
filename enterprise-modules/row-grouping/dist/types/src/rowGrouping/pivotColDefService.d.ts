import { BeanStub, ColDef, ColGroupDef, IPivotColDefService } from "@ag-grid-community/core";
export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}
export declare class PivotColDefService extends BeanStub implements IPivotColDefService {
    static PIVOT_ROW_TOTAL_PREFIX: string;
    private columnModel;
    private fieldSeparator;
    private pivotDefaultExpanded;
    init(): void;
    createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult;
    private createPivotColumnsFromUniqueValues;
    private recursivelyBuildGroup;
    private buildMeasureCols;
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
    private generateColumnGroupId;
    private generateColumnId;
    /**
     * Used by the SSRM to create secondary columns from provided fields
     * @param fields
     */
    createColDefsFromFields(fields: string[]): (ColDef | ColGroupDef)[];
}
