import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class PaddingPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private chartPaddingGroup;
    private paddingTopSlider;
    private paddingRightSlider;
    private paddingBottomSlider;
    private paddingLeftSlider;
    private chartTranslator;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initGroup;
    private initChartPaddingItems;
}
