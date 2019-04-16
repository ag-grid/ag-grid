import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ColDef,
    Column,
    ColumnController,
    PostConstruct,
} from "ag-grid-community";
import {ChartColumnModel, ColState} from "./chartColumnModel";

export class ChartRangeModel extends BeanStub {

    @Autowired('columnController') private columnController: ColumnController;

    private cellRanges: CellRange[];

    // this is used to restore cols after all have been removed via menu
    private referenceCellRange: CellRange;

    public constructor(cellRanges: CellRange[]) {
        super();
        this.cellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
        // use first range as a reference range to be used after removing all cols (via menu) so we can re-add later
        this.referenceCellRange = this.cellRanges[0];
        this.updateCellRanges();
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
            const isDefaultCategory = updatedCol.colId === ChartColumnModel.DEFAULT_CATEGORY;
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