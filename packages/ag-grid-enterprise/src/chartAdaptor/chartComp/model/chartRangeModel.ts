import {
    _,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    Column,
    ColumnController,
    PostConstruct,
} from "ag-grid-community";
import {ChartController} from "../chartController";
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

        this.splitInitialRange();
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

    private splitInitialRange() {
        // there is only one range provided initially
        const colsToSplit = this.cellRanges[0].columns;

        this.cellRanges = [];

        const allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        const dimensionCols = colsToSplit.filter(col => ChartController.isDimensionColumn(col, allDisplayedColumns));
        if (dimensionCols.length > 0) {
            const firstDimensionInRange = dimensionCols[0];
            this.addRange(CellRangeType.DIMENSION, [firstDimensionInRange])
        }

        const valueCols = colsToSplit.filter(col => ChartController.isValueColumn(col, allDisplayedColumns));
        if (valueCols.length === 0) {
            // no range to add
        } else if (valueCols.length === 1) {
            this.addRange(CellRangeType.VALUE, valueCols)
        } else {

            let currentRange = [];
            for (let i = 0; i < valueCols.length; i++) {
                const currentValCol = valueCols[i];
                currentRange.push(currentValCol);

                // if last value col, close out range
                if (i === valueCols.length - 1) {
                    this.addRange(CellRangeType.VALUE, currentRange);
                    break;
                }

                const nextValCol = valueCols[i + 1];
                const nextDisplayedCol = this.columnController.getDisplayedColAfter(currentValCol) as Column;

                // if next val col is not contiguous, close out range and start over
                if (nextValCol !== nextDisplayedCol) {
                    this.addRange(CellRangeType.VALUE, currentRange);
                    currentRange = [];
                }
            }
        }
    }

    public updateCellRanges(dimensionColState: ColState[], updatedColState: ColState): void {
        const colToUpdate = updatedColState.colId;

        // the default category shouldn't be added to a cell range
        if (colToUpdate === ChartColumnModel.DEFAULT_CATEGORY) {
            return;
        }

        if (updatedColState.selected) {
            const newColumn = this.columnController.getGridColumn(updatedColState.colId) as Column;

            const isDimensionCol = dimensionColState.some(col => col.colId === colToUpdate);

            if (isDimensionCol) {
                // remove any existing dimension ranges
                dimensionColState.forEach(cs => {
                    const rangeToRemove = this.getCellRangeWithColId(cs.colId);
                    if (rangeToRemove) {
                        this.cellRanges = this.cellRanges.filter(range => range !== rangeToRemove);
                    }
                });

                this.addRange(CellRangeType.DIMENSION, [newColumn]);
                return;
            }

            const noValueRanges =
                this.cellRanges.length === 0 || !this.cellRanges.some(range => range.type === CellRangeType.VALUE);

            // if there is no value range just add new column to a new range
            if (noValueRanges) {
                this.addRange(CellRangeType.VALUE, [newColumn]);
                return;
            }

            const removeRange = (rangeToRemove: CellRange) => {
                this.cellRanges = this.cellRanges.filter(range => range !== rangeToRemove);
            };

            const valueRanges = this.cellRanges.filter(range => range.type === CellRangeType.VALUE);

            // Step 1: try and concatenate ranges
            const colBeforeNewCol = this.columnController.getDisplayedColBefore(newColumn) as Column;
            const colAfterNewCol = this.columnController.getDisplayedColAfter(newColumn) as Column;

            const adjacentBeforeRanges = valueRanges.filter(range => _.last(range.columns) === colBeforeNewCol);
            const adjacentAfterRanges = valueRanges.filter(range => range.columns[0] === colAfterNewCol);

            if (adjacentBeforeRanges.length === 1 && adjacentAfterRanges.length === 1) {
                const adjacentBeforeRange = adjacentBeforeRanges[0];
                const adjacentAfterRange = adjacentAfterRanges[0];

                adjacentBeforeRange.columns.push(newColumn);
                adjacentAfterRange.columns.forEach(col => adjacentBeforeRange.columns.push(col));

                removeRange(adjacentAfterRange);
                return;
            }

            // Step 2: try and add to existing range
            for (let i = 0; i < valueRanges.length; i++) {
                const valueRange = valueRanges[i];

                // if new column is immediately before current value range, just prepend it
                const firstColInRange = valueRange.columns[0] as Column;
                const colBefore = this.columnController.getDisplayedColBefore(firstColInRange);
                const addBeforeLastRange = colBefore && colBefore.getColId() === updatedColState.colId;
                if (addBeforeLastRange) {
                    valueRange.columns.unshift(newColumn);
                    return;
                }

                // if new column is immediately after current value range, just append it
                const lastColInRange = _.last(valueRange.columns) as Column;
                const colAfter = this.columnController.getDisplayedColAfter(lastColInRange);
                const addAfterLastRange = colAfter && colAfter.getColId() === updatedColState.colId;
                if (addAfterLastRange) {
                    valueRange.columns.push(newColumn);
                    return;
                }
            }

            // Step 3: otherwise add the new column to a new range
            this.addRange(CellRangeType.VALUE, [newColumn]);

        } else {
            const rangeToUpdate = this.getCellRangeWithColId(colToUpdate);

            const removeThisRange = () => {
                this.cellRanges = this.cellRanges.filter(range => range !== rangeToUpdate);
            };

            const removeColFromThisRange = () => {
                rangeToUpdate.columns = rangeToUpdate.columns.filter(col => col.getColId() !== colToUpdate);
            };

            if (rangeToUpdate.columns.length === 1) {
                removeThisRange();

            } else if (rangeToUpdate.columns.length === 2) {
                removeColFromThisRange();

            } else {
                const colIdsInRange = rangeToUpdate.columns.map(col => col.getColId());
                const indexOfColToRemove = colIdsInRange.indexOf(updatedColState.colId);
                const shouldSplitRange = indexOfColToRemove > 0 && indexOfColToRemove < colIdsInRange.length - 1;

                if (shouldSplitRange) {
                    const firstRangeCols = rangeToUpdate.columns.slice(0, indexOfColToRemove);
                    const secondRangeCols = rangeToUpdate.columns.slice(indexOfColToRemove + 1);

                    this.addRange(CellRangeType.VALUE, firstRangeCols);
                    this.addRange(CellRangeType.VALUE, secondRangeCols);

                    removeThisRange();
                } else {
                    removeColFromThisRange();
                }
            }
        }
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

    private getCellRangeWithColId(colId: string): CellRange {
        return this.cellRanges.filter((cellRange: CellRange) => {
            return cellRange.columns.filter(col => col.getColId() === colId).length === 1
        })[0];
    }

    public destroy() {
        super.destroy();
    }
}