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
import {ChartOptions} from "./gridChartComp";
import {ChartModel, ColState} from "./chartModel";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggregate: boolean;
    private readonly startingCellRanges: CellRange[];

    private chartType: ChartType;

    private columnModel: ChartModel;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.startingCellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
       
        this.setupColumnModel();
       
        this.updateModel();

        this.setChartCellRangesInRangeController();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onGridColumnChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));
    }

    private setupColumnModel(): void {
        this.columnModel = new ChartModel(this.startingCellRanges, this.aggregate);
        this.getContext().wireBean(this.columnModel);

        this.columnModel.resetColumnState();
    }

    public updateForColumnSelection(updatedCol: ColState): void {
        this.columnModel.updateColumnState(updatedCol);
        this.columnModel.updateCellRanges(updatedCol);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private onGridColumnChange() {
        this.columnModel.resetColumnState();
        this.updateModel();
    }

    private onColumnMoved() {
        const allColsFromRanges = this.columnModel.getAllColumnsFromRanges();
        this.columnModel.updateColumnStateFromRanges(allColsFromRanges);

        this.columnModel.updateCellRanges();

        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private updateModel() {
        const allColsFromRanges = this.columnModel.getAllColumnsFromRanges();
        this.columnModel.updateColumnStateFromRanges(allColsFromRanges);

        const selectedDimension = this.columnModel.getSelectedDimensionId();
        const selectedValueCols = this.columnModel.getSelectedValueCols();
        const {startRow, endRow} = this.getRowIndexes();

        this.columnModel.updateData(selectedDimension, selectedValueCols, startRow, endRow);

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
        return this.columnModel.getData();
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
        this.rangeController.setCellRanges(this.columnModel.getCellRanges());
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
        const lastRange = this.columnModel.getLastRange();
        if (lastRange) {
            startRow = this.rangeController.getRangeStartRow(lastRange).rowIndex;
            endRow = this.rangeController.getRangeEndRow(lastRange).rowIndex;
        }
        return {startRow, endRow}
    }

    public destroy() {
        super.destroy();
    }
}