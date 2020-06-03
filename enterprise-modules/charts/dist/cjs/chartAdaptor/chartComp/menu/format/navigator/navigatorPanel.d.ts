import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class NavigatorPanel extends Component {
    static TEMPLATE: string;
    private navigatorGroup;
    private navigatorHeightSlider;
    private chartTranslator;
    private readonly chartController;
    private activePanels;
    constructor(chartController: ChartController);
    private init;
    private initNavigator;
    private destroyActivePanels;
    private getChartProxy;
    protected destroy(): void;
}
