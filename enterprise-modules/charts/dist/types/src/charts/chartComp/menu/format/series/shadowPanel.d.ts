import { Component } from "@ag-grid-community/core";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class ShadowPanel extends Component {
    private readonly chartMenuUtils;
    private propertyKey;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    constructor(chartMenuUtils: ChartMenuParamsFactory, propertyKey?: string);
    private init;
    private getSliderParams;
}
