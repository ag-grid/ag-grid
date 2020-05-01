import { Chart } from "./chart";
import { Node } from "../scene/node";
import { Padding } from "../util/padding";
export declare class PolarChart extends Chart {
    static className: string;
    static type: string;
    padding: Padding;
    constructor(document?: Document);
    readonly seriesRoot: Node;
    performLayout(): void;
}
