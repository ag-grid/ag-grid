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
    IRangeController,
    ChartRangeSelectionChanged,
    ColumnApi,
    GridApi
} from "@ag-community/grid-core";
import { ChartModel, ColState } from "./chartModel";
import { ChartPalette, palettes, ChartPaletteName } from "../../charts/chart/palettes";
import { ChartProxy } from "./chartProxies/chartProxy";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: IRangeController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private chartProxy: ChartProxy<any, any>;
    private chartPaletteName: ChartPaletteName;

    public constructor(private readonly model: ChartModel, paletteName: ChartPaletteName) {
        super();

        this.chartPaletteName = paletteName;
    }

    @PostConstruct
    private init(): void {
        this.updateForGridChange();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForRangeChange();
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

        this.model.updateCellRanges();

        this.setChartRange();
    }

    public updateForRangeChange() {
        this.updateForGridChange();

        this.raiseChartRangeSelectionChangedEvent();
    }

    public updateForPanelChange(updatedCol: ColState): void {
        this.model.updateCellRanges(updatedCol);

        this.setChartRange();

        this.raiseChartRangeSelectionChangedEvent();
    }

    public getChartType = (): ChartType => this.model.getChartType();
    public isPivotChart = () => this.model.isPivotChart();
    public getPaletteName = (): ChartPaletteName => this.chartPaletteName;
    public getPalettes = (): Map<ChartPaletteName, ChartPalette> => palettes;

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setChartPaletteName(palette: ChartPaletteName): void {
        this.chartPaletteName = palette;
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
        }

        this.raiseChartUpdatedEvent();
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
            chartPalette: this.chartPaletteName,
            chartOptions: this.getChartProxy().getChartOptions(),
        });

        this.eventService.dispatchEvent(event);
    }

    private raiseChartRangeSelectionChangedEvent() {
        const event: ChartRangeSelectionChanged = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            api: this.gridApi,
            columnApi: this.columnApi,
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
