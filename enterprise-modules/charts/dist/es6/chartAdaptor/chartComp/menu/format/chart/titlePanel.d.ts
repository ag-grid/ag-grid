import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export default class TitlePanel extends Component {
    static TEMPLATE: string;
    private chartTranslator;
    private eventService;
    private activePanels;
    private readonly chartController;
    private disabledTitle;
    constructor(chartController: ChartController);
    private init;
    private hasTitle;
    private initFontPanel;
    private destroyActivePanels;
    destroy(): void;
}
