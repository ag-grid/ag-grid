import type { IColsService, _BeanCollection, _IPivotResultColsService, _NamedBean } from 'ag-grid-community';
import { _BeanStub } from 'ag-grid-community';

export class ListenerUtils extends _BeanStub implements _NamedBean {
    beanName = 'ssrmListenerUtils' as const;

    private pivotResultCols?: _IPivotResultColsService;
    private valueColsSvc?: IColsService;

    public wireBeans(beans: _BeanCollection) {
        this.pivotResultCols = beans.pivotResultCols;
        this.valueColsSvc = beans.valueColsSvc;
    }

    public isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = (this.valueColsSvc?.columns ?? []).map((col) => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    public isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        const pivotResultCols = this.pivotResultCols?.getPivotResultCols();
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
