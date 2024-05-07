import { Autowired, Bean, FunctionColumnsService, PivotResultColsService } from "@ag-grid-community/core";

@Bean('ssrmListenerUtils')
export class ListenerUtils {

    @Autowired('pivotResultColsService') private pivotResultColsService: PivotResultColsService;
    @Autowired('functionColumnsService') private functionColumnsService: FunctionColumnsService;

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.functionColumnsService.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.pivotResultColsService.getPivotResultCols()) {
            return false;
        }

        const secondaryColIds = this.pivotResultColsService.getPivotResultCols()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

}