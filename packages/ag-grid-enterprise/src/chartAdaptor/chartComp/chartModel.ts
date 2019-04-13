import {
    _,
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
    ChartType,
    Column,
    ColumnController,
    Events,
    EventService,
    PostConstruct
} from "ag-grid-community";
import {RangeController} from "../../rangeController";
import {ChartDatasource, ChartDatasourceParams} from "./chartDatasource";
import {ChartOptions} from "./gridChartComp";

export interface ChartModelUpdatedEvent extends AgEvent {
    fromGrid: boolean;
}

export type ColState = {
    column?: Column,
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartModel extends BeanStub {

    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';
    public static DEFAULT_CATEGORY = 'AG-GRID-DEFAULT-CATEGORY';

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

        this.initCellRanges(cellRanges);
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        this.initColumnState();
        this.updateModel();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, this.updateModel.bind(this, true));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForColumnChange.bind(this));
    }

    private initCellRanges(cellRanges: CellRange[]): void {
        cellRanges.forEach(range => range.chartMode = true);
        this.referenceCellRange = cellRanges[0];
        this.cellRanges = cellRanges;
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

    private updateModel(fromGrid: boolean = false) {
        if (this.cellRanges.length === 0 || this.valueColState.length === 0) return;

        const startRow = this.rangeController.getRangeStartRow(this.cellRanges[0]).rowIndex;
        const endRow = this.rangeController.getRangeEndRow(this.cellRanges[0]).rowIndex;

        const categoryIds = [this.getSelectedCategory()];

        if (this.cellRanges.length === 1) {
            const colIdsInRange = this.cellRanges[0].columns.map(col => col.getColId());
            this.valueColState.filter(cs => cs.selected = colIdsInRange.indexOf(cs.colId) > -1);
        }

        const fields = this.valueColState
            .filter(cs => cs.selected)
            .map(cs => cs.column) as Column[];

        const params: ChartDatasourceParams = {
            categoryIds: categoryIds,
            fields: fields,
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);
        this.raiseChartUpdatedEvent(fromGrid);
    }

    private updateForColumnChange() {
        this.initColumnState();
        this.updateModel();
    }

    public update(updatedColState: ColState): void {
        this.updateColumnState(updatedColState);
        this.updateCellRanges(updatedColState);
        this.updateModel();
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
            const isDimensionCol = this.dimensionColState
                .map(cs => cs.colId)
                .filter(id => id === colToUpdate).length > 0;

            if (isDimensionCol) {
                // remove any existing dimension ranges
                this.dimensionColState.forEach(cs => {
                    const rangeToRemove = this.getCellRangeWithColId(cs.colId);
                    if (rangeToRemove) {
                        this.cellRanges = this.cellRanges.filter(range => range !== rangeToRemove);
                    }
                });
            }

            const column = this.columnController.getGridColumn(updatedColState.colId) as Column;
            this.addRange(this.referenceCellRange, [column]);

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
                const shouldSplitRange = indexOfColToRemove > 0 && indexOfColToRemove < colIdsInRange.length -1;

                if (shouldSplitRange) {
                    const firstRangeCols = rangeToUpdate.columns.slice(0, indexOfColToRemove);
                    const secondRangeCols = rangeToUpdate.columns.slice(indexOfColToRemove + 1);

                    this.addRange(rangeToUpdate, firstRangeCols);
                    this.addRange(rangeToUpdate, secondRangeCols);

                    removeThisRange();
                } else {
                    removeColFromThisRange();
                }
            }
        }

        this.setCellRanges();
    }

    private addRange(referenceRange: CellRange, columns: Column[]) {
        this.cellRanges.push({
            startRow: referenceRange.startRow,
            endRow: referenceRange.endRow,
            columns: columns,
            startColumn: columns[0],
            chartMode: true
        });
    }

    private getCellRangeWithColId(colId: string): CellRange {
        return this.cellRanges.filter((cellRange: CellRange) => {
            return cellRange.columns.filter(col => col.getColId() === colId).length === 1
        })[0];
    }

    private getAllChartColumns(): {dimensionCols: Column[], valueCols: Column[]} {
        const displayedCols = this.columnController.getAllDisplayedColumns();

        const isDimension = (col: Column) =>
            // col has to be defined by user as a dimension
            (col.getColDef().enableRowGroup || col.getColDef().enablePivot)
            &&
            // plus the col must be visible
            displayedCols.indexOf(col) >= 0;

        const isValueCol = (col: Column) =>
            // all columns must have enableValue enabled
            col.getColDef().enableValue
            // and the column must be visible in the grid. this gets around issues where user switches
            // into / our of pivot mode (range no longer valid as switching between primary and secondary cols)
            && displayedCols.indexOf(col) >= 0;

        const dimensionCols: Column[] = [];
        const valueCols: Column[] = [];
        displayedCols.forEach(col => {
            if (isDimension(col)) {
                dimensionCols.push(col);
            } else if (isValueCol(col)) {
                valueCols.push(col);
            }
        });

        return {dimensionCols, valueCols};
    }

    public setCellRanges() {
        this.rangeController.setCellRanges(this.cellRanges!);
    }

    public removeRanges() {
        this.rangeController.setCellRanges([]);
    }

    public getColStateForMenu(): {dimensionCols: ColState[], valueCols: ColState[]} {
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

    private raiseChartUpdatedEvent(fromGrid: boolean = false) {
        const event: ChartModelUpdatedEvent = {
            type: ChartModel.EVENT_CHART_MODEL_UPDATED,
            fromGrid
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