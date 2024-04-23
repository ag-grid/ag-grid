import { Component } from "@ag-grid-community/core";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class CalloutPanel extends Component {
    private readonly chartMenuUtils;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    private init;
}
