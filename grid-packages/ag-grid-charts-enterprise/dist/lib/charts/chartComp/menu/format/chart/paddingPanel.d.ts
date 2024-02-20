import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartController } from "../../../chartController";
export declare class PaddingPanel extends Component {
    private readonly chartOptionsService;
    private readonly chartController;
    static TEMPLATE: string;
    private chartPaddingGroup;
    private paddingTopSlider;
    private paddingRightSlider;
    private paddingBottomSlider;
    private paddingLeftSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, chartController: ChartController);
    private init;
    private initGroup;
    private initChartPaddingItems;
    private updateTopPadding;
}
