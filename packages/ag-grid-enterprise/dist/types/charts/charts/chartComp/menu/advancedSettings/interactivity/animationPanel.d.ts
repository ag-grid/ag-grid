import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class AnimationPanel extends Component {
    private readonly chartMenuParamsFactory;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuParamsFactory: ChartMenuParamsFactory);
    postConstruct(): void;
}
