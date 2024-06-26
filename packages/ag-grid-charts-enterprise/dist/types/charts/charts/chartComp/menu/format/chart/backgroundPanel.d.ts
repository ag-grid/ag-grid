import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class BackgroundPanel extends Component {
    private readonly chartMenuUtils;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    postConstruct(): void;
}
