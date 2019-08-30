import {AgEvent, Autowired, BeanStub, ChartType, Events, EventService, PostConstruct,} from "ag-grid-community";
import {RangeController} from "../../rangeController";
import {ChartModel, ColState} from "./chartModel";
import {Palette} from "../../charts/chart/palettes";
import {ChartProxy} from "./chartProxies/chartProxy";

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

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, (event) => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForGridChange();
            }
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
    }

    public updateForGridChange() {
        // don't update chart if chart is detached from grid data
        if (this.model.isDetached()) { return; }

        // update the model with changes to the cell ranges from the grid before updating the column state
        this.model.updateCellRanges();
        this.model.resetColumnState();

        this.model.updateData();

        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartRange();

        this.raiseChartUpdatedEvent();
    }

    public updateForMenuChange(updatedCol: ColState): void {

        // update the column state before updating the cell ranges to be sent to the grid
        this.model.updateColumnState(updatedCol);
        this.model.updateCellRanges(updatedCol);
        this.model.updateData();

        // updates ranges with raising a new EVENT_CHART_RANGE_SELECTION_CHANGED
        this.setChartRange();

        this.raiseChartUpdatedEvent();
    }

    public getChartType(): ChartType {
        return this.model.getChartType();
    }

    public isPivotChart() {
        return this.model.isPivotChart();
    }

    public getActivePalette(): number {
        return this.model.getActivePalette();
    }

    public getPalettes(): Palette[] {
        return this.model.getPalettes();
    }

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
    }

    public setChartWithPalette(chartType: ChartType, palette: number): void {
        this.model.setChartType(chartType);
        this.model.setActivePalette(palette);
        this.raiseChartUpdatedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState()};
    }

    public isDefaultCategorySelected() {
        const selectedDimension = this.model.getSelectedDimension().colId;
        return selectedDimension && selectedDimension === ChartModel.DEFAULT_CATEGORY;
    }

    public setChartRange() {
        if (!this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }
    }

    public detachChartRange() {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleDetached();

        if (this.model.isDetached()) {
            // remove range from grid
            this.rangeController.setCellRanges([]);
        } else {
            // update grid with chart range
            this.setChartRange();

            // update chart data may have changed
            this.updateForGridChange();
        }
    }

    public getChartProxy(): ChartProxy<any> {
        return this.model.getChartProxy();
    }

    public isActiveXYChart() {
        const xyChartSelected = [ChartType.Scatter, ChartType.Bubble].indexOf(this.getChartType()) > -1;
        // x y charts behave like regular cartesian charts if the default category is not selected, i.e. (None)
        return xyChartSelected && this.isDefaultCategorySelected();
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
