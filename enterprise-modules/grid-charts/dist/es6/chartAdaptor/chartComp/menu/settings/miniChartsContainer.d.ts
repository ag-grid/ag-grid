import { Component } from "@ag-community/grid-core";
import { ChartController } from "../../chartController";
export declare class MiniChartsContainer extends Component {
    static TEMPLATE: string;
    private readonly fills;
    private readonly strokes;
    private wrappers;
    private chartController;
    private chartTranslator;
    constructor(activePalette: number, chartController: ChartController);
    private init;
    refreshSelected(): void;
}
