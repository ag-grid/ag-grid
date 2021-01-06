import { Autowired, Bean, ColumnController } from "@ag-grid-community/core";

@Bean('ssrmListenerUtils')
export class ListenerUtils {

    @Autowired('columnController') private columnController: ColumnController;

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.columnController.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.columnController.getSecondaryColumns()) {
            return false;
        }

        const secondaryColIds = this.columnController.getSecondaryColumns()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

}