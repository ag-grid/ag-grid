// ag-grid-enterprise v20.2.0
export declare type BBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare function isPointInBBox(bbox: BBox, x: number, y: number): boolean;
export declare function renderBBox(ctx: CanvasRenderingContext2D, bbox: BBox): void;
