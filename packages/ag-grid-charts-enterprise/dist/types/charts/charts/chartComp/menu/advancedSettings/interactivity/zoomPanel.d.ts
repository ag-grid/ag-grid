import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class ZoomPanel extends Component {
    private readonly chartMenuParamsFactory;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly zoomScrollingStepInput;
    constructor(chartMenuParamsFactory: ChartMenuParamsFactory);
    postConstruct(): void;
}
