// ag-grid-enterprise v21.2.2
import { Node } from "./node";
import { BBox } from "./bbox";
export declare class Group extends Node {
    static className: string;
    protected isContainerNode: boolean;
    isPointInNode(x: number, y: number): boolean;
    readonly getBBox: () => BBox;
    render(ctx: CanvasRenderingContext2D): void;
}
