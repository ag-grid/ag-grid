import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
export declare class ChartSettingsPanel extends Component {
    static TEMPLATE: string;
    private gridOptionsWrapper;
    eMiniChartsContainer: HTMLElement;
    private eNavBar;
    private eCardSelector;
    private ePrevBtn;
    private eNextBtn;
    private miniCharts;
    private cardItems;
    private readonly chartController;
    private activePalette?;
    private palettes;
    private paletteNames;
    private isAnimating;
    constructor(chartController: ChartController);
    private postConstruct;
    private resetPalettes;
    private addCardLink;
    private getPrev;
    private prev;
    private getNext;
    private next;
    private setActivePalette;
    private destroyMiniCharts;
    protected destroy(): void;
}
