// ag-grid-enterprise v21.2.2
export declare class Path2D {
    private xy?;
    readonly commands: string[];
    readonly params: number[];
    private static splitCommandsRe;
    private static matchParamsRe;
    private static quadraticCommandRe;
    private static cubicCommandRe;
    private static xmlDeclaration;
    private static xmlns;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    /**
     * Adds an arc segment to the path definition.
     * https://www.w3.org/TR/SVG11/paths.html#PathDataEllipticalArcCommands
     * @param rx The major-axis radius.
     * @param ry The minor-axis radius.
     * @param rotation The x-axis rotation, expressed in radians.
     * @param fA The large arc flag. `1` to use angle > π.
     * @param fS The sweep flag. `1` for the arc that goes to `x`/`y` clockwise.
     * @param x2 The x coordinate to arc to.
     * @param y2 The y coordinate to arc to.
     */
    arcTo(rx: number, ry: number, rotation: number, fA: number, fS: number, x2: number, y2: number): void;
    arcToAlt(rx: number, ry: number, rotation: number, fA: number, fS: number, x2: number, y2: number): void;
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
    /**
     * Returns the `[x, y]` coordinates of the curve at `t`.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param t
     */
    deCasteljau(points: number[], t: number): [number, number];
    /**
     * Approximates the given curve using `n` line segments.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param n
     */
    approximateCurve(points: number[], n: number): void;
    /**
     * Adds a quadratic curve segment to the path definition.
     * Note: the given quadratic segment is converted and stored as a cubic one.
     * @param cx x-component of the curve's control point
     * @param cy y-component of the curve's control point
     * @param x x-component of the end point
     * @param y y-component of the end point
     */
    quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
    cubicCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number): void;
    private _closedPath;
    readonly closedPath: boolean;
    closePath(): void;
    clear(): void;
    isPointInPath(x: number, y: number): boolean;
    static fromString(value: string): Path2D;
    /**
     * Split the SVG path at command letters,
     * then extract the command letter and parameters from each substring.
     * @param value
     */
    static parseSvgPath(value: string): {
        command: string;
        params: number[];
    }[];
    static prettifySvgPath(value: string): string;
    /**
     * See https://www.w3.org/TR/SVG11/paths.html
     * @param value
     */
    setFromString(value: string): void;
    toString(): string;
    toPrettyString(): string;
    toSvg(): string;
    toDebugSvg(): string;
    /**
     * Returns an array of sub-paths of this Path,
     * where each sub-path is represented exclusively by cubic segments.
     */
    toCubicPaths(): number[][];
    static cubicPathToString(path: number[]): string;
}
