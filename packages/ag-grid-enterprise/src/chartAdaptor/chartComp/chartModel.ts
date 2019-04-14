import {
    _,
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeType,
    ChartType,
    ColDef,
    Column,
    ColumnController,
    Events,
    EventService,
    PostConstruct,
} from "ag-grid-community";
import {RangeController} from "../../rangeController";
import {ChartDatasource, ChartDatasourceParams} from "./chartDatasource";
import {ChartOptions} from "./gridChartComp";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export type ColState = {
    column?: Column,
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartModel extends BeanStub {

    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggregate: boolean;
    private cellRanges: CellRange[];

    private chartType: ChartType;
    private chartData: any[];

    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];

    private width: number;
    private height: number;
    private showTooltips: boolean;
    private insideDialog: boolean;

    // this is used to restore cols after all have been removed via menu
    private referenceCellRange: CellRange;

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.width = chartOptions.width;
        this.height = chartOptions.height;
        this.showTooltips = chartOptions.showTooltips;
        this.insideDialog = chartOptions.insideDialog;
        this.cellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        this.initCellRanges();
        this.initColumnState();
        this.updateModel();

        this.addDestroyableEventListener(this.eventService, "chartRangeSelectionChanged", this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForColumnChange.bind(this));
    }

    private initCellRanges(): void {
        // use first range as a reference range to be used after removing all cols (via menu) so we can re-add later
        this.referenceCellRange = this.cellRanges[0];

        this.splitInitialRange();

        // update the range controller now that we have updated the cell ranges as 'value' or 'dimension'
        this.setChartCellRangesInRangeController();
    }

    private splitInitialRange() {
        // there is only one range provided initially
        const colsToSplit = this.cellRanges[0].columns;

        this.cellRanges = [];

        const allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        const dimensionCols = colsToSplit.filter(col => this.isDimensionColumn(col, allDisplayedColumns));
        if (dimensionCols.length > 0) {
            const firstDimensionInRange = dimensionCols[0];
            this.addRange(CellRangeType.DIMENSION, [firstDimensionInRange])
        }

        const valueCols = colsToSplit.filter(col => this.isValueColumn(col, allDisplayedColumns));
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

    private initColumnState(): void {
        const colsFromAllRanges: Column[] = _.flatten(this.cellRanges.map(range => range.columns));

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

        } else {
            // add a default category if no dimensions in range
            const defaultCategory = {
                colId: ChartModel.DEFAULT_CATEGORY,
                displayName: '(None)',
                selected: true
            };
            this.dimensionColState.push(defaultCategory);
        }
    }

    private updateModel() {
        const lastRange = _.last(this.cellRanges) as CellRange;

        let startRow = 0, endRow = 0;
        if (lastRange) {
            startRow = this.rangeController.getRangeStartRow(lastRange).rowIndex;
            endRow = this.rangeController.getRangeEndRow(lastRange).rowIndex;
        }

        const allColsFromRanges: Column[] = _.flatten(this.cellRanges.map(range => range.columns));

        this.valueColState.forEach(cs => {
            cs.selected = allColsFromRanges.some(col => col.getColId() === cs.colId);
        });

        const fields = this.valueColState
            .filter(cs => cs.selected)
            .map(cs => cs.column) as Column[];

        const categoryIds = [this.getSelectedCategory()];

        const params: ChartDatasourceParams = {
            categoryIds: categoryIds,
            fields: fields,
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);

        console.log("leave updateModel: ", this);

        this.raiseChartUpdatedEvent();
    }

    private updateForColumnChange() {
        this.initColumnState();
        this.updateModel();
    }

    public update(updatedColState: ColState): void {
        this.updateColumnState(updatedColState);
        this.updateCellRanges(updatedColState);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private updateColumnState(updatedCol: ColState) {
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

    private updateCellRanges(updatedColState: ColState) {
        const colToUpdate = updatedColState.colId;

        if (updatedColState.selected) {
            const newColumn = this.columnController.getGridColumn(updatedColState.colId) as Column;

            const isDimensionCol = this.dimensionColState.some(col => col.colId === colToUpdate);

            if (isDimensionCol) {
                // remove any existing dimension ranges
                this.dimensionColState.forEach(cs => {
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

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.cellRanges);
    }

    public removeChartCellRangesFromRangeController() {
        this.rangeController.setCellRanges([]);
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        // don't return the default category to the menu
        const hideDefaultCategoryFilter = (cs: ColState) => cs.colId !== ChartModel.DEFAULT_CATEGORY;
        const dimensionColState = this.dimensionColState.filter(hideDefaultCategoryFilter);

        return {dimensionCols: dimensionColState, valueCols: this.valueColState}
    }

    public getData(): any[] {
        return this.chartData;
    }

    public getSelectedCategory(): string {
        return this.dimensionColState.filter(cs => cs.selected)[0].colId;
    }

    public getFields(): { colId: string, displayName: string }[] {
        return this.valueColState
            .filter(cs => cs.selected)
            .map(cs => {
                return {
                    colId: cs.colId,
                    displayName: cs.displayName
                };
            });
    };

    public getChartType(): ChartType {
        return this.chartType;
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(height: number): void {
        this.height = height;
    }

    public isShowTooltips(): boolean {
        return this.showTooltips;
    }

    public isInsideDialog(): boolean {
        return this.insideDialog;
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    private getFieldName(col: Column): string {
        return this.columnController.getDisplayNameForColumn(col, 'chart') as string;
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartModel.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}