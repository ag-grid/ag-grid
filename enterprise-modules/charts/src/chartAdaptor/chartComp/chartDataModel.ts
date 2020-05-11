import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ChartType,
    Column,
    ColumnController,
    GridOptionsWrapper,
    IAggFunc,
    IRangeController,
    PostConstruct,
    RowNode,
    RowRenderer,
    ValueService,
    CellRangeParams
} from "@ag-grid-community/core";
import { ChartDatasource, ChartDatasourceParams } from "./chartDatasource";
import { ChartTranslator } from './chartTranslator';

export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
    order: number;
}

export interface ChartModelParams {
    pivotChart: boolean;
    chartType: ChartType;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
}

export class ChartDataModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('rangeController') rangeController: IRangeController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private referenceCellRange: CellRange;
    private dimensionCellRange?: CellRange;
    private valueCellRange?: CellRange;
    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];
    private chartData: any[];

    private readonly pivotChart: boolean;
    private chartType: ChartType;
    private readonly suppressChartRanges: boolean;

    private readonly aggFunc?: string | IAggFunc;

    private datasource: ChartDatasource;

    private readonly chartId: string;
    private detached: boolean = false;
    private grouping: boolean;
    private columnNames: { [p: string]: string[]; } = {};

    public constructor(params: ChartModelParams) {
        super();

        this.pivotChart = params.pivotChart;
        this.chartType = params.chartType;
        this.aggFunc = params.aggFunc;
        this.referenceCellRange = params.cellRange;
        this.suppressChartRanges = params.suppressChartRanges;

        // this is used to associate chart ranges with charts
        this.chartId = this.generateId();
    }

    @PostConstruct
    private init(): void {
        this.datasource = this.createBeanAndDestroyWithMe(new ChartDatasource());

        this.updateCellRanges();
    }

    public updateCellRanges(updatedColState?: ColState): void {
        if (this.valueCellRange) {
            this.referenceCellRange = this.valueCellRange;
        }

        const { dimensionCols, valueCols } = this.getAllChartColumns();
        const allColsFromRanges = this.getAllColumnsFromRanges();

        if (updatedColState) {
            this.updateColumnState(updatedColState);
        }

        this.setDimensionCellRange(dimensionCols, allColsFromRanges, updatedColState);
        this.setValueCellRange(valueCols, allColsFromRanges, updatedColState);

        if (!updatedColState) {
            this.resetColumnState();
        }

        this.updateData();
    }

    public getData(): any[] {
        return this.chartData;
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
    }

    public isGrouping(): boolean {
        const usingTreeData = this.gridOptionsWrapper.isTreeData();
        const groupedCols = usingTreeData ? null : this.columnController.getRowGroupColumns();
        const groupActive = usingTreeData || (groupedCols && groupedCols.length > 0) as boolean;

        // charts only group when the selected category is a group column
        const groupCols = this.columnController.getGroupDisplayColumns();
        const colId = this.getSelectedDimension().colId;
        const groupDimensionSelected = groupCols
            .map(col => col.getColId())
            .some(id => id === colId);

        return groupActive && groupDimensionSelected;
    }

    public isPivotActive(): boolean {
        return this.columnController.isPivotActive();
    }

    public isPivotMode(): boolean {
        return this.columnController.isPivotMode();
    }

    public isPivotChart(): boolean {
        return this.pivotChart;
    };

    public getChartId(): string {
        return this.chartId;
    };

    public getValueColState(): ColState[] {
        return this.valueColState.map(this.displayNameMapper.bind(this));
    };

    public getDimensionColState(): ColState[] {
        return this.dimensionColState;
    };

    public getCellRanges(): CellRange[] {
        return [this.dimensionCellRange, this.valueCellRange].filter(r => r);
    };

    public getCellRangeParams(): CellRangeParams {
        const cellRanges = this.getCellRanges();
        const firstCellRange = cellRanges[0];
        const startRow = firstCellRange && firstCellRange.startRow;
        const endRow = firstCellRange && firstCellRange.endRow;

        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce((columns, value) => columns.concat(value.columns.map(c => c.getId())), [])
        };
    }

    public getChartType(): ChartType {
        return this.chartType;
    };

    public isSuppressChartRanges(): boolean {
        return this.suppressChartRanges;
    };

    public isDetached(): boolean {
        return this.detached;
    };

    public toggleDetached(): void {
        this.detached = !this.detached;
    }

    public getSelectedValueColState(): { colId: string; displayName: string; }[] {
        return this.getValueColState().filter(cs => cs.selected);
    };

    public getSelectedValueCols(): Column[] {
        return this.valueColState.filter(cs => cs.selected).map(cs => cs.column!);
    };

    public getSelectedDimension(): ColState {
        return this.dimensionColState.filter(cs => cs.selected)[0];
    };

    private createCellRange(type: CellRangeType, ...columns: Column[]): CellRange {
        return {
            id: this.chartId, // set range ID to match chart ID so we can identify changes to the ranges for this chart
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns,
            startColumn: type === CellRangeType.DIMENSION ? columns[0] : this.referenceCellRange.startColumn,
            type
        };
    }

    private getAllColumnsFromRanges(): Set<Column> {
        if (this.pivotChart) {
            return _.convertToSet(this.columnController.getAllDisplayedColumns());
        };

        let columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;

        if (this.dimensionCellRange) {
            columns.push(...this.dimensionCellRange.columns);
        }

        if (this.valueCellRange) {
            columns.push(...this.valueCellRange.columns);
        }

        return _.convertToSet(columns);
    }

    private getColDisplayName(col: Column): string {
        return this.columnController.getDisplayNameForColumn(col, 'chart');
    }

    private getRowIndexes(): { startRow: number; endRow: number; } {
        let startRow = 0, endRow = 0;
        const { rangeController } = this;
        const { valueCellRange: range } = this;

        if (rangeController && range) {
            startRow = rangeController.getRangeStartRow(range).rowIndex;
            endRow = rangeController.getRangeEndRow(range).rowIndex;
        }

        return { startRow, endRow };
    }

    private getAllChartColumns(): { dimensionCols: Set<Column>; valueCols: Set<Column>; } {
        const displayedCols = this.columnController.getAllDisplayedColumns();
        const dimensionCols = new Set<Column>();
        const valueCols = new Set<Column>();

        displayedCols.forEach(col => {
            const colDef = col.getColDef();
            const chartDataType = colDef.chartDataType;

            if (chartDataType) {
                // chart data type was specified explicitly
                switch (chartDataType) {
                    case 'category':
                        dimensionCols.add(col);
                        return;
                    case 'series':
                        valueCols.add(col);
                        return;
                    case 'excluded':
                        return;
                    default:
                        console.warn(`ag-Grid: unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`);
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
            (this.isNumberCol(col) ? valueCols : dimensionCols).add(col);
        });

        return { dimensionCols, valueCols };
    }

    private isNumberCol(col: Column): boolean {
        if (col.getColId() === 'ag-Grid-AutoColumn') {
            return false;
        }

        const row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: undefined });

        if (!row) {
            return false;
        }

        let cellValue = this.valueService.getValue(col, row);

        if (cellValue == null) {
            cellValue = this.extractLeafData(row, col);
        }

        if (cellValue != null && typeof cellValue.toNumber === 'function') {
            cellValue = cellValue.toNumber();
        }

        return typeof cellValue === 'number';
    }

    private extractLeafData(row: RowNode, col: Column): any {
        if (!row.allLeafChildren) { return null; }

        for (let i = 0; i < row.allLeafChildren.length; i++) {
            const childRow = row.allLeafChildren[i];
            const value = this.valueService.getValue(col, childRow);

            if (value != null) {
                return value;
            }
        }

        return null;
    }

    private displayNameMapper(col: ColState): ColState {
        const columnNames = this.columnNames[col.colId];

        col.displayName = columnNames ? columnNames.join(' - ') : this.getColDisplayName(col.column);

        return col;
    }

    private generateId(): string {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    public updateData(): void {
        const { startRow, endRow } = this.getRowIndexes();

        if (this.pivotChart) {
            this.resetColumnState();
        }

        this.grouping = this.isGrouping();

        const params: ChartDatasourceParams = {
            aggFunc: this.aggFunc,
            dimensionCols: [this.getSelectedDimension()],
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            valueCols: this.getSelectedValueCols(),
            startRow,
            endRow
        };

        const result = this.datasource.getData(params);

        this.chartData = result.data;
        this.columnNames = result.columnNames;
    }

    private resetColumnState(): void {
        const { dimensionCols, valueCols } = this.getAllChartColumns();
        const allCols = this.getAllColumnsFromRanges();
        const isInitialising = this.valueColState.length < 1;

        this.dimensionColState = [];
        this.valueColState = [];

        let hasSelectedDimension = false;
        let order = 1;

        dimensionCols.forEach(column => {
            const selected = !hasSelectedDimension && allCols.has(column);

            this.dimensionColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected,
                order: order++
            });

            if (selected) {
                hasSelectedDimension = true;
            }
        });

        const defaultCategory = {
            colId: ChartDataModel.DEFAULT_CATEGORY,
            displayName: this.chartTranslator.translate('defaultCategory'),
            selected: !hasSelectedDimension, // if no dimensions in range select the default
            order: 0
        };

        this.dimensionColState.unshift(defaultCategory);

        const valueColumnsFromReferenceRange = this.referenceCellRange.columns.filter(c => valueCols.has(c));

        valueCols.forEach(column => {
            // first time the value cell range is set, preserve the column order from the supplied range
            if (isInitialising && _.includes(this.referenceCellRange.columns, column)) {
                column = valueColumnsFromReferenceRange.shift();
            }

            this.valueColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: allCols.has(column),
                order: order++
            });
        });
    }

    private updateColumnState(updatedCol: ColState): void {
        const idsMatch = (cs: ColState) => cs.colId === updatedCol.colId;
        const { dimensionColState, valueColState } = this;

        if (dimensionColState.filter(idsMatch).length > 0) {
            // only one dimension should be selected
            dimensionColState.forEach(cs => cs.selected = idsMatch(cs));
        } else {
            // just update the selected value on the supplied value column
            valueColState.filter(idsMatch).forEach(cs => cs.selected = updatedCol.selected);
        }

        const allColumns = [...dimensionColState, ...valueColState];
        const orderedColIds: string[] = [];

        // calculate new order
        allColumns.forEach((col, i) => {
            if (i === updatedCol.order) {
                orderedColIds.push(updatedCol.colId);
            }

            if (col.colId !== updatedCol.colId) {
                orderedColIds.push(col.colId);
            }
        });

        // update col state with new order
        allColumns.forEach(col => {
            const order = orderedColIds.indexOf(col.colId);

            col.order = order >= 0 ? orderedColIds.indexOf(col.colId) : allColumns.length - 1;
        });

        this.reorderColState();
    }

    private reorderColState(): void {
        const { dimensionColState, valueColState } = this;

        dimensionColState.sort((a, b) => a.order - b.order);
        valueColState.sort((a, b) => a.order - b.order);
    }

    private setDimensionCellRange(dimensionCols: Set<Column>, colsInRange: Set<Column>, updatedColState?: ColState): void {
        this.dimensionCellRange = undefined;

        const { dimensionColState } = this;

        if (!updatedColState && !dimensionColState.length) {
            // use first dimension column in range by default
            dimensionCols.forEach(col => {
                if (this.dimensionCellRange || !colsInRange.has(col)) {
                    return;
                }

                this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, col);
            });

            return;
        }

        let selectedDimensionColState = updatedColState;

        if (!selectedDimensionColState || !dimensionCols.has(selectedDimensionColState.column)) {
            selectedDimensionColState = this.dimensionColState.filter(cs => cs.selected)[0];
        }

        if (selectedDimensionColState && selectedDimensionColState.colId !== ChartDataModel.DEFAULT_CATEGORY) {
            this.dimensionCellRange = this.createCellRange(CellRangeType.DIMENSION, selectedDimensionColState.column);
        }
    }

    private setValueCellRange(valueCols: Set<Column>, colsInRange: Set<Column>, updatedColState?: ColState): void {
        this.valueCellRange = undefined;

        let selectedValueCols: Column[] = [];

        valueCols.forEach(col => {
            if (updatedColState && updatedColState.colId === col.getColId()) {
                if (updatedColState.selected) {
                    selectedValueCols.push(updatedColState.column);
                }
            } else if (colsInRange.has(col)) {
                selectedValueCols.push(col);
            }
        });

        if (selectedValueCols.length > 0) {
            let orderedColIds: string[] = [];

            if (this.valueColState.length > 0) {
                orderedColIds = this.valueColState.map(c => c.colId);
            } else {
                colsInRange.forEach(c => orderedColIds.push(c.getColId()));
            }

            selectedValueCols.sort((a, b) => orderedColIds.indexOf(a.getColId()) - orderedColIds.indexOf(b.getColId()));

            this.valueCellRange = this.createCellRange(CellRangeType.VALUE, ...selectedValueCols);
        }
    }
}
