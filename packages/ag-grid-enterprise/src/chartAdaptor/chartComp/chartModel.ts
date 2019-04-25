import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ChartType,
    ColDef,
    Column,
    ColumnController,
    PostConstruct
} from "ag-grid-community";
import {ChartDatasource, ChartDatasourceParams} from "./chartDatasource";
import {ChartOptions} from "./gridChartComp";
import {RangeController} from "../../rangeController";

export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}

export class ChartModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rangeController') rangeController: RangeController;

    // model state
    private cellRanges: CellRange[];
    private referenceCellRange: CellRange;
    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];
    private chartData: any[];

    private chartType: ChartType;
    private palette: number;

    private readonly aggregate: boolean;

    private initialising = true; //TODO remove

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();

        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.palette = chartOptions.palette;
        this.cellRanges = cellRanges;
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

    public updateCellRanges(movingCols: boolean, updatedCol?: ColState) {
        const {dimensionCols, valueCols} = this.getAllChartColumns();
        const lastRange = _.last(this.cellRanges) as CellRange;
        if (lastRange) {
            // update the reference range
            this.referenceCellRange = lastRange;

            if (movingCols) {
                const colsInOrder = this.getColumnInDisplayOrder(valueCols, this.referenceCellRange.columns);
                this.referenceCellRange.startColumn = colsInOrder[0];
            }

            if(updatedCol) {
                const updatingStartCol = lastRange.columns[0] === updatedCol.column;
                this.referenceCellRange.startColumn = updatingStartCol ? lastRange.columns[1] : lastRange.columns[0];
            }
        }

        const allColsFromRanges = this.getAllColumnsFromRanges();

        // clear ranges
        this.cellRanges = [];

        let dimensionColsInRange = dimensionCols.filter(col => allColsFromRanges.indexOf(col) > -1);
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

        if (valueColsInRange.length === 0) {
            // no range to add
        } else if (valueColsInRange.length === 1) {
            this.addRange(CellRangeType.VALUE, valueColsInRange)
        } else {
            let currentRange = [];
            for (let i = 0; i < valueColsInRange.length; i++) {
                // dragging left or right works as the value cols are sorted by display order

                const currentValCol = valueColsInRange[i];

                const updateFromRangeDragging = !movingCols && !_.exists(updatedCol);
                const valueColNotInRange = this.referenceCellRange.columns.indexOf(currentValCol) < 0;
                if (updateFromRangeDragging && valueColNotInRange) {
                    // skip column as it's being dragged out of range
                    continue;
                }

                currentRange.push(currentValCol);

                // if last value col, close out range
                if (i === valueColsInRange.length - 1) {
                    this.addRange(CellRangeType.VALUE, currentRange);
                    break;
                }

                const nextValCol = valueColsInRange[i + 1];
                const nextDisplayedCol = this.columnController.getDisplayedColAfter(currentValCol) as Column;

                // if next val col is not contiguous, close out range and start over
                if (nextValCol !== nextDisplayedCol) {
                    this.addRange(CellRangeType.VALUE, currentRange);
                    currentRange = [];
                }
            }
        }
    }

    public getData(): any[] {
        const selectedDimension = this.getSelectedDimensionId();
        // replacing the selected dimension with a complex object to facilitate duplicated categories
        return this.chartData.map((d: any, index: number) => {
            const dimensionValue = d[selectedDimension] ? d[selectedDimension].toString() : '';
            d[selectedDimension] = {toString: () => {return dimensionValue}, id: index};
            return d;
        });
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

    public setPalette(palette: number) {
        this.palette = palette;
    }

    public getPalette(): number {
        return this.palette;
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
        const displayedCols = this.columnController.getAllDisplayedColumns();

        const dimensionCols: Column[] = [];
        const valueCols: Column[] = [];
        displayedCols.forEach(col => {
            if (this.isDimensionColumn(col, displayedCols)) {
                dimensionCols.push(col);
            } else if (this.isValueColumn(col, displayedCols)) {
                valueCols.push(col);
            } else {
                // ignore!
            }
        });

        return {dimensionCols, valueCols};
    }

    private isDimensionColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableRowGroup || !!colDef.enablePivot);
    }

    private isValueColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableValue);
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}