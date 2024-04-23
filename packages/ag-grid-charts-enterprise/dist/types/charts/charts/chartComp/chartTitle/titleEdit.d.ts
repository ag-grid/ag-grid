import { Component } from "ag-grid-community";
import { ChartMenu } from "../menu/chartMenu";
import { ChartMenuContext } from "../menu/chartMenuContext";
export declare class TitleEdit extends Component {
    private readonly chartMenu;
    private static TEMPLATE;
    private chartTranslationService;
    private chartMenuService;
    private destroyableChartListeners;
    private chartController;
    private chartOptionsService;
    private chartMenuUtils;
    private editing;
    constructor(chartMenu: ChartMenu);
    init(): void;
    refreshTitle(chartMenuContext: ChartMenuContext): void;
    private startEditing;
    private updateHeight;
    private getLineHeight;
    private handleEndEditing;
    private endEditing;
}
