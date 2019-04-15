import {
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
    ChartType,
    Events,
    EventService,
    PostConstruct,
} from "ag-grid-community";
import {RangeController} from "../../rangeController";
import {ChartDatasource} from "./chartDatasource";
import {ChartOptions} from "./gridChartComp";
import {ChartRangeModel} from "./model/chartRangeModel";
import {ChartColumnModel, ColState} from "./model/chartColumnModel";
import {ChartDataModel} from "./model/chartDataModel";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggregate: boolean;
    private readonly startingCellRanges: CellRange[];

    private chartType: ChartType;

    private dataModel: ChartDataModel;
    private rangeModel: ChartRangeModel;
    private columnModel: ChartColumnModel;

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.startingCellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
        this.setupRangeModel();
        this.setupColumnModel();
        this.setupDataModel();

        this.updateModel();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onGridColumnChange.bind(this));
    }

    private setupRangeModel(): void {
        this.rangeModel = new ChartRangeModel(this.startingCellRanges);
        this.getContext().wireBean(this.rangeModel);

        // update the range controller now that we have updated the cell ranges as 'value' or 'dimension'
        this.setChartCellRangesInRangeController();
    }

    private setupColumnModel(): void {
        this.columnModel = new ChartColumnModel();
        this.getContext().wireBean(this.columnModel);

        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);
    }

    private setupDataModel(): void {
        this.dataModel = new ChartDataModel(this.aggregate);
        this.getContext().wireBean(this.dataModel);
    }

    public updateForColumnSelection(updatedCol: ColState): void {
        this.columnModel.updateColumnState(updatedCol);
        this.rangeModel.updateCellRanges(this.columnModel.getDimensionColState(), updatedCol);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private onGridColumnChange() {
        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);
        this.updateModel();
    }

    private updateModel() {
        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.updateColumnStateFromRanges(allColsFromRanges);

        const selectedDimension = this.columnModel.getSelectedDimensionId();
        const selectedValueCols = this.columnModel.getSelectedValueCols();
        const {startRow, endRow} = this.getRowIndexes();

        this.dataModel.updateModel(selectedDimension, selectedValueCols, startRow, endRow);

        this.raiseChartUpdatedEvent();
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.columnModel.getDimensionColState(), valueCols: this.columnModel.getValueColState()}
    }

    public getData(): any[] {
        return this.dataModel.getData();
    }

    public getSelectedCategory(): string {
        return this.columnModel.getSelectedDimensionId();
    }

    public getFields(): { colId: string, displayName: string }[] {
        return this.columnModel.getSelectedColState().map(cs => {
            return {
                colId: cs.colId,
                displayName: cs.displayName
            };
        });
    };

    public getChartType(): ChartType {
        return this.chartType;
    }

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.rangeModel.getCellRanges());
    }

    public removeChartCellRangesFromRangeController() {
        this.rangeController.setCellRanges([]);
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartController.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    private getRowIndexes(): {startRow: number, endRow: number} {
        let startRow = 0, endRow = 0;
        const lastRange = this.rangeModel.getLastRange();
        if (lastRange) {
            startRow = this.rangeController.getRangeStartRow(lastRange).rowIndex;
            endRow = this.rangeController.getRangeEndRow(lastRange).rowIndex;
        }
        return {startRow, endRow}
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}