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
    /**
     * Approximates an elliptical arc with up to four cubic Bézier curves.
     * @param commands The string array to write SVG command letters to.
     * @param params The number array to write SVG command parameters (cubic control points) to.
     * @param cx The x-axis coordinate for the ellipse's center.
     * @param cy The y-axis coordinate for the ellipse's center.
     * @param rx The ellipse's major-axis radius.
     * @param ry The ellipse's minor-axis radius.
     * @param phi The rotation for this ellipse, expressed in radians.
     * @param theta1 The starting angle, measured clockwise from the positive x-axis and expressed in radians.
     * @param theta2 The ending angle, measured clockwise from the positive x-axis and expressed in radians.
     * @param anticlockwise The arc control points are always placed clockwise from `theta1` to `theta2`,
     * even when `theta1 > theta2`, unless this flag is set to `1`.
     */
    static cubicArc(commands: string[], params: number[], cx: number, cy: number, rx: number, ry: number, phi: number, theta1: number, theta2: number, anticlockwise: number): void;
    cubicArc(cx: number, cy: number, rx: number, ry: number, phi: number, theta1: number, theta2: number, anticlockwise: number): void;
    cubicCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number): void;
    private _closedPath;
    get closedPath(): boolean;
    closePath(): void;
    clear({ trackChanges }?: {
        trackChanges: boolean;
    }): void;
    isPointInPath(x: number, y: number): boolean;
}
