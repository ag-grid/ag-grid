import {Autowired, BeanStub, Column, ColumnController,} from "ag-grid-community";
import {ChartController} from "../chartController";

export type ColState = {
    column?: Column,
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartColumnModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

    @Autowired('columnController') private columnController: ColumnController;

    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];

    public constructor() {
        super();
    }

    public getValueColState(): ColState[] {
        return this.valueColState;
    }

    public getDimensionColState(): ColState[] {
        return this.dimensionColState;
    }

    public resetColumnState(allColsFromRanges: Column[]): void {
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
            colId: ChartColumnModel.DEFAULT_CATEGORY,
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

    public getValueCols(): Column[] {
        return this.valueColState.filter(cs => cs.selected).map(cs => cs.column) as Column[];
    }

    public getSelectedDimensionId(): string {
        return this.dimensionColState.filter(cs => cs.selected)[0].colId;
    }

    private getAllChartColumns(): { dimensionCols: Column[], valueCols: Column[] } {
        const displayedCols = this.columnController.getAllDisplayedColumns();

        const dimensionCols: Column[] = [];
        const valueCols: Column[] = [];
        displayedCols.forEach(col => {
            if (ChartController.isDimensionColumn(col, displayedCols)) {
                dimensionCols.push(col);
            } else if (ChartController.isValueColumn(col, displayedCols)) {
                valueCols.push(col);
            } else {
                // ignore!
            }
        });

        return {dimensionCols, valueCols};
    }

    private getFieldName(col: Column): string {
        return this.columnController.getDisplayNameForColumn(col, 'chart') as string;
    }

    public destroy() {
        super.destroy();
    }
}