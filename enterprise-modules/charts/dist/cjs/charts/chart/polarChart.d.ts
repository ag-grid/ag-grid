import { Chart } from "./chart";
import { Node } from "../scene/node";
export declare class PolarChart extends Chart {
    static className: string;
    constructor(document?: Document);
    readonly seriesRoot: Node;
    performLayout(): void;
}
