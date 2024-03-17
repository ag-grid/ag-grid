import { Component } from "ag-grid-community";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
import { ChartController } from "../../../chartController";
export default class TitlePanel extends Component {
    private readonly chartMenuUtils;
    private readonly chartController;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    private readonly chartMenuService;
    private readonly chartOptions;
    private activePanels;
    private titlePlaceholder;
    constructor(chartMenuUtils: ChartMenuParamsFactory, chartController: ChartController);
    private init;
    private hasTitle;
    private initFontPanel;
    private createSpacingSlicer;
    private destroyActivePanels;
    protected destroy(): void;
}
