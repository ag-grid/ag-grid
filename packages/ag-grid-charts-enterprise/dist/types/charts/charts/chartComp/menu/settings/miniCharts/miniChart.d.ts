import { Component } from "ag-grid-community";
import { ChartTranslationKey, ChartTranslationService } from "../../../services/chartTranslationService";
import { _Scene } from "ag-charts-community";
export declare abstract class MiniChart extends Component {
    protected tooltipName: ChartTranslationKey;
    protected chartTranslationService: ChartTranslationService;
    protected readonly size: number;
    protected readonly padding: number;
    protected readonly root: _Scene.Group;
    protected readonly scene: _Scene.Scene;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    protected init(): void;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
