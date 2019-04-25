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

        this.updateForGridChange();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForGridChange.bind(this));
        // this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
    }

    public updateForGridChange(event?: AgEvent) {

        const movingCols = !!(event && event.type === Events.EVENT_COLUMN_MOVED);

        // update the model with changes to the cell ranges from the grid before updating the column state
        this.model.updateCellRanges(movingCols);
        this.model.resetColumnState();

        this.model.updateData();

        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartCellRangesInRangeController();

        this.raiseChartUpdatedEvent();
    }

    public updateForMenuChange(updatedCol: ColState): void {

        // update the column state before updating the cell ranges to be sent to the grid
        this.model.updateColumnState(updatedCol);
        this.model.updateCellRanges(false, updatedCol);
        this.model.updateData();

        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartCellRangesInRangeController();

        this.raiseChartUpdatedEvent();
    }

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
    }

    public getChartType(): ChartType {
        return this.model.getChartType();
    }

    public getPalette(): number {
        return this.model.getPalette();
    }

    public setChartWithPalette(chartType: ChartType, palette: number): void {
        this.model.setChartType(chartType);
        this.model.setPalette(palette);
        this.raiseChartUpdatedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState()}
    }

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.model.getCellRanges());
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartController.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    public destroy() {
        super.destroy();

        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    }
}