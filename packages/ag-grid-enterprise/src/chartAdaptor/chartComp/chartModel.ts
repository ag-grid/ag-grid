import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ChartType,
    ColDef,
    Column,
    RowRenderer,
    ColumnController,
    PostConstruct
} from "ag-grid-community";
import { ChartDatasource, ChartDatasourceParams } from "./chartDatasource";
import { RangeController } from "../../rangeController";
import { Palette } from "../../charts/chart/palettes";

export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}

export interface ChartModelParams {
    chartType: ChartType;
    aggregate: boolean;
    cellRanges: CellRange[];
    palettes: Palette[];
    activePalette: number;
    suppressChartRanges: boolean;
}

export class ChartModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rangeController') rangeController: RangeController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    // model state
    private cellRanges: CellRange[];
    private referenceCellRange: CellRange;
    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];
    private chartData: any[];

    private chartType: ChartType;
    private activePalette: number;
    private palettes: Palette[];
    private suppressChartRanges: boolean;

    private readonly aggregate: boolean;

    private initialising = true;

    private datasource: ChartDatasource;

    private chartId: string;

    public constructor(params: ChartModelParams) {
        super();

        this.chartType = params.chartType;
        this.aggregate = params.aggregate;
        this.cellRanges = params.cellRanges;
        this.palettes = params.palettes;
        this.activePalette = params.activePalette;
        this.suppressChartRanges = params.suppressChartRanges;

        // this is used associate chart ranges with charts
        this.chartId = this.generateId();
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        // use first range as a reference range to be used after removing all cols (via menu) so we can re-add later
        this.referenceCellRange = this.cellRanges[0];
    }

    public updateData(): void {
        const {startRow, endRow} = this.getRowIndexes();
        const selectedDimension = this.getSelectedDimensionId();
        const selectedValueCols = this.getSelectedValueCols();

        const params: ChartDatasourceParams = {
            aggregate: this.aggregate,
            dimensionColIds: [selectedDimension],
            valueCols: selectedValueCols,
            startRow: startRow,
            endRow: endRow
        };

        this.chartData = this.datasource.getData(params);
    }

    public resetColumnState(): void {
        const allColsFromRanges = this.getAllColumnsFromRanges();
        const {dimensionCols, valueCols} = this.getAllChartColumns();

        if (valueCols.length === 0) {
            console.warn("ag-Grid - charts require at least one visible column set with 'enableValue=true'");
            return;
        }

        this.valueColState = valueCols.map(column => {
            return {
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: allColsFromRanges.indexOf(column) > -1
            };
        });

        this.dimensionColState = dimensionCols.map(column => {
            return {
                column,
                colId: column.getColId(),
                displayName: this.getColDisplayName(column),
                selected: false
            };
        });

        const dimensionsInCellRange = dimensionCols.filter(col => allColsFromRanges.indexOf(col) > -1);

        if (dimensionsInCellRange.length > 0) {
            // select the first dimension from the range
            const selectedDimensionId = dimensionsInCellRange[0].getColId();
            this.dimensionColState.forEach(cs => cs.selected = cs.colId === selectedDimensionId);
        }

        // if no dimensions in range select the default
        const defaultCategory = {
            colId: ChartModel.DEFAULT_CATEGORY,
            displayName: '(None)',
            selected: dimensionsInCellRange.length === 0
        };
        this.dimensionColState.unshift(defaultCategory);
    }

    public updateColumnState(updatedCol: ColState) {
        const idsMatch = (cs: ColState) => cs.colId === updatedCol.colId;
        const isDimensionCol = this.dimensionColState.filter(idsMatch).length > 0;
        const isValueCol = this.valueColState.filter(idsMatch).length > 0;

        if (isDimensionCol) {
            // only one dimension should be selected
            this.dimensionColState.forEach(cs => cs.selected = idsMatch(cs));

        } else if (isValueCol) {
            // just update the selected value on the supplied value column
            this.valueColState.forEach(cs => cs.selected = idsMatch(cs) ? updatedCol.selected : cs.selected);
        }
    }

    public updateCellRanges(updatedCol?: ColState) {
        const {dimensionCols, valueCols} = this.getAllChartColumns();
        const lastRange = _.last(this.cellRanges) as CellRange;
        if (lastRange) {
            // update the reference range
            this.referenceCellRange = lastRange;

            if (updatedCol) {
                const updatingStartCol = lastRange.columns[0] === updatedCol.column;
                this.referenceCellRange.startColumn = updatingStartCol ? lastRange.columns[1] : lastRange.columns[0];
            }
        }

        const allColsFromRanges = this.getAllColumnsFromRanges();

        // clear ranges
        this.cellRanges = [];

        const dimensionColsInRange = dimensionCols.filter(col => allColsFromRanges.indexOf(col) > -1);
        if (this.initialising) {
            // first time in just take the first dimension from the range as the column state hasn't been updated yet
            if (dimensionColsInRange.length > 0) {
                this.addRange(CellRangeType.DIMENSION, [dimensionColsInRange[0]]);
            }
            this.initialising = false;
        }

        if (updatedCol && dimensionCols.indexOf(updatedCol.column as Column) > -1) {
            // if updated col is dimension col and is not the default category
            if (updatedCol!.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(CellRangeType.DIMENSION, [updatedCol!.column as Column]);
            }
        } else {
            // otherwise use current selected dimension
            const selectedDimension = this.dimensionColState.filter(cs => cs.selected)[0];
            if (selectedDimension && selectedDimension.colId !== ChartModel.DEFAULT_CATEGORY) {
                this.addRange(CellRangeType.DIMENSION, [selectedDimension.column!]);
            }
        }

        let valueColsInRange = valueCols.filter(col => allColsFromRanges.indexOf(col) > -1);
        if (updatedCol && valueCols.indexOf(updatedCol.column as Column) > -1) {
            if (updatedCol.selected) {
                valueColsInRange.push(updatedCol.column as Column);
                valueColsInRange = this.getColumnInDisplayOrder(valueCols, valueColsInRange);
            } else {
                valueColsInRange = valueColsInRange.filter(col => col.getColId() !== updatedCol.colId);
            }
        }

        if (valueColsInRange.length > 0) {
            this.addRange(CellRangeType.VALUE, valueColsInRange);
        }
    }

    public getData(): any[] {
        const selectedDimension = this.getSelectedDimensionId();
        // replacing the selected dimension with a complex object to facilitate duplicated categories
        return this.chartData.map((d: any, index: number) => {
            const dimensionValue = d[selectedDimension] ? d[selectedDimension].toString() : '';
            d[selectedDimension] = {toString: () => dimensionValue, id: index};
            return d;
        });
    }

    public getChartId(): string {
        return this.chartId;
    }

    public getValueColState(): ColState[] {
        return this.valueColState;
    }

    public getDimensionColState(): ColState[] {
        return this.dimensionColState;
    }

    public getCellRanges(): CellRange[] {
        return this.cellRanges;
    }

    public setChartType(chartType: ChartType) {
        this.chartType = chartType;
    }

    public getChartType(): ChartType {
        return this.chartType;
    }

    public setActivePalette(palette: number) {
        this.activePalette = palette;
    }

    public getActivePalette(): number {
        return this.activePalette;
    }

    public getPalettes(): Palette[] {
        return this.palettes;
    }

    public isSuppressChartRanges(): boolean {
        return this.suppressChartRanges;
    }

    public getSelectedColState(): ColState[] {
        return this.valueColState.filter(cs => cs.selected);
    }

    public getSelectedValueCols(): Column[] {
        return this.getSelectedColState().map(cs => cs.column) as Column[];
    }

    public getSelectedDimensionId(): string {
        return this.dimensionColState.filter(cs => cs.selected)[0].colId;
    }

    private getColumnInDisplayOrder(allDisplayedColumns: Column[], listToSort: Column[]) {
        const sortedList: Column[] = [];
        allDisplayedColumns.forEach(col => {
            if (listToSort.indexOf(col) > -1) {
                sortedList.push(col);
            }
        });
        return sortedList;
    }

    private addRange(cellRangeType: CellRangeType, columns: Column[]) {
        const newRange = {
            id: this.chartId,
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns: columns,
            startColumn: this.referenceCellRange.startColumn,
            type: cellRangeType
        };

        cellRangeType === CellRangeType.DIMENSION ? this.cellRanges.unshift(newRange) : this.cellRanges.push(newRange);
    }

    private getAllColumnsFromRanges(): Column[] {
        return _.flatten(this.cellRanges.map(range => range.columns));
    }

    private getColDisplayName(col: Column): string {
        return this.columnController.getDisplayNameForColumn(col, 'chart') as string;
    }

    private getRowIndexes(): { startRow: number, endRow: number } {
        let startRow = 0, endRow = 0;
        const range = _.last(this.cellRanges) as CellRange;
        if (range) {
            startRow = this.rangeController.getRangeStartRow(range).rowIndex;
            endRow = this.rangeController.getRangeEndRow(range).rowIndex;
        }
        return {startRow, endRow}
    }

    private getAllChartColumns(): { dimensionCols: Column[], valueCols: Column[] } {
        const firstRow = this.rowRenderer.getRowNode({rowIndex: 0, rowPinned: undefined}) as any;
        const firstRowData = firstRow ? firstRow.data : null;

        const displayedCols = this.columnController.getAllDisplayedColumns();

        const dimensionCols: Column[] = [];
        const valueCols: Column[] = [];
        displayedCols.forEach(col => {
            const colDef = col.getColDef() as ColDef;

            const chartDataType = colDef.chartDataType;
            if (chartDataType) {
                let validChartType = true;

                if (chartDataType === 'category') {
                    dimensionCols.push(col);
                } else if (chartDataType === 'series') {
                    valueCols.push(col);
                } else if (chartDataType === 'excluded') {
                    // ignore
                } else {
                    console.warn(`ag-Grid: unexpected chartDataType value '${chartDataType}' supplied, instead use 'category', 'series' or 'excluded'`);
                    validChartType = false;
                }

                if (validChartType) { return; }
            }

            if (!!colDef.enableRowGroup || !!colDef.enablePivot) {
                dimensionCols.push(col);
                return;
            }

            if (!!colDef.enableValue) {
                valueCols.push(col);
                return;
            }

            const isNumberCol = firstRowData && typeof firstRowData[col.getColId()] === 'number';
            isNumberCol ? valueCols.push(col) : dimensionCols.push(col);
        });

        return {dimensionCols, valueCols};
    }

    private generateId(): string {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}