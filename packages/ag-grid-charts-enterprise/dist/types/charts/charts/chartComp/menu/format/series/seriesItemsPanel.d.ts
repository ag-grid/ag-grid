import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class SeriesItemsPanel extends Component {
    private readonly chartMenuUtils;
    private readonly seriesItemsGroup;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private activePanels;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    postConstruct(): void;
    private getSeriesItemsParams;
    private initSeriesControls;
    private initSlider;
    private initItemLabels;
    private destroyActivePanels;
    destroy(): void;
}
