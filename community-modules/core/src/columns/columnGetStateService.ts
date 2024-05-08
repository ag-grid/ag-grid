import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { missing } from "../utils/generic";
import { convertToMap } from "../utils/map";
import { ColumnModel, ColumnState } from "./columnModel";
import { FunctionColumnsService } from "./functionColumnsService";

@Bean('columnGetStateService')
export class ColumnGetStateService {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('functionColumnsService') private functionColumnsService: FunctionColumnsService;

    public getColumnState(): ColumnState[] {
        const primaryCols = this.columnModel.getAllProvidedCols();

        if (missing(primaryCols) || !this.columnModel.isAlive()) { return []; }

        const colsForState = this.columnModel.getProvidedAndPivotResultAndAutoColumns();
        const res: ColumnState[] = colsForState.map(this.createStateItemFromColumn.bind(this));

        this.orderColumnStateList(res);

        return res;

    }

    private createStateItemFromColumn(column: Column): ColumnState {
        const rowGorupColumns = this.functionColumnsService.getRowGroupColumns();
        const pivotColumns = this.functionColumnsService.getPivotColumns();

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
            flex
        };

        return res;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        const gridColumns = this.columnModel.getLiveCols();
        // for fast looking, store the index of each column
        const colIdToGridIndexMap = convertToMap<string, number>(gridColumns.map((col, index) => [col.getColId(), index]));

        columnStateList.sort((itemA: any, itemB: any) => {
            const posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            const posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA! - posB!;
        });
    }

}
