import type {
    AgColumn,
    AgColumnGroup,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FuncColsService,
    IShowRowGroupColsService,
    NamedBean,
    PositionUtils,
    RowNode,
    ValueService,
    VisibleColsService,
} from 'ag-grid-community';
import { BeanStub, _warnOnce } from 'ag-grid-community';

export class ChartColumnService extends BeanStub implements NamedBean {
    beanName = 'chartColumnService' as const;

    private columnModel: ColumnModel;
    private showRowGroupColsService?: IShowRowGroupColsService;
    private columnNameService: ColumnNameService;
    private visibleColsService: VisibleColsService;
    private funcColsService: FuncColsService;
    private valueService: ValueService;
    private positionUtils: PositionUtils;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.showRowGroupColsService = beans.showRowGroupColsService;
        this.columnNameService = beans.columnNameService;
        this.visibleColsService = beans.visibleColsService;
        this.funcColsService = beans.funcColsService;
        this.valueService = beans.valueService;
        this.positionUtils = beans.positionUtils;
    }

    private valueColsWithoutSeriesType: Set<string> = new Set();

    public postConstruct(): void {
        const clearValueCols = () => this.valueColsWithoutSeriesType.clear();
        this.addManagedEventListeners({
            newColumnsLoaded: clearValueCols,
            rowDataUpdated: clearValueCols,
        });
    }

    public getColumn(colId: string): AgColumn | null {
        return this.columnModel.getColDefCol(colId);
    }

    public getAllDisplayedColumns(): AgColumn[] {
        return this.visibleColsService.allCols;
    }

    public getColDisplayName(col: AgColumn, includePath?: boolean): string | null {
        const headerLocation = 'chart';
        const columnDisplayName = this.columnNameService.getDisplayNameForColumn(col, headerLocation);
        if (includePath) {
            const displayNames = [columnDisplayName];
            const getDisplayName = (colGroup: AgColumnGroup | null) => {
                if (!colGroup) {
                    return;
                }
                const colGroupName = this.columnNameService.getDisplayNameForColumnGroup(colGroup, headerLocation);
                if (colGroupName?.length) {
                    displayNames.unshift(colGroupName);
                    getDisplayName(colGroup.getParent());
                }
            };
            getDisplayName(col.getParent());
            return displayNames.join(' - ');
        }
        return columnDisplayName;
    }

    public getRowGroupColumns(): AgColumn[] {
        return this.funcColsService.rowGroupCols;
    }

    public getGroupDisplayColumns(): AgColumn[] {
        return this.showRowGroupColsService?.getShowRowGroupCols() ?? [];
    }

    public isPivotMode(): boolean {
        return this.columnModel.isPivotMode();
    }

    public isPivotActive(): boolean {
        return this.columnModel.isPivotActive();
    }

    public getChartColumns(): { dimensionCols: Set<AgColumn>; valueCols: Set<AgColumn> } {
        const gridCols = this.columnModel.getCols();

        const dimensionCols = new Set<AgColumn>();
        const valueCols = new Set<AgColumn>();

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
                        _warnOnce(
                            `unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`
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

    private isInferredValueCol(col: AgColumn): boolean {
        const colId = col.getColId();
        if (colId === 'ag-Grid-AutoColumn') {
            return false;
        }

        const row = this.positionUtils.getRowNode({ rowIndex: 0, rowPinned: null });

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

    private extractLeafData(row: RowNode, col: AgColumn): any {
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

    public override destroy(): void {
        this.valueColsWithoutSeriesType.clear();
        super.destroy();
    }
}
