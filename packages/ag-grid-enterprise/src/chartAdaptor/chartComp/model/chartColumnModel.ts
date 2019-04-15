import {_, Autowired, BeanStub, Column, ColumnController, PostConstruct,} from "ag-grid-community";
import {ChartRangeModel} from "./chartRangeModel";
import {ChartModel} from "./chartModel";

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

    private rangeModel: ChartRangeModel;

    public constructor(rangeModel: ChartRangeModel) {
        super();
        this.rangeModel = rangeModel;
    }

    @PostConstruct
    private init(): void {
        this.resetColumnState();
    }

    public getValueColState(): ColState[] {
        return this.valueColState;
    }

    public getDimensionColState(): ColState[] {
        return this.dimensionColState;
    }

    public resetColumnState(): void {
        const cellRanges = this.rangeModel.getCellRanges();
        const colsFromAllRanges: Column[] = _.flatten(cellRanges.map(range => range.columns));

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
                selected: colsFromAllRanges.indexOf(column) > -1
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

        const dimensionsInCellRange = dimensionCols.filter(col => colsFromAllRanges.indexOf(col) > -1);

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

    private getAllChartColumns(): { dimensionCols: Column[], valueCols: Column[] } {
        const displayedCols = this.columnController.getAllDisplayedColumns();

        const dimensionCols: Column[] = [];
        const valueCols: Column[] = [];
        displayedCols.forEach(col => {
            if (ChartModel.isDimensionColumn(col, displayedCols)) {
                dimensionCols.push(col);
            } else if (ChartModel.isValueColumn(col, displayedCols)) {
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