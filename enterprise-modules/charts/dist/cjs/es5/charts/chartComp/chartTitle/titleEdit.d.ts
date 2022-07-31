import { Component } from "@ag-grid-community/core";
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
    constructor(chartMenu: ChartMenu);
    init(): void;
    refreshTitle(chartController: ChartController, chartOptionsService: ChartOptionsService): void;
    private startEditing;
    private endEditing;
}
