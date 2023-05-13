import { Component } from "ag-grid-community";
import { ChartMenu } from "../menu/chartMenu";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";
export declare class TitleEdit extends Component {
    private readonly chartMenu;
    private static TEMPLATE;
    private chartTranslationService;
    private destroyableChartListeners;
    private chartController;
    private chartOptionsService;
    private editing;
    constructor(chartMenu: ChartMenu);
    init(): void;
    refreshTitle(chartController: ChartController, chartOptionsService: ChartOptionsService): void;
    private startEditing;
    private updateHeight;
    private getLineHeight;
    private handleEndEditing;
    private endEditing;
}
