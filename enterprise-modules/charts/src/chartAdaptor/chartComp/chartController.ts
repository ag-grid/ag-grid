import {
    _,
    AgEvent,
    Autowired,
    BeanStub,
    CellRangeParams,
    ChartModel,
    ChartOptionsChanged,
    ChartRangeSelectionChanged,
    ChartType,
    ColumnApi,
    Events,
    EventService,
    GetChartImageDataUrlParams,
    GridApi,
    IRangeController,
    PostConstruct,
} from "@ag-grid-community/core";
import {ChartDataModel, ColState} from "./chartDataModel";
import {ChartPalette, ChartPaletteName, palettes} from "ag-charts-community";
import {ChartProxy} from "./chartProxies/chartProxy";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_UPDATED = 'chartUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: IRangeController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private chartProxy: ChartProxy<any, any>;
    private chartPaletteName: ChartPaletteName;

    public constructor(private readonly model: ChartDataModel, paletteName: ChartPaletteName = 'borneo') {
        super();

        this.chartPaletteName = paletteName;
    }

    @PostConstruct
    private init(): void {
        this.setChartRange();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForRangeChange();
            }
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForDataChange.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    }

    public updateForGridChange(): void {
        if (this.model.isDetached()) { return; }

        this.model.updateCellRanges();
        this.setChartRange();
    }

    public updateForDataChange(): void {
        if (this.model.isDetached()) { return; }

        this.model.updateData();
        this.raiseChartUpdatedEvent();
    }

    public updateForRangeChange(): void {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    }

    public updateForPanelChange(updatedCol: ColState): void {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    }

    public getChartModel(): ChartModel {
        return {
            chartId: this.model.getChartId(),
            chartType: this.model.getChartType(),
            chartPalette: this.getPaletteName(),
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.getCurrentCellRangeParams(),
            getChartImageDataURL: (params: GetChartImageDataUrlParams): string => {
                return this.chartProxy.getChartImageDataURL(params.type);
            }
        };
    }

    public getChartType(): ChartType {
        return this.model.getChartType();
    }

    public isPivotChart(): boolean {
        return this.model.isPivotChart();
    }

    public isGrouping(): boolean {
        return this.model.isGrouping();
    }

    public getPaletteName(): ChartPaletteName {
        return this.chartPaletteName;
    }

    public getPalettes(): Map<ChartPaletteName | undefined, ChartPalette> {
        const customPalette = this.chartProxy.getCustomPalette();

        if (customPalette) {
            const map = new Map<ChartPaletteName | undefined, ChartPalette>();

            map.set(undefined, customPalette);

            return map;
        }

        return palettes;
    }

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

    public isDefaultCategorySelected(): boolean {
        return this.model.getSelectedDimension().colId === ChartDataModel.DEFAULT_CATEGORY;
    }

    public setChartRange(silent = false): void {
        if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isDetached()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }

        if (!silent) {
            this.raiseChartUpdatedEvent();
        }
    }

    public detachChartRange(): void {
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

    public setChartProxy(chartProxy: ChartProxy<any, any>): void {
        this.chartProxy = chartProxy;
    }

    public getChartProxy(): ChartProxy<any, any> {
        return this.chartProxy;
    }

    public isActiveXYChart(): boolean {
        return _.includes([ChartType.Scatter, ChartType.Bubble], this.getChartType());
    }

    private getCurrentCellRangeParams(): CellRangeParams {
        const cellRanges = this.model.getCellRanges();
        const firstCellRange = cellRanges[0];

        return {
            rowStartIndex: firstCellRange.startRow && firstCellRange.startRow.rowIndex,
            rowStartPinned: firstCellRange.startRow && firstCellRange.startRow.rowPinned,
            rowEndIndex: firstCellRange.endRow && firstCellRange.endRow.rowIndex,
            rowEndPinned: firstCellRange.endRow && firstCellRange.endRow.rowPinned,
            columns: cellRanges.reduce((columns, value) => columns.concat(value.columns.map(c => c.getId())), [])
        };
    }

    private raiseChartUpdatedEvent(): void {
        const event: ChartModelUpdatedEvent = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
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

    private raiseChartRangeSelectionChangedEvent(): void {
        const event: ChartRangeSelectionChanged = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            cellRange: this.getCurrentCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        super.destroy();

        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    }
}
