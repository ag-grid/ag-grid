import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _missing } from '../utils/generic';
import type { ColumnState } from './columnApplyStateService';
import type { ColumnModel } from './columnModel';
import type { FuncColsService } from './funcColsService';

export class ColumnGetStateService extends BeanStub implements NamedBean {
    beanName = 'columnGetStateService' as const;

    private columnModel: ColumnModel;
    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.funcColsService = beans.funcColsService;
    }

    public getColumnState(): ColumnState[] {
        const primaryCols = this.columnModel.getColDefCols();

        if (_missing(primaryCols) || !this.columnModel.isAlive()) {
            return [];
        }

        const colsForState = this.columnModel.getAllCols();
        const res = colsForState.map((col) => this.createStateItemFromColumn(col));

        this.orderColumnStateList(res);

        return res;
    }

    private createStateItemFromColumn(column: AgColumn): ColumnState {
        const rowGorupColumns = this.funcColsService.rowGroupCols;
        const pivotColumns = this.funcColsService.pivotCols;

        const rowGroupIndex = column.isRowGroupActive() ? rowGorupColumns.indexOf(column) : null;
        const pivotIndex = column.isPivotActive() ? pivotColumns.indexOf(column) : null;

        const aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        const sort = column.getSort() != null ? column.getSort() : null;
        const sortIndex = column.getSortIndex() != null ? column.getSortIndex() : null;
        const flex = column.getFlex() != null && column.getFlex() > 0 ? column.getFlex() : null;

        const res: ColumnState = {
            colId: column.getColId(),
            width: column.getActualWidth(),
            hide: !column.isVisible(),
            pinned: column.getPinned(),
            sort,
            sortIndex,
            aggFunc,
            rowGroup: column.isRowGroupActive(),
            rowGroupIndex,
            pivot: column.isPivotActive(),
            pivotIndex: pivotIndex,
            flex,
        };

        return res;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        const gridColumns = this.columnModel.getCols();
        // for fast looking, store the index of each column
        const colIdToGridIndexMap = new Map<string, number>(gridColumns.map((col, index) => [col.getColId(), index]));

        columnStateList.sort((itemA: any, itemB: any) => {
            const posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            const posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA! - posB!;
        });
    }
}
