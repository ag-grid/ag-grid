import {
    _,
    AgEvent,
    Autowired,
    BeanStub,
    ChartModel,
    ChartRangeSelectionChanged,
    ChartType,
    ColumnApi,
    Events,
    GridApi,
    IRangeController,
    PostConstruct,
    GetChartImageDataUrlParams,
} from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { getChartTheme, ChartTheme } from "ag-charts-community";
import { ChartProxy } from "./chartProxies/chartProxy";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {

    public static EVENT_CHART_UPDATED = 'chartUpdated';

    @Autowired('rangeController') rangeController: IRangeController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private chartProxy: ChartProxy<any, any>;

    public constructor(private readonly model: ChartDataModel) {
        super();
    }

    @PostConstruct
    private init(): void {
        this.setChartRange();

        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForRangeChange();
            }
        });

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForDataChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
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
            chartThemeIndex: this.getThemeIndex(),
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.model.getCellRangeParams(),
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

    public getThemeIndex(): number {
        return this.model.getChartThemeIndex();
    }

    // public getThemes(): AgChartThemePalette[] {
    //     const customPalette = this.chartProxy.getCustomPalette();

    //     if (customPalette) {
    //         const map = new Map<number | undefined, AgChartThemePalette>();

    //         map.set(undefined, customPalette);

    //         return map;
    //     }

    //     return [];
    //     // const map = new Map<number | undefined, AgChartThemePalette>();
    //     // const themes = this.getThemes();
    //     // const names = ['borneo', 'material', 'pastel', 'bright', 'flat']
    //     // themes.forEach((theme, index) => {
    //     //     map.set(names[index % names.length], theme.palette);
    //     // });
    //     // return map;
    // }

    private stockThemes: ChartTheme[] = [
        'default',
        'dark',
        'material',
        'material-dark',
        'pastel',
        'pastel-dark',
        'solar',
        'solar-dark',
        'vivid',
        'vivid-dark'
    ].map(name => getChartTheme(name));

    public getThemes(): ChartTheme[] {
        return this.stockThemes;
    }

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setChartThemeIndex(chartThemeIndex: number): void {
        this.model.setChartThemeIndex(chartThemeIndex);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[]; valueCols: ColState[]; } {
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

    private raiseChartUpdatedEvent(): void {
        const event: ChartModelUpdatedEvent = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });

        this.dispatchEvent(event);
    }

    private raiseChartOptionsChangedEvent(): void {
        this.chartProxy.raiseChartOptionsChangedEvent();
    }

    private raiseChartRangeSelectionChangedEvent(): void {
        const event: ChartRangeSelectionChanged = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            chartId: this.model.getChartId(),
            cellRange: this.model.getCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    protected destroy(): void {
        super.destroy();

        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    }
}