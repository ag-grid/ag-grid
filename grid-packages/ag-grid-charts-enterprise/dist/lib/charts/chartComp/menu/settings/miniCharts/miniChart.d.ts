import { Component } from "ag-grid-community";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { _Scene } from "ag-charts-community";
export declare abstract class MiniChart extends Component {
    protected chartTranslationService: ChartTranslationService;
    protected tooltipName: string;
    protected readonly size: number;
    protected readonly padding: number;
    protected readonly root: _Scene.Group;
    protected readonly scene: _Scene.Scene;
    constructor(container: HTMLElement, tooltipName: string);
    protected init(): void;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
