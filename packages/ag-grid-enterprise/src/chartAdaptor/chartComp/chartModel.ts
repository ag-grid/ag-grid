import {
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

export interface ChartModelUpdatedEvent extends AgEvent {}

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
    private cellRanges?: CellRange[];

    private startRow: number;
    private endRow: number;

    private chartType: ChartType;
    private chartData: any[];

    private dimensionColState: ColState[] = [];
    private valueColState: ColState[] = [];

    private errors: string[] = [];
    private width: number;
    private height: number;
    private showTooltips: boolean;
    private insideDialog: boolean;

    private firstCellRange: CellRange;

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRange: CellRange) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;

        cellRange.chartMode = true;
        this.firstCellRange = cellRange;
        this.cellRanges = [cellRange];

        this.width = chartOptions.width;
        this.height = chartOptions.height;
        this.showTooltips = chartOptions.showTooltips;
        this.insideDialog = chartOptions.insideDialog;
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        this.startRow = this.rangeController.getRangeStartRow(this.cellRanges![0]).rowIndex;
        this.endRow = this.rangeController.getRangeEndRow(this.cellRanges![0]).rowIndex;

        this.initColumnState();

        // abort if any errors occurred during init of column state
        if (this.errors.length > 0) return;

        this.updateModel();

        this.addDestroyableEventListener(this.eventService, 'fred', this.fred.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
    }

    private fred() {
        this.updateModel();
    }

    private initColumnState(): void {
        if (!this.cellRanges || this.cellRanges.length === 0 || !this.cellRanges![0].columns) {
            this.errors.push('No columns found in range');
            return;
        }

        const colsInCellRange: Column[] = this.cellRanges![0].columns;

        const {dimensionCols, valueCols} = this.getAllChartColumns();

        this.valueColState = valueCols.map(column => {
            return {
                column,
                colId: column.getColId(),
                displayName: this.getFieldName(column),
                selected: colsInCellRange.indexOf(column) > -1
            };
        });

        const noValueColsInRange = this.valueColState.filter(cs => cs.selected).length === 0;
        if (noValueColsInRange) {
            this.errors.push('No value column in selected range.');
            return;
        }

        this.dimensionColState = dimensionCols.map(column => {
            return {
                column,
                colId: column.getColId(),
                displayName: this.getFieldName(column),
                selected: false
            };
        });

        const dimensionsInCellRange = dimensionCols.filter(col => colsInCellRange.indexOf(col) > -1);

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
        this.errors = [];

        const categoryIds = [this.getSelectedCategory()];

        const fields = this.valueColState
            .filter(cs => cs.selected)
            .map(cs => cs.column) as Column[];

        let startRow = 0;
        let endRow = 0;
        if (this.cellRanges!.length > 0) {
            startRow = this.cellRanges![0].startRow!.rowIndex;
            endRow = this.cellRanges![0].endRow!.rowIndex;
        }

        const params: ChartDatasourceParams = {
            categoryIds: categoryIds,
            fields: fields,
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);

        this.raiseChartUpdatedEvent();
    }

    public update(updatedColState: ColState): void {
        this.updateColumnState(updatedColState);
        this.addNewCellRange(updatedColState);
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

    private addNewCellRange(updatedColState: ColState) {
        if (updatedColState.selected) {

            const column = this.columnController.getGridColumn(updatedColState.colId) as Column;

            const firstCellRange: CellRange = this.firstCellRange;
            this.cellRanges!.push({
                startRow: firstCellRange.startRow,
                endRow: firstCellRange.endRow,
                columns: [column],
                chartMode: true
            });

        } else {
            const colsMatch = (col: Column) => col.getColId() === updatedColState.colId;

            const rangesMatch = (cellRange: CellRange) => cellRange.columns.filter(colsMatch).length === 1;
            const matchingRange = this.cellRanges!.filter(rangesMatch)[0];

            const shouldRemoveRange = matchingRange.columns.length === 1;
            if (shouldRemoveRange) {
                const rangesDontMatch = (cellRange: CellRange) => cellRange.columns.filter(colsMatch).length !== 1;

                if (this.cellRanges!.length === 1) {
                    this.firstCellRange = this.cellRanges![0];
                }

                this.cellRanges = this.cellRanges!.filter(rangesDontMatch);
            } else {
                this.cellRanges!.forEach(cellRange => {
                   if (rangesMatch(cellRange)) {
                       const colsDontMatch = (col: Column) => col.getColId() !== updatedColState.colId;
                       cellRange.columns = cellRange.columns.filter(colsDontMatch);
                   }
                });
            }
        }

        this.setCellRanges();
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

    public getErrors(): string[] {
        return this.errors;
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