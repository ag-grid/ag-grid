import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class PaddingPanel extends Component {
    private readonly chartMenuUtils;
    private readonly chartController;
    static TEMPLATE: string;
    private paddingTopSlider;
    private readonly chartTranslationService;
    constructor(chartMenuUtils: ChartMenuParamsFactory, chartController: ChartController);
    private init;
    private updateTopPadding;
}
