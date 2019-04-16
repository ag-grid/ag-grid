import {_, Autowired, PostConstruct, BeanStub, Column, ColDef, ColumnController, CellRangeType, CellRange } from "ag-grid-community";
import {ChartDatasource, ChartDatasourceParams} from "./chartDatasource";

export interface ColState  {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}

export class ChartModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;

    private cellRanges: CellRange[];

    // this is used to restore cols after all have been removed via menu
    private referenceCellRange: CellRange;

    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];

    private readonly aggregate: boolean;
    private chartData: any[];

    private datasource: ChartDatasource;

    public constructor(cellRanges: CellRange[], aggregate: boolean) {
        super();
        this.cellRanges = cellRanges;
        this.aggregate = aggregate;
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        // use first range as a reference range to be used after removing all cols (via menu) so we can re-add later
        this.referenceCellRange = this.cellRanges[0];
        this.updateCellRanges();

        this.resetColumnState();
    }

    public updateData(dimension: string, valueCols: Column[], startRow: number, endRow: number): void {
        const params: ChartDatasourceParams = {
            dimensionColIds: [dimension],
            valueCols: valueCols,
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);
    }

    public getData(): any[] {
        return this.chartData;
    }

    public getValueColState(): ColState[] {
        return this.valueColState;
    }

    public getDimensionColState(): ColState[] {
        return this.dimensionColState;
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
                displayName: this.getFieldName(column),
                selected: allColsFromRanges.indexOf(column) > -1
            };
        });

        this.dimensionColState = dimensionCols.map(column => {
            return {
                column,
                colId: column.getColId(),
                displayName: this.getFieldName(column),
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

    public updateColumnStateFromRanges(allColsFromRanges: Column[]) {
        this.valueColState.forEach(cs => {
            cs.selected = allColsFromRanges.some(col => col.getColId() === cs.colId);
        });
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

    public getCellRanges(): CellRange[] {
        return this.cellRanges;
    }

    public getAllColumnsFromRanges(): Column[] {
        return _.flatten(this.cellRanges.map(range => range.columns));
    }

    public getLastRange(): CellRange {
        return _.last(this.cellRanges) as CellRange;
    }

    public updateCellRanges(updatedCol?: ColState) {
        const {dimensionCols, valueCols} = this.getAllChartColumns();

        console.log(dimensionCols, valueCols);

        let valueColsInRange = this.getValueColsFromRanges(valueCols);
        let dimensionColsInRange = this.getDimensionsFromRanges(dimensionCols);

        // clear ranges
        this.cellRanges = [];

        if (updatedCol && valueCols.indexOf(updatedCol.column as Column) > -1) {
            if (updatedCol.selected) {
                valueColsInRange.push(updatedCol.column as Column);
                valueColsInRange = this.getColumnInDisplayOrder(valueCols, valueColsInRange);
            } else {
                valueColsInRange = valueColsInRange.filter(col => col.getColId() !== updatedCol.colId);
            }
        }

        if (updatedCol && dimensionCols.indexOf(updatedCol.column as Column) > -1) {
            const isDefaultCategory = updatedCol.colId === ChartModel.DEFAULT_CATEGORY;
            dimensionColsInRange = isDefaultCategory ? [] : [updatedCol.column as Column];
        }

        if (dimensionColsInRange.length > 0) {
            const firstDimensionInRange = dimensionColsInRange[0];
            this.addRange(CellRangeType.DIMENSION, [firstDimensionInRange]);
        }

        console.log('valueColsInRange: ', valueColsInRange.map(col => col.getColId()).join(','));
        console.log('dimensions: ', dimensionColsInRange.map(col => col.getColId()).join(','));

        if (valueColsInRange.length === 0) {
            // no range to add
        } else if (valueColsInRange.length === 1) {
            this.addRange(CellRangeType.VALUE, valueColsInRange)
        } else {
            let currentRange = [];
            for (let i = 0; i < valueColsInRange.length; i++) {
                const currentValCol = valueColsInRange[i];
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

        console.log('ranges: ', this.cellRanges);
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
        const valueRanges = this.cellRanges.filter(range => range.type === CellRangeType.VALUE);

        if (valueRanges.length > 0) {
            this.referenceCellRange = valueRanges[0];
        }

        const newRange = {
            startRow: this.referenceCellRange.startRow,
            endRow: this.referenceCellRange.endRow,
            columns: columns,
            startColumn: columns[0],
            type: cellRangeType
        };

        cellRangeType === CellRangeType.DIMENSION ? this.cellRanges.unshift(newRange) : this.cellRanges.push(newRange);
    }

    private getDimensionsFromRanges(allDisplayedColumns: Column[]) {
        const isDimension = (col: Column) => {
            const colDef = col.getColDef() as ColDef;
            return allDisplayedColumns.indexOf(col) > -1 && (!!colDef.enableRowGroup || !!colDef.enablePivot);
        };

        return this.getAllColumnsFromRanges().filter(col => isDimension(col));
    }

    private getValueColsFromRanges(allDisplayedColumns: Column[]) {
        const isValueCol = (col: Column) => {
            const colDef = col.getColDef() as ColDef;
            return allDisplayedColumns.indexOf(col) > -1 && (!!colDef.enableValue);
        };

        return this.getAllColumnsFromRanges().filter(col => isValueCol(col));
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

    private getFieldName(col: Column): string {
        return this.columnController.getDisplayNameForColumn(col, 'chart') as string;
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
    }
}