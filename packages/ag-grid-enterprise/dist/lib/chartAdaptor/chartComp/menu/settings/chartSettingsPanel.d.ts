// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export declare class ChartSettingsPanel extends Component {
    static TEMPLATE: string;
    private gridOptionsWrapper;
    eMiniChartsContainer: HTMLElement;
    private eCardSelector;
    private ePrevBtn;
    private eNextBtn;
    private miniCharts;
    private cardItems;
    private readonly chartController;
    private activePalette;
    private palettes;
    private isAnimating;
    constructor(chartController: ChartController);
    private postConstruct;
    private addCardLink;
    private getPrev;
    private prev;
    private getNext;
    private next;
    private setActivePalette;
}
