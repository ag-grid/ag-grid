import { Node } from "./node";
import { BBox } from "./bbox";
export declare class Group extends Node {
    static className: string;
    protected isContainerNode: boolean;
    protected _opacity: number;
    set opacity(value: number);
    get opacity(): number;
    containsPoint(x: number, y: number): boolean;
    computeBBox(): BBox;
    render(ctx: CanvasRenderingContext2D): void;
}
