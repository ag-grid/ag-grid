import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
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
