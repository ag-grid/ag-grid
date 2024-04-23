import { Component } from "ag-grid-community";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class AnimationPanel extends Component {
    private readonly chartMenuParamsFactory;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    constructor(chartMenuParamsFactory: ChartMenuParamsFactory);
    private init;
}
