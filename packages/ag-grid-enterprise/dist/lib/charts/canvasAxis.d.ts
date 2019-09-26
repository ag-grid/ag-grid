// ag-grid-enterprise v21.2.2
import Scale from "./scale/scale";
export declare class CanvasAxis<D> {
    constructor(scale: Scale<D, number>);
    scale: Scale<D, number>;
    translation: [number, number];
    rotation: number;
    lineWidth: number;
    tickWidth: number;
    tickSize: number;
    tickPadding: number;
    lineColor: string;
    tickColor: string;
    labelFont: string;
    labelColor: string;
    flippedLabels: boolean;
    mirroredLabels: boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
