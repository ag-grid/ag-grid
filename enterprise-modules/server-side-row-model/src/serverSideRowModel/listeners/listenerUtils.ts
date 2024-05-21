import { Autowired, BaseBean, Bean, FuncColsService, PivotResultColsService } from '@ag-grid-community/core';

@Bean('ssrmListenerUtils')
export class ListenerUtils extends BaseBean {
    @Autowired('pivotResultColsService') private pivotResultColsService: PivotResultColsService;
    @Autowired('funcColsService') private funcColsService: FuncColsService;

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.funcColsService.getValueColumns().map((col) => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        if (!pivotResultCols) {
            return false;
        }

        const secondaryColIds = pivotResultCols.list.map((col) => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }
}
