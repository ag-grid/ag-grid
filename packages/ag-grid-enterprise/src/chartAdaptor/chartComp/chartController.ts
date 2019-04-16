import {AgEvent, Autowired, BeanStub, ChartType, Events, EventService, PostConstruct,} from "ag-grid-community";
import {RangeController} from "../../rangeController";
import {ChartModel, ColState} from "./chartModel";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: RangeController;

    private model: ChartModel;

    public constructor(chartModel: ChartModel) {
        super();
        this.model = chartModel;
    }

    @PostConstruct
    private init(): void {
        this.updateModel();

        this.setChartCellRangesInRangeController();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onGridColumnChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));
    }

    public updateForColumnSelection(updatedCol: ColState): void {
        this.model.updateColumnState(updatedCol);
        this.model.updateCellRanges(updatedCol);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private onGridColumnChange() {
        this.model.resetColumnState();
        this.updateModel();
    }

    private onColumnMoved() {
        const allColsFromRanges = this.model.getAllColumnsFromRanges();
        this.model.updateColumnStateFromRanges(allColsFromRanges);

        this.model.updateCellRanges();

        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private updateModel() {
        const allColsFromRanges = this.model.getAllColumnsFromRanges();
        this.model.updateColumnStateFromRanges(allColsFromRanges);

        const selectedDimension = this.model.getSelectedDimensionId();
        const selectedValueCols = this.model.getSelectedValueCols();
        const {startRow, endRow} = this.getRowIndexes();

        this.model.updateData(selectedDimension, selectedValueCols, startRow, endRow);

        this.raiseChartUpdatedEvent();
    }

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState()}
    }

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.model.getCellRanges());
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
        const lastRange = this.model.getLastRange();
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