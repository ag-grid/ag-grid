// ag-grid-enterprise v21.0.1
import { Component } from "ag-grid-community";
import { ChartController } from "../chartController";
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
import { Group } from "../../../charts/scene/group";
import { Scene } from "../../../charts/scene/scene";
export declare abstract class MiniChart {
    protected readonly size = 80;
    protected readonly padding = 5;
    protected readonly root: Group;
    protected readonly scene: Scene;
    readonly element: HTMLElement;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
export declare class MiniPie extends MiniChart {
    static readonly angles: number[][];
    private readonly radius;
    private readonly center;
    private readonly sectors;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
export declare class MiniDonut extends MiniChart {
    private readonly radius;
    private readonly center;
    private readonly sectors;
    constructor(parent: HTMLElement, fills: string[], strokes: string[]);
    updateColors(fills: string[], strokes: string[]): void;
}
