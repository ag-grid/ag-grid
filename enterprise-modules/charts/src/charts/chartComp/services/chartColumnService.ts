import type {
    Column,
    ColumnModel,
    ColumnNameService,
    FuncColsService,
    RowNode,
    RowPositionUtils,
    ShowRowGroupColsService,
    ValueService,
    VisibleColsService,
} from '@ag-grid-community/core';
import { Autowired, Bean, BeanStub, Events, PostConstruct } from '@ag-grid-community/core';

@Bean('chartColumnService')
export class ChartColumnService extends BeanStub {
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('showRowGroupColsService') private showRowGroupColsService: ShowRowGroupColsService;
    @Autowired('columnNameService') private columnNameService: ColumnNameService;
    @Autowired('visibleColsService') private visibleColsService: VisibleColsService;
    @Autowired('funcColsService') private funcColsService: FuncColsService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('rowPositionUtils') private rowPositionUtils: RowPositionUtils;

    private valueColsWithoutSeriesType: Set<string> = new Set();

    @PostConstruct
    private postConstruct(): void {
        const clearValueCols = () => this.valueColsWithoutSeriesType.clear();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, clearValueCols);
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, clearValueCols);
    }

    public getColumn(colId: string): Column | null {
        return this.columnModel.getColDefCol(colId);
    }

    public getAllDisplayedColumns(): Column[] {
        return this.visibleColsService.getAllCols();
    }

    public getColDisplayName(col: Column): string | null {
        return this.columnNameService.getDisplayNameForColumn(col, 'chart');
    }

    public getRowGroupColumns(): Column[] {
        return this.funcColsService.getRowGroupColumns();
    }

    public getGroupDisplayColumns(): Column[] {
        return this.showRowGroupColsService.getShowRowGroupCols();
    }

    public isPivotMode(): boolean {
        return this.columnModel.isPivotMode();
    }

    public isPivotActive(): boolean {
        return this.columnModel.isPivotActive();
    }

    public getChartColumns(): { dimensionCols: Set<Column>; valueCols: Set<Column> } {
        const gridCols = this.columnModel.getCols();

        const dimensionCols = new Set<Column>();
        const valueCols = new Set<Column>();

        gridCols.forEach((col) => {
            const colDef = col.getColDef();
            const chartDataType = colDef.chartDataType;

            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                    case 'time':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn(
                            `AG Grid: unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`
                        );
                        break;
                }
            }

            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.add(col);
                return;
            }

            if (!col.isPrimary()) {
                valueCols.add(col);
                return;
            }

            // if 'chartDataType' is not provided then infer type based data contained in first row
            (this.isInferredValueCol(col) ? valueCols : dimensionCols).add(col);
        });

        return { dimensionCols, valueCols };
    }

    private isInferredValueCol(col: Column): boolean {
        const colId = col.getColId();
        if (colId === 'ag-Grid-AutoColumn') {
            return false;
        }

        const row = this.rowPositionUtils.getRowNode({ rowIndex: 0, rowPinned: null });

        if (!row) {
            return this.valueColsWithoutSeriesType.has(colId);
        }

        let cellValue = this.valueService.getValue(col, row);

        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }

        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }

        const isNumber = typeof cellValue === 'number';

        if (isNumber) {
            this.valueColsWithoutSeriesType.add(colId);
        }

        return isNumber;
    }

    private extractLeafData(row: RowNode, col: Column): any {
        if (!row.allLeafChildren) {
            return null;
        }

        for (let i = 0; i < row.allLeafChildren.length; i++) {
            const childRow = row.allLeafChildren[i];
            const value = this.valueService.getValue(col, childRow);

            if (value != null) {
                return value;
            }
        }

        return null;
    }

    protected destroy(): void {
        this.valueColsWithoutSeriesType.clear();
        super.destroy();
    }
}
