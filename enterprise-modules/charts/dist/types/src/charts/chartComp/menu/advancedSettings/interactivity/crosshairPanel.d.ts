import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class CrosshairPanel extends Component {
    private readonly chartMenuParamsFactory;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuParamsFactory: ChartMenuParamsFactory);
    postConstruct(): void;
}
