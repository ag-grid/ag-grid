import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export declare class ChartSettingsPanel extends Component {
    private readonly chartController;
    static TEMPLATE: string;
    private readonly eMiniChartsContainer;
    private readonly eNavBar;
    private readonly eCardSelector;
    private readonly ePrevBtn;
    private readonly eNextBtn;
    private miniChartsContainers;
    private cardItems;
    private activePaletteIndex;
    private palettes;
    private themes;
    private isAnimating;
    constructor(chartController: ChartController);
    private postConstruct;
    private scrollSelectedIntoView;
    private resetPalettes;
    private addCardLink;
    private getPrev;
    private getNext;
    private setActivePalette;
    private destroyMiniCharts;
    protected destroy(): void;
}
