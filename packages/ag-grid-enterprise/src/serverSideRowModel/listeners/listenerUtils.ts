import type { BeanCollection, IPivotResultColsService, IValueColsService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ListenerUtils extends BeanStub implements NamedBean {
    beanName = 'ssrmListenerUtils' as const;

    private pivotResultCols?: IPivotResultColsService;
    private valueColsSvc?: IValueColsService;

    public wireBeans(beans: BeanCollection) {
        this.pivotResultCols = beans.pivotResultCols;
        this.valueColsSvc = beans.valueColsSvc;
    }

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = (this.valueColsSvc?.columns ?? []).map((col) => col.colId);

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        const pivotCols = this.pivotResultCols?.pivotCols;
        if (!pivotCols) {
            return false;
        }

        const secondaryColIds = pivotCols.map((col) => col.colId);

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }
}
