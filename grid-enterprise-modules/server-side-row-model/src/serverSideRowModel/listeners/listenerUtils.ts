import { Autowired, Bean, ColumnModel } from "@ag-grid-community/core";

@Bean('ssrmListenerUtils')
export class ListenerUtils {

    @Autowired('columnModel') private columnModel: ColumnModel;

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.columnModel.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.columnModel.getSecondaryColumns()) {
            return false;
        }

        const secondaryColIds = this.columnModel.getSecondaryColumns()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

}