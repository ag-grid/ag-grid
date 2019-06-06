// ag-grid-enterprise v21.0.1
import { Component } from "ag-grid-community";
import { ChartController } from "../chartController";
export declare class ChartSettingsPanel extends Component {
    static TEMPLATE: string;
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
    private init;
    private addCardLink;
    private getPrev;
    private prev;
    private getNext;
    private next;
    private setActivePalette;
}
