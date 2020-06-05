import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export default class TitlePanel extends Component {
    static TEMPLATE: string;
    private chartTranslator;
    private activePanels;
    private readonly chartController;
    private disabledTitle;
    constructor(chartController: ChartController);
    private init;
    private hasTitle;
    private initFontPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
