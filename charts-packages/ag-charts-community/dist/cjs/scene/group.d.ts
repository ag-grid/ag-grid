import { Node } from "./node";
import { BBox } from "./bbox";
export declare class Group extends Node {
    static className: string;
    protected isContainerNode: boolean;
    containsPoint(x: number, y: number): boolean;
    computeBBox(): BBox;
    render(ctx: CanvasRenderingContext2D): void;
}
