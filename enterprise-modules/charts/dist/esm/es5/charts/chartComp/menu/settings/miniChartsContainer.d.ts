import { Component, PartialChartGroupsDef } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
export declare class MiniChartsContainer extends Component {
    static TEMPLATE: string;
    private readonly fills;
    private readonly strokes;
    private wrappers;
    private chartController;
    private chartGroups;
    private chartTranslationService;
    constructor(chartController: ChartController, fills: string[], strokes: string[], chartGroups?: PartialChartGroupsDef);
    private init;
    updateSelectedMiniChart(): void;
}
