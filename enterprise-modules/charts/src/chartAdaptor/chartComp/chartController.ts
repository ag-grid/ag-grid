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
import { ChartPalette, ChartPaletteName, palettes } from "ag-charts-community";
import { ChartProxy } from "./chartProxies/chartProxy";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {

    public static EVENT_CHART_UPDATED = 'chartUpdated';

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
            chartPalette: this.getPaletteName(),
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

// import {
//     _,
//     AgEvent,
//     Autowired,
//     BeanStub,
//     ChartModel,
//     ChartRangeSelectionChanged,
//     ChartType,
//     ColumnApi,
//     Events,
//     GridApi,
//     IRangeController,
//     PostConstruct,
//     GetChartImageDataUrlParams, ChartOptions,
// } from "@ag-grid-community/core";
// import { ChartDataModel, ColState } from "./chartDataModel";
// import { ChartProxy } from "./chartProxies/chartProxy";
//
// export interface ChartModelUpdatedEvent extends AgEvent {
// }
//
// export class ChartController extends BeanStub {
//
//     public static EVENT_CHART_UPDATED = 'chartUpdated';
//
//     @Autowired('rangeController') rangeController: IRangeController;
//     @Autowired('gridApi') private gridApi: GridApi;
//     @Autowired('columnApi') private columnApi: ColumnApi;
//
//     private chartProxy: ChartProxy;
//     private chartThemeName: string;
//
//     private static lightThemes: string[] = ['light', 'material-light', 'pastel-light', 'solar-light', 'vivid-light'];
//     private static darkThemes: string[] = ['dark', 'material-dark', 'pastel-dark', 'solar-dark', 'vivid-dark'];
//     private static themes: string[] = ChartController.lightThemes;
//
//     public constructor(private readonly model: ChartDataModel, themeName: string = 'light') {
//         super();
//
//         this.chartThemeName = themeName;
//     }
//
//     @PostConstruct
//     private init(): void {
//         this.setChartRange();
//
//         this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
//             if (event.id && event.id === this.model.getChartId()) {
//                 this.updateForRangeChange();
//             }
//         });
//
//         this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
//         this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
//         this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
//
//         this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForDataChange.bind(this));
//         this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
//     }
//
//     public updateForGridChange(): void {
//         if (this.model.isDetached()) { return; }
//
//         this.model.updateCellRanges();
//         this.setChartRange();
//     }
//
//     public updateForDataChange(): void {
//         if (this.model.isDetached()) { return; }
//
//         this.model.updateData();
//         this.raiseChartUpdatedEvent();
//     }
//
//     public updateForRangeChange(): void {
//         this.updateForGridChange();
//         this.raiseChartRangeSelectionChangedEvent();
//     }
//
//     public updateForPanelChange(updatedCol: ColState): void {
//         this.model.updateCellRanges(updatedCol);
//         this.setChartRange();
//         this.raiseChartRangeSelectionChangedEvent();
//     }
//
//     public getChartModel(): ChartModel {
//         return {
//             chartId: this.model.getChartId(),
//             chartType: this.model.getChartType(),
//             chartTheme: this.getThemeName(),
//             chartOptions: this.chartProxy.getChartOptions() as ChartOptions<any>, // TODO: remove this cast
//             cellRange: this.model.getCellRangeParams(),
//             getChartImageDataURL: (params: GetChartImageDataUrlParams): string => {
//                 return this.chartProxy.getChartImageDataURL(params.type);
//             }
//         };
//     }
//
//     public getChartType(): ChartType {
//         return this.model.getChartType();
//     }
//
//     public isPivotChart(): boolean {
//         return this.model.isPivotChart();
//     }
//
//     public isGrouping(): boolean {
//         return this.model.isGrouping();
//     }
//
//     public getThemeName(): string {
//         return this.chartThemeName;
//     }
//
//     public getThemes(): string[] {
//         // const customTheme = this.chartProxy.getCustomPalette();
//
//         // if (customTheme) {
//         //     return [customTheme];
//         // }
//
//         return ChartController.themes;
//     }
//
//     // public getPalettes(): Map<ChartPaletteName | undefined, ChartPalette> {
//     //     const customPalette = this.chartProxy.getCustomPalette();
//     //
//     //     if (customPalette) {
//     //         const map = new Map<ChartPaletteName | undefined, ChartPalette>();
//     //
//     //         map.set(undefined, customPalette);
//     //
//     //         return map;
//     //     }
//     //
//     //     return palettes;
//     // }
//
//     public setChartType(chartType: ChartType): void {
//         this.model.setChartType(chartType);
//         this.raiseChartUpdatedEvent();
//         this.raiseChartOptionsChangedEvent();
//     }
//
//     public setChartThemeName(theme: string): void {
//         this.chartThemeName = theme;
//         this.raiseChartUpdatedEvent();
//         this.raiseChartOptionsChangedEvent();
//     }
//
//     public getColStateForMenu(): { dimensionCols: ColState[]; valueCols: ColState[]; } {
//         return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
//     }
//
//     public isDefaultCategorySelected(): boolean {
//         return this.model.getSelectedDimension().colId === ChartDataModel.DEFAULT_CATEGORY;
//     }
//
//     public setChartRange(silent = false): void {
//         if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isDetached()) {
//             this.rangeController.setCellRanges(this.model.getCellRanges());
//         }
//
//         if (!silent) {
//             this.raiseChartUpdatedEvent();
//         }
//     }
//
//     public detachChartRange(): void {
//         // when chart is detached it won't listen to changes from the grid
//         this.model.toggleDetached();
//
//         if (this.model.isDetached()) {
//             // remove range from grid
//             if (this.rangeController) {
//                 this.rangeController.setCellRanges([]);
//             }
//         } else {
//             // update chart data may have changed
//             this.updateForGridChange();
//         }
//     }
//
//     public setChartProxy(chartProxy: ChartProxy): void {
//         this.chartProxy = chartProxy;
//     }
//
//     public getChartProxy(): ChartProxy {
//         return this.chartProxy;
//     }
//
//     public isActiveXYChart(): boolean {
//         return _.includes([ChartType.Scatter, ChartType.Bubble], this.getChartType());
//     }
//
//     private raiseChartUpdatedEvent(): void {
//         const event: ChartModelUpdatedEvent = Object.freeze({
//             type: ChartController.EVENT_CHART_UPDATED
//         });
//
//         this.dispatchEvent(event);
//     }
//
//     private raiseChartOptionsChangedEvent(): void {
//         this.chartProxy.raiseChartOptionsChangedEvent();
//     }
//
//     private raiseChartRangeSelectionChangedEvent(): void {
//         const event: ChartRangeSelectionChanged = Object.freeze({
//             type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
//             id: this.model.getChartId(),
//             chartId: this.model.getChartId(),
//             cellRange: this.model.getCellRangeParams(),
//             api: this.gridApi,
//             columnApi: this.columnApi,
//         });
//
//         this.eventService.dispatchEvent(event);
//     }
//
//     protected destroy(): void {
//         super.destroy();
//
//         if (this.rangeController) {
//             this.rangeController.setCellRanges([]);
//         }
//     }
// }
