import type {
    AgColumn,
    AgColumnGroup,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    RowNode,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _getRowNode, _warn } from 'ag-grid-community';

export class ChartColumnService extends BeanStub {
    private colModel: ColumnModel;
    private colNames: ColumnNameService;
    private valueSvc: ValueService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.colNames = beans.colNames;
        this.valueSvc = beans.valueSvc;
    }

    private readonly valueColsWithoutSeriesType: Set<string> = new Set();

    public postConstruct(): void {
        const clearValueCols = () => this.valueColsWithoutSeriesType.clear();
        this.addManagedEventListeners({
            newColumnsLoaded: clearValueCols,
            rowDataUpdated: clearValueCols,
        });
    }

    public getColumn(colId: string): AgColumn | null {
        return this.colModel.getColDefCol(colId);
    }

    public getAllDisplayedColumns(): AgColumn[] {
        return this.beans.visibleCols.allCols;
    }

    public getColDisplayName(col: AgColumn): string | null {
        return this.colNames.getDisplayNameForColumn(col, 'chart');
    }

    public getColGroupDisplayName(colGroup: AgColumnGroup): string | null {
        return this.colNames.getDisplayNameForColumnGroup(colGroup, 'chart');
    }

    public getRowGroupColumns(): AgColumn[] {
        return this.beans.rowGroupColsSvc?.columns ?? [];
    }

    public getGroupDisplayColumns(): AgColumn[] {
        return this.beans.showRowGroupCols?.columns ?? [];
    }

    public isPivotMode(): boolean {
        return this.colModel.isPivotMode();
    }

    public isPivotActive(): boolean {
        return this.colModel.isPivotActive();
    }

    public getChartColumns(): { dimensionCols: Set<AgColumn>; valueCols: Set<AgColumn> } {
        const gridCols = this.colModel.getCols();

        const dimensionCols = new Set<AgColumn>();
        const valueCols = new Set<AgColumn>();

        for (const col of gridCols) {
            const colDef = col.getColDef();
            const chartDataType = colDef.chartDataType;

            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                    case 'time':
                        dimensionCols.add(col);
                        continue;
                    case 'series':
                        valueCols.add(col);
                        continue;
                    case 'excluded':
                        continue;
                    default:
                        _warn(153, { chartDataType });
                        break;
                }
            }

            if (colDef.colId === 'ag-Grid-AutoColumn') {
                dimensionCols.add(col);
                continue;
            }

            if (!col.isPrimary()) {
                valueCols.add(col);
                continue;
            }

            // if 'chartDataType' is not provided then infer type based data contained in first row
            (this.isInferredValueCol(col) ? valueCols : dimensionCols).add(col);
        }

        return { dimensionCols, valueCols };
    }

    private isInferredValueCol(col: AgColumn): boolean {
        const colId = col.getColId();
        if (colId === 'ag-Grid-AutoColumn') {
            return false;
        }

        const row = _getRowNode(this.beans, { rowIndex: 0, rowPinned: null });

        if (!row) {
            return this.valueColsWithoutSeriesType.has(colId);
        }

        let cellValue = this.valueSvc.getValue(col, row);

        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }

        if (cellValue != null) {
            // unwrap value objects if present
            if (typeof cellValue.toNumber === 'function') {
                cellValue = cellValue.toNumber();
            } else if (typeof cellValue.value === 'number') {
                cellValue = cellValue.value;
            }
        }

        const isNumber =
            typeof cellValue === 'number' ||
            col.colDef.cellDataType === 'number' ||
            ['series', 'time'].includes(col.colDef.chartDataType as string);

        if (isNumber) {
            this.valueColsWithoutSeriesType.add(colId);
        } else if (cellValue == null && col.colDef.cellDataType !== 'number') {
            _warn(265, { colId });
        }

        return isNumber;
    }

    private extractLeafData(row: RowNode, col: AgColumn): any {
        const value = row.data && this.valueSvc.getValue(col, row);
        if (value != null) {
            return value;
        }
        const childrenAfterGroup = row.childrenAfterGroup;
        if (childrenAfterGroup) {
            for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
                const child = childrenAfterGroup[i];
                const result = this.extractLeafData(child, col);
                if (result != null) {
                    return result;
                }
            }
        }
        return null;
    }

    public override destroy(): void {
        this.valueColsWithoutSeriesType.clear();
        super.destroy();
    }
}
