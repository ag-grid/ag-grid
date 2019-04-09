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
    IAggFunc,
    PostConstruct
} from "ag-grid-community";
import {ChartDatasource} from "../rangeChart/rangeChartService";
import {RangeController} from "../../rangeController";
import {RangeChartDatasource} from "../rangeChart/rangeChartDatasource";

export interface ChartModelUpdatedEvent extends AgEvent {}

export type ColState = {
    column: Column,
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartModel extends BeanStub {

    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggFunc?: IAggFunc | string;

    private readonly cellRange?: CellRange;
    private startRow: number;
    private endRow: number;

    private chartType: ChartType;
    private chartData: any[];

    private selectedCategory: Column;
    private categories: Column[];
    private fields: Column[];
    private datasource: ChartDatasource;

    private errors: string[];

    public constructor(chartType: ChartType, cellRange: CellRange, aggFunc?: IAggFunc | string) {
        super();
        this.chartType = chartType;
        this.cellRange = cellRange;
        this.aggFunc = aggFunc;
    }

    @PostConstruct
    private postConstruct(): void {
        this.datasource = new RangeChartDatasource();
        this.getContext().wireBean(this.datasource);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));

        this.init();

        this.updateModel();
    }

    private init() {
        this.startRow = this.rangeController.getRangeStartRow(this.cellRange!).rowIndex;
        this.endRow = this.rangeController.getRangeEndRow(this.cellRange!).rowIndex;

        const {categoriesInRange, fieldsInRange} = this.getColumnsFromRange(this.cellRange!);

        this.categories = categoriesInRange;
        this.fields = fieldsInRange;

        this.selectedCategory = categoriesInRange[0];
    }

    private updateModel() {
        this.chartData = this.datasource.getChartData(this.categories, this.fields, this.startRow, this.endRow, this.aggFunc);
        this.errors = this.datasource.getErrors();

        this.raiseChartUpdatedEvent();
    }

    public getChartType(): ChartType {
        return this.chartType;
    }

    public getErrors(): string[] {
        return this.errors;
    }

    public getFields(): string[] {
        return this.fields.map(col => col.getColId());
    }

    public getFieldNames(): string[] {
        return this.fields.map(col => {
            const displayName = this.columnController.getDisplayNameForColumn(col, 'chart');
            return displayName ? displayName : '';
        });
    }

    public getColStateForMenu(): ColState[] {
        const allDisplayedColumns: Column[] = this.columnController.getAllDisplayedColumns();
        const selectedColumns: Column[] = this.cellRange!.columns;

        return allDisplayedColumns.map(column => {
            const colId = column.getColId();

            let displayName = this.columnController.getDisplayNameForColumn(column, 'chart');
            displayName = displayName ? displayName : '';

            const selectedCol = selectedColumns.filter(col => col.getColId() === colId);
            const selected = selectedCol && selectedCol.length === 1;
            return {column, colId, displayName, selected}
        });
    }

    public getData(): any[] {
        const data: any[] = [];

        for (let i = 0; i < this.chartData.length; i++) {
            const item: any = {
                category: this.getCategoryValue(i)
            };

            this.fields.forEach(field => {
                const data = this.chartData[i];
                item[field.getColId()] = data[field.getColId()];
            });

            data.push(item);
        }
        return data;
    }

    private getCategoryValue(i: number): string {
        const data = this.chartData[i];
        return data[this.selectedCategory.getColId()];
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    public update(colState: ColState): void {
        if (colState.selected) {
            const newColumn = this.columnController.getGridColumn(colState.colId) as Column;
            this.fields.push(newColumn)
        } else {
            this.fields = this.fields.filter(col => col.getColId() !== colState.colId);
        }

        this.updateModel();

        this.raiseChartUpdatedEvent();
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartModel.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    private getColumnsFromRange(cellRange: CellRange): {categoriesInRange: Column[], fieldsInRange: Column[]} {
        if (!cellRange.columns) {
            return {
                categoriesInRange: [],
                fieldsInRange: []
            };
        }

        const categoriesInRange: Column[] = [];
        const fieldsInRange: Column[] = [];

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

        // pull out all dimension columns from the range
        cellRange.columns.forEach(col => {
            if (isDimension(col)) {
                categoriesInRange.push(col);
            } else if (isValueCol(col)) {
                fieldsInRange.push(col);
            } else {
                console.warn(`ag-Grid - column '${col.getColId()}' is not configured for charting`);
            }
        });

        if (fieldsInRange.length === 0) {
            this.errors.push('No value column in selected range.');
        }

        // if no dimension columns in the range, then pull out first dimension column from displayed columns
        if (categoriesInRange.length === 0) {
            displayedCols!.forEach(col => {
                if (categoriesInRange.length === 0 && isDimension(col)) {
                    categoriesInRange.push(col);
                }
            });
        }

        return {categoriesInRange, fieldsInRange};
    }

    public updateCellRange() {
        if (!this.cellRange) return;

        const { startRow, endRow, columns } = this.cellRange;

        this.rangeController.setCellRange({
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: columns
        });
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}