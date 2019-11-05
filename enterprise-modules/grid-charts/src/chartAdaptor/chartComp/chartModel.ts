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
    PostConstruct,
    RowNode,
    RowRenderer,
    IRangeController
} from "@ag-community/grid-core";
import { ChartDatasource, ChartDatasourceParams } from "./chartDatasource";

export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}

export interface ChartModelParams {
    pivotChart: boolean;
    chartType: ChartType;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
}

export class ChartModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rangeController') rangeController: IRangeController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

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
    private columnNames: { [p: string]: string[] } = {};

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
        this.datasource = this.wireBean(new ChartDatasource());

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
        // grouped data contains label fields rather than objects with toString
        if (this.grouping && this.isMultiCategoryChart()) {
            return this.chartData;
        }

        const colId = this.getSelectedDimension().colId;

        // replacing the selected dimension with a complex object to facilitate duplicated categories
        return this.chartData.map((d, index) => {
            const value = d[colId];
            const valueString = value && value.toString ? value.toString() : '';

            d[colId] = { id: index, value: d[colId], toString: () => valueString };

            return d;
        });
    }

    public setChartType(chartType: ChartType) {
        const isCurrentMultiCategory = this.isMultiCategoryChart();

        this.chartType = chartType;

        // switching between single and multi-category charts requires data to be reformatted
        if (isCurrentMultiCategory !== this.isMultiCategoryChart()) {
            this.updateData();
        }
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

    public isPivotActive = (): boolean => this.columnController.isPivotActive();

    public isPivotMode = (): boolean => this.columnController.isPivotMode();

    public isPivotChart = (): boolean => this.pivotChart;

    public getChartId = (): string => this.chartId;

    public getValueColState = (): ColState[] => this.valueColState.map(this.displayNameMapper.bind(this));

    public getDimensionColState = (): ColState[] => this.dimensionColState;

    public getCellRanges = (): CellRange[] => [this.dimensionCellRange, this.valueCellRange].filter(r => r);

    public getChartType = (): ChartType => this.chartType;

    public isSuppressChartRanges = (): boolean => this.suppressChartRanges;

    public isDetached = (): boolean => this.detached;

    public toggleDetached(): void {
        this.detached = !this.detached;
    }

    public getSelectedValueColState = (): { colId: string, displayName: string }[] => this.getValueColState().filter(cs => cs.selected);

    public getSelectedValueCols = (): Column[] => this.valueColState.filter(cs => cs.selected).map(cs => cs.column!);

    public getSelectedDimension = (): ColState => this.dimensionColState.filter(cs => cs.selected)[0];

    private createCellRange(cellRangeType: CellRangeType, ...columns: Column[]): CellRange {
        return {
            id: this.chartId, // set range ID to match chart ID so we can identify changes to the ranges for this chart
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns: columns,
            startColumn: columns[0],
            type: cellRangeType
        };
    }

    private getAllColumnsFromRanges(): Set<Column> {
        let columns = this.dimensionCellRange || this.valueCellRange ? [] : this.referenceCellRange.columns;

        if (this.dimensionCellRange) {
            columns.push(...this.dimensionCellRange.columns);
        }

        if (this.valueCellRange) {
            columns.push(...this.valueCellRange.columns);
        }

        return _.convertToSet(columns);
    }

    private getColDisplayName = (col: Column): string => this.columnController.getDisplayNameForColumn(col, 'chart')!;

    private getRowIndexes(): { startRow: number, endRow: number } {
        let startRow = 0, endRow = 0;
        const { rangeController } = this;
        const { valueCellRange: range } = this;

        if (rangeController && range) {
            startRow = rangeController.getRangeStartRow(range).rowIndex;
            endRow = rangeController.getRangeEndRow(range).rowIndex;
        }

        return { startRow, endRow };
    }

    private getAllChartColumns(): { dimensionCols: Set<Column>, valueCols: Set<Column> } {
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
            (this.isNumberCol(col.getColId()) ? valueCols : dimensionCols).add(col);
        });

        return { dimensionCols, valueCols };
    }

    private isNumberCol(colId: any) {
        if (colId === 'ag-Grid-AutoColumn') {
            return false;
        }

        const row = this.rowRenderer.getRowNode({ rowIndex: 0, rowPinned: undefined });

        if (!row) {
            return false;
        }

        let cellData;

        if (row.group) {
            cellData = this.extractAggregateValue(row, colId) || this.extractLeafData(row, colId);
        } else {
            const rowData = row.data;
            cellData = rowData ? rowData[colId] : null;
        }

        return typeof cellData === 'number';
    }

    private extractAggregateValue(row: RowNode, colId: any) {
        if (!row.aggData) {
            return null;
        }

        const aggDatum = row.aggData[colId];

        if (!aggDatum) {
            return null;
        }

        return typeof aggDatum.toNumber === 'function' ? aggDatum.toNumber() : aggDatum;
    }

    private extractLeafData(row: RowNode, colId: any) {
        const cellData = row.allLeafChildren.map(child => child.data).map(data => data[colId]);

        for (let i = 0; i < cellData.length; i++) {
            if (cellData[i] !== null) {
                return cellData[i];
            }
        }

        return null;
    }

    private displayNameMapper(col: ColState) {
        const columnNames = this.columnNames[col.colId];

        col.displayName = columnNames ? columnNames.join(' - ') : this.getColDisplayName(col.column);

        return col;
    }

    private isMultiCategoryChart(): boolean {
        return !_.includes([ChartType.Pie, ChartType.Doughnut, ChartType.Scatter, ChartType.Bubble], this.chartType);
    }

    private generateId(): string {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    private updateData(): void {
        const { startRow, endRow } = this.getRowIndexes();
        const selectedDimension = this.getSelectedDimension();
        const selectedValueCols = this.getSelectedValueCols();

        this.grouping = this.isGrouping();

        const params: ChartDatasourceParams = {
            aggFunc: this.aggFunc,
            dimensionCols: [selectedDimension],
            grouping: this.grouping,
            pivoting: this.isPivotActive(),
            multiCategories: this.isMultiCategoryChart(),
            valueCols: selectedValueCols,
            startRow,
            endRow
        };

        const result = this.datasource.getData(params);

        this.chartData = result.data;
        this.columnNames = result.columnNames;
    }

    private resetColumnState(): void {
        const { dimensionCols, valueCols } = this.getAllChartColumns();
        const allCols = this.pivotChart ? _.convertToSet(this.columnController.getAllDisplayedColumns()) : this.getAllColumnsFromRanges();
        this.dimensionColState = [];
        this.valueColState = [];

        let hasSelectedDimension = false;

        dimensionCols.forEach(column => {
            const selected = !hasSelectedDimension && allCols.has(column);

            this.dimensionColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected
            });

            if (selected) {
                hasSelectedDimension = true;
            }
        });

        const defaultCategory = {
            colId: ChartModel.DEFAULT_CATEGORY,
            displayName: '(None)',
            selected: !hasSelectedDimension // if no dimensions in range select the default
        };

        this.dimensionColState.unshift(defaultCategory);

        valueCols.forEach(column => {
            this.valueColState.push({
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: allCols.has(column)
            });
        });
    }

    private updateColumnState(updatedCol: ColState) {
        const idsMatch = (cs: ColState) => cs.colId === updatedCol.colId;
        const { dimensionColState, valueColState } = this;

        if (dimensionColState.filter(idsMatch).length > 0) {
            // only one dimension should be selected
            dimensionColState.forEach(cs => cs.selected = idsMatch(cs));
        } else {
            // just update the selected value on the supplied value column
            valueColState.filter(idsMatch).forEach(cs => cs.selected = updatedCol.selected);
        }
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

        if (selectedDimensionColState && selectedDimensionColState.colId !== ChartModel.DEFAULT_CATEGORY) {
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
            this.valueCellRange = this.createCellRange(CellRangeType.VALUE, ...selectedValueCols);
        }
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}
