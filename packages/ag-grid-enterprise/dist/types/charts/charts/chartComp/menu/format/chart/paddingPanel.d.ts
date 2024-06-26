import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartController } from '../../../chartController';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class PaddingPanel extends Component {
    private readonly chartMenuUtils;
    private readonly chartController;
    private readonly paddingTopSlider;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuUtils: ChartMenuParamsFactory, chartController: ChartController);
    postConstruct(): void;
    private updateTopPadding;
}
