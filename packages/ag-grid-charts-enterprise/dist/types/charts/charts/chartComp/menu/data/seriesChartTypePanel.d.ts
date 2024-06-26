import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartController } from '../../chartController';
import type { ColState } from '../../model/chartDataModel';
export declare class SeriesChartTypePanel extends Component {
    private readonly chartController;
    private columns;
    private isOpen?;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private seriesChartTypeGroupComp;
    private selectedColIds;
    private chartTypeComps;
    private secondaryAxisComps;
    constructor(chartController: ChartController, columns: ColState[], isOpen?: boolean | undefined);
    postConstruct(): void;
    refresh(columns: ColState[]): void;
    private recreate;
    private getValidColIds;
    private createSeriesChartTypeGroup;
    private refreshComps;
    private clearComps;
    private isSecondaryAxisDisabled;
    destroy(): void;
}
