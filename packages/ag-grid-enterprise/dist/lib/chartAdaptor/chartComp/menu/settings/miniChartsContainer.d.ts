// ag-grid-enterprise v21.1.0
import { ChartType, Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export declare class MiniChartsContainer extends Component {
    static TEMPLATE: string;
    private readonly fills;
    private readonly strokes;
    private wrappers;
    private chartController;
    constructor(activePalette: number, chartController: ChartController);
    private init;
    refreshSelected(): void;
}
import { Group } from "../../../../charts/scene/group";
import { Scene } from "../../../../charts/scene/scene";
import { ChartTranslator } from "../../chartTranslator";
export declare abstract class MiniChart extends Component {
    protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root: Group;
    protected readonly scene: Scene;
    readonly element: HTMLElement;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
export declare class MiniPie extends MiniChart {
    static chartType: ChartType;
    static readonly angles: number[][];
    private readonly radius;
    private readonly center;
    private readonly sectors;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    private init;
    updateColors(fills: string[], strokes: string[]): void;
}
