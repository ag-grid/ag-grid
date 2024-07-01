import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class ShadowPanel extends Component {
    private readonly chartMenuUtils;
    private propertyKey;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuUtils: ChartMenuParamsFactory, propertyKey?: string);
    postConstruct(): void;
    private getSliderParams;
}
