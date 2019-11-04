import { Component } from "@ag-grid-community/grid-core";
import { ChartController } from "../../../chartController";
export declare class PaddingPanel extends Component {
    static TEMPLATE: string;
    private chartPaddingGroup;
    private paddingTopSlider;
    private paddingRightSlider;
    private paddingBottomSlider;
    private paddingLeftSlider;
    private chartTranslator;
    private chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initGroup;
    private initChartPaddingItems;
}
