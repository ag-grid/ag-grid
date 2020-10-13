import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class PaddingPanel extends Component {
    static TEMPLATE: string;
    private chartPaddingGroup;
    private paddingTopSlider;
    private paddingRightSlider;
    private paddingBottomSlider;
    private paddingLeftSlider;
    private chartTranslator;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initGroup;
    private initChartPaddingItems;
}
