// ag-grid-enterprise v21.2.2
import { ChartType, Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ChartTranslator } from "../../chartTranslator";
import { Group } from "../../../../charts/scene/group";
import { Scene } from "../../../../charts/scene/scene";
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
