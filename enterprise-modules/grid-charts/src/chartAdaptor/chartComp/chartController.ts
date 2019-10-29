import {
    AgEvent,
    Autowired,
    BeanStub,
    ChartType,
    Events,
    EventService,
    ChartOptionsChanged,
    PostConstruct,
    _,
    IRangeController
} from "@ag-community/grid-core";
import { ChartModel, ColState } from "./chartModel";
import { Palette, palettes, DefaultPalette } from "../../charts/chart/palettes";
import { ChartProxy } from "./chartProxies/chartProxy";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: IRangeController;

    private chartProxy: ChartProxy<any, any>;
    private defaultPalette: DefaultPalette;

    public constructor(private readonly model: ChartModel, palette: DefaultPalette) {
        super();

        this.defaultPalette = palette;
    }

    @PostConstruct
    private init(): void {
        this.updateForGridChange();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForGridChange();
            }
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForGridChange.bind(this));
    }

    public updateForGridChange() {
        // don't update chart if chart is detached from grid data
        if (this.model.isDetached()) { return; }

        // update the model with changes to the cell ranges from the grid before updating the column state
        this.model.updateCellRanges();
        this.model.resetColumnState();
        this.model.updateData();

        this.setChartRange();
    }

    public updateForMenuChange(updatedCol: ColState): void {
        // update the column state before updating the cell ranges to be sent to the grid
        this.model.updateColumnState(updatedCol);
        this.model.updateCellRanges(updatedCol);
        this.model.updateData();

        this.setChartRange();
    }

    public getChartType = (): ChartType => this.model.getChartType();
    public isPivotChart = () => this.model.isPivotChart();
    public getActivePalette = (): DefaultPalette => this.defaultPalette;
    public getPalettes = (): Map<DefaultPalette, Palette> => palettes;

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setPalette(palette: DefaultPalette): void {
        this.defaultPalette = palette;
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
    }

    public isDefaultCategorySelected() {
        const selectedDimension = this.model.getSelectedDimension().colId;
        return selectedDimension && selectedDimension === ChartModel.DEFAULT_CATEGORY;
    }

    public setChartRange() {
        if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
            this.raiseChartUpdatedEvent();
        }
    }

    public detachChartRange() {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleDetached();

        if (this.model.isDetached()) {
            // remove range from grid
            if (this.rangeController) {
                this.rangeController.setCellRanges([]);
            }
        } else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    }

    public setChartProxy(chartProxy: ChartProxy<any, any>) {
        this.chartProxy = chartProxy;
    }

    public getChartProxy(): ChartProxy<any, any> {
        return this.chartProxy;
    }

    public isActiveXYChart() {
        return _.includes([ChartType.Scatter, ChartType.Bubble], this.getChartType());
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = Object.freeze({
            type: ChartController.EVENT_CHART_MODEL_UPDATED
        });

        this.dispatchEvent(event);
    }

    private raiseChartOptionsChangedEvent(): void {
        const event: ChartOptionsChanged = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.getChartType(),
            palette: this.defaultPalette,
            chartOptions: this.getChartProxy().getChartOptions(),
        });

        this.eventService.dispatchEvent(event);
    }


    public destroy() {
        super.destroy();

        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    }
}
