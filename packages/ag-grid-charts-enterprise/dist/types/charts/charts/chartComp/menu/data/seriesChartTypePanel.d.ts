import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
export declare class SeriesChartTypePanel extends Component {
    private readonly chartController;
    private columns;
    private isOpen?;
    private static TEMPLATE;
    private readonly chartTranslationService;
    private seriesChartTypeGroupComp;
    private selectedColIds;
    private chartTypeComps;
    private secondaryAxisComps;
    constructor(chartController: ChartController, columns: ColState[], isOpen?: boolean | undefined);
    private init;
    refresh(columns: ColState[]): void;
    private recreate;
    private getValidColIds;
    private createSeriesChartTypeGroup;
    private refreshComps;
    private clearComps;
    private isSecondaryAxisDisabled;
    protected destroy(): void;
}
