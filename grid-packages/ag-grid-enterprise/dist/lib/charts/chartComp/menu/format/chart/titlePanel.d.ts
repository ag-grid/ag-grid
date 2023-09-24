import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export default class TitlePanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private chartTranslationService;
    private activePanels;
    private titlePlaceholder;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private hasTitle;
    private initFontPanel;
    private createSpacingSlicer;
    private toolbarExists;
    private getOption;
    private setOption;
    private destroyActivePanels;
    protected destroy(): void;
}
