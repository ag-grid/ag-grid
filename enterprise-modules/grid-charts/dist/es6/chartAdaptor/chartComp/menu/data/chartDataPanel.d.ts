import { Component } from "@ag-community/grid-core";
import { ChartController } from "../../chartController";
export declare class ChartDataPanel extends Component {
    static TEMPLATE: string;
    private chartTranslator;
    private categoriesGroupComp?;
    private seriesGroupComp?;
    private columnComps;
    private chartType?;
    private readonly chartController;
    constructor(chartController: ChartController);
    init(): void;
    destroy(): void;
    private addPanels;
    private addComponent;
    private addChangeListener;
    private createCategoriesGroupComponent;
    private createSeriesGroupComponent;
    private generateGetSeriesLabel;
    private getCategoryGroupTitle;
    private getSeriesGroupTitle;
    private clearComponents;
}
