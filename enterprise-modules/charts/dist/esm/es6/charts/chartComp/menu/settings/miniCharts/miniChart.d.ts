import { Component } from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { _Scene } from "ag-charts-community";
export declare abstract class MiniChart extends Component {
    protected chartTranslationService: ChartTranslationService;
    protected tooltipName: string;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root: _Scene.Group;
    protected readonly scene: _Scene.Scene;
    constructor(container: HTMLElement, tooltipName: string);
    protected init(): void;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
