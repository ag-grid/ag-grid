// ag-grid-enterprise v21.2.2
import { AgEvent, BeanStub, ChartType } from "ag-grid-community";
import { RangeController } from "../../rangeController";
import { ChartModel, ColState } from "./chartModel";
import { Palette } from "../../charts/chart/palettes";
import { ChartProxy } from "./chartProxies/chartProxy";
export interface ChartModelUpdatedEvent extends AgEvent {
}
export declare class ChartController extends BeanStub {
    static EVENT_CHART_MODEL_UPDATED: string;
    private eventService;
    rangeController: RangeController;
    private model;
    constructor(chartModel: ChartModel);
    private init;
    updateForGridChange(): void;
    updateForMenuChange(updatedCol: ColState): void;
    getChartType(): ChartType;
    isPivotChart(): boolean;
    getActivePalette(): number;
    getPalettes(): Palette[];
    setChartType(chartType: ChartType): void;
    setChartWithPalette(chartType: ChartType, palette: number): void;
    getColStateForMenu(): {
        dimensionCols: ColState[];
        valueCols: ColState[];
    };
    isDefaultCategorySelected(): boolean | "";
    setChartRange(): void;
    detachChartRange(): void;
    getChartProxy(): ChartProxy<any>;
    isActiveXYChart(): boolean | "";
    private raiseChartUpdatedEvent;
    destroy(): void;
}
