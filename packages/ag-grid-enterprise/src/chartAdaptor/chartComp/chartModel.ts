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
import {ChartDatasource} from "./chartDatasource";

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

    private readonly aggregate: boolean;

    private readonly cellRange?: CellRange;
    private startRow: number;
    private endRow: number;

    private chartType: ChartType;
    private chartData: any[];

    private selectedCategory: Column;
    private categories: Column[];
    private fields: Column[];
    private datasource: ChartDatasource;

    private errors: string[] = [];

    public constructor(chartType: ChartType, cellRange: CellRange, aggregate: boolean) {
        super();
        this.chartType = chartType;
        this.cellRange = cellRange;
        this.aggregate = aggregate;
    }

    @PostConstruct
    private postConstruct(): void {
        this.datasource = new ChartDatasource();
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
        this.errors = [];

        this.chartData = this.datasource.getData(this.categories, this.fields, this.startRow, this.endRow, this.aggregate);
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

    public getColStateForMenu(): {dimensionCols: ColState[], valueCols: ColState[]} {
        const {dimensionCols, valueCols} = this.getAllChartColumns();

        const colStateMapper = (isSelected: (col: Column) => boolean) => {
            return (column: Column) => {
                const colId = column.getColId();
                let displayName = this.columnController.getDisplayNameForColumn(column, 'chart') as string;
                const selected = isSelected(column);
                return {column, colId, displayName, selected}
            }
        };

        const isDimensionColSelected = (column: Column) => this.selectedCategory.getColId() === column.getColId();
        const isValueColSelected = (column: Column) => this.fields.indexOf(column) > -1;

        return {
            dimensionCols: dimensionCols.map(colStateMapper(isDimensionColSelected)),
            valueCols: valueCols.map(colStateMapper(isValueColSelected))
        }
    }

    public getData(): any[] {
        const res: any[] = [];
        for (let i = 0; i < this.chartData.length; i++) {
            const data = this.chartData[i];
            const item: any = {
                category: data[this.selectedCategory.getColId()]
            };

            this.fields.forEach(field => {
                item[field.getColId()] = data[field.getColId()];
            });

            res.push(item);
        }
        return res;
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    public update(colState: ColState): void {
        if (colState.selected) {
            const newColumn = this.columnController.getGridColumn(colState.colId) as Column;

            const {dimensionCols, valueCols} = this.getAllChartColumns();
            if (dimensionCols.indexOf(newColumn) > -1) {
                this.categories = [newColumn];
                this.selectedCategory = newColumn;
            }
            if (valueCols.indexOf(newColumn) > -1) {
                this.fields.push(newColumn);
            }

        } else {
            this.fields = this.fields.filter(col => col.getColId() !== colState.colId);
        }

        this.updateModel();
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

        const {dimensionCols, valueCols} = this.getAllChartColumns();

        // pull out all dimension columns from the range
        cellRange.columns.forEach(col => {
            if (dimensionCols.indexOf(col) > -1) {
                categoriesInRange.push(col);
            } else if (valueCols.indexOf(col) > -1) {
                fieldsInRange.push(col);
            } else {
                console.warn(`ag-Grid - column '${col.getColId()}' is not configured for charting`);
            }
        });

        if (fieldsInRange.length === 0) {
            this.errors.push('No value column in selected range.');
        }

        // if no dimension columns in the range, then pull out first dimension column from displayed columns
        if (categoriesInRange.length === 0 && dimensionCols.length > 0) {
            categoriesInRange.push(dimensionCols[0]);
        } else {
            this.errors.push('No dimension / category columns found.');
        }

        return {categoriesInRange, fieldsInRange};
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