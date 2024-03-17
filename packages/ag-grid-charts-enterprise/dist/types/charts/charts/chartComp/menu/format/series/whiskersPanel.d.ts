import { Component } from "ag-grid-community";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class WhiskersPanel extends Component {
    private readonly chartMenuUtils;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    private init;
}
