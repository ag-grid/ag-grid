import { Component } from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
import { Group } from "../../../../../charts/scene/group";
import { Scene } from "../../../../../charts/scene/scene";
export declare abstract class MiniChart extends Component {
    protected tooltipName: string;
    protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root: Group;
    protected readonly scene: Scene;
    constructor(parent: HTMLElement, tooltipName: string);
    protected init(): void;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
