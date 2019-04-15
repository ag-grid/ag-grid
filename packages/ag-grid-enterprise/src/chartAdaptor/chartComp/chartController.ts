import {
    _,
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
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
import {ChartRangeModel} from "./model/chartRangeModel";
import {ChartColumnModel, ColState} from "./model/chartColumnModel";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggregate: boolean;
    private readonly showTooltips: boolean;
    private readonly insideDialog: boolean;
    private readonly startingCellRanges: CellRange[];

    private width: number;
    private height: number;

    private chartType: ChartType;
    private chartData: any[];

    private rangeModel: ChartRangeModel;
    private columnModel: ChartColumnModel;

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.width = chartOptions.width;
        this.height = chartOptions.height;
        this.showTooltips = chartOptions.showTooltips;
        this.insideDialog = chartOptions.insideDialog;
        this.startingCellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);

        this.rangeModel = new ChartRangeModel(this.startingCellRanges);
        this.getContext().wireBean(this.rangeModel);

        // update the range controller now that we have updated the cell ranges as 'value' or 'dimension'
        this.setChartCellRangesInRangeController();

        this.columnModel = new ChartColumnModel();
        this.getContext().wireBean(this.columnModel);

        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);

        this.updateModel();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForColumnChange.bind(this));
    }

    private updateModel() {
        const cellRanges = this.rangeModel.getCellRanges();
        const lastRange = _.last(cellRanges) as CellRange;

        let startRow = 0, endRow = 0;
        if (lastRange) {
            startRow = this.rangeController.getRangeStartRow(lastRange).rowIndex;
            endRow = this.rangeController.getRangeEndRow(lastRange).rowIndex;
        }

        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.updateColumnStateFromRanges(allColsFromRanges);

        const fields = this.columnModel.getValueColState()
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

        this.raiseChartUpdatedEvent();
    }

    private updateForColumnChange() {
        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);
        this.updateModel();
    }

    public update(updatedColState: ColState): void {
        this.columnModel.updateColumnState(updatedColState);
        this.rangeModel.updateCellRanges(this.columnModel.getDimensionColState(), updatedColState);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    static isDimensionColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableRowGroup || !!colDef.enablePivot);
    }

    static isValueColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableValue);
    }

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.rangeModel.getCellRanges());
    }

    public removeChartCellRangesFromRangeController() {
        this.rangeController.setCellRanges([]);
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.columnModel.getDimensionColState(), valueCols: this.columnModel.getValueColState()}
    }

    public getData(): any[] {
        return this.chartData;
    }

    public getSelectedCategory(): string {
        return this.columnModel.getDimensionColState().filter(cs => cs.selected)[0].colId;
    }

    public getFields(): { colId: string, displayName: string }[] {
        return this.columnModel.getValueColState()
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

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartController.EVENT_CHART_MODEL_UPDATED
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