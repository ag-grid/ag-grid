import { BaseBean } from '../context/bean';
import { Autowired, Bean } from '../context/context';
import { Column } from '../entities/column';
import { _missing } from '../utils/generic';
import { ColumnState } from './columnApplyStateService';
import { ColumnModel } from './columnModel';
import { FuncColsService } from './funcColsService';

@Bean('columnGetStateService')
export class ColumnGetStateService extends BaseBean {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('funcColsService') private funcColsService: FuncColsService;

    public getColumnState(): ColumnState[] {
        const primaryCols = this.columnModel.getColDefCols();

        if (_missing(primaryCols) || !this.columnModel.isAlive()) {
            return [];
        }

        const colsForState = this.columnModel.getAllCols();
        const res: ColumnState[] = colsForState.map(this.createStateItemFromColumn.bind(this));

        this.orderColumnStateList(res);

        return res;
    }

    private createStateItemFromColumn(column: Column): ColumnState {
        const rowGorupColumns = this.funcColsService.getRowGroupColumns();
        const pivotColumns = this.funcColsService.getPivotColumns();

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
