import { Bean, BeanStub } from "@ag-grid-community/core";

@Bean('ssrmListenerUtils')
export class ListenerUtils extends BeanStub {

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.beans.columnModel.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.beans.columnModel.getSecondaryColumns()) {
            return false;
        }

        const secondaryColIds = this.beans.columnModel.getSecondaryColumns()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

}