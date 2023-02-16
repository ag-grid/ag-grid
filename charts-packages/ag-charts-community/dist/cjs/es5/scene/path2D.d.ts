export declare class Path2D {
    private xy?;
    private previousCommands;
    private previousParams;
    private previousClosedPath;
    commands: string[];
    params: number[];
    isDirty(): boolean;
    draw(ctx: CanvasDrawPath & CanvasPath): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    arc(x: number, y: number, r: number, sAngle: number, eAngle: number, antiClockwise?: boolean): void;
    cubicCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number): void;
    private _closedPath;
    get closedPath(): boolean;
    closePath(): void;
    clear({ trackChanges }?: {
        trackChanges: boolean;
    }): void;
    isPointInPath(x: number, y: number): boolean;
}
