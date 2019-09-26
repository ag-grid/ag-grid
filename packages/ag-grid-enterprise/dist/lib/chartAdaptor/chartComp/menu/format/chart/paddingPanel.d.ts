// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
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
