import { Node } from "./node";
export declare class Group extends Node {
    isPointInNode(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
