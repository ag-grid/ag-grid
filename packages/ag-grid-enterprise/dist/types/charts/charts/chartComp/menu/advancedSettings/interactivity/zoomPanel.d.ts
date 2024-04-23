import { Component } from 'ag-grid-community';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class ZoomPanel extends Component {
    private readonly chartMenuParamsFactory;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    private readonly zoomScrollingStepInput;
    constructor(chartMenuParamsFactory: ChartMenuParamsFactory);
    private init;
}
