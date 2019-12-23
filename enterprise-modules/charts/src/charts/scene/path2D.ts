import { cubicSegmentIntersections, segmentIntersection } from "./intersection";

export class Path2D {
    // The methods of this class will likely be called many times per animation frame,
    // and any allocation can trigger a GC cycle during animation, so we attempt
    // to minimize the number of allocations.

    private xy?: [number, number];
    readonly commands: string[] = [];
    readonly params: number[] = [];

    private static splitCommandsRe = /(?=[AaCcHhLlMmQqSsTtVvZz])/g;
    private static matchParamsRe = /-?[0-9]*\.?\d+/g;
    private static quadraticCommandRe = /[QqTt]/;
    private static cubicCommandRe = /[CcSs]/;
    private static xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    private static xmlns = 'http://www.w3.org/2000/svg';

    moveTo(x: number, y: number) {
        if (this.xy) {
            this.xy[0] = x;
            this.xy[1] = y;
        } else {
            this.xy = [x, y];
        }

        this.commands.push('M');
        this.params.push(x, y);
    }

    lineTo(x: number, y: number) {
        if (this.xy) {
            this.commands.push('L');
            this.params.push(x, y);
            this.xy[0] = x;
            this.xy[1] = y;
        } else {
            this.moveTo(x, y);
        }
    }

    rect(x: number, y: number, width: number, height: number) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
    }

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
    arcTo(rx: number, ry: number, rotation: number, fA: number, fS: number, x2: number, y2: number) {
        // Convert from endpoint to center parametrization:
        // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        const xy = this.xy;
        if (!xy) { return; }

        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }

        const x1 = xy[0];
        const y1 = xy[1];
        const hdx = (x1 - x2) / 2;
        const hdy = (y1 - y2) / 2;
        const sinPhi = Math.sin(rotation);
        const cosPhi = Math.cos(rotation);
        const xp =  cosPhi * hdx + sinPhi * hdy;
        const yp = -sinPhi * hdx + cosPhi * hdy;

        const ratX = xp / rx;
        const ratY = yp / ry;
        let lambda = ratX * ratX + ratY * ratY;
        let cx = (x1 + x2) / 2;
        let cy = (y1 + y2) / 2;
        let cpx = 0;
        let cpy = 0;

        if (lambda >= 1) {
            lambda = Math.sqrt(lambda);
            rx *= lambda;
            ry *= lambda;
            // me gives lambda == cpx == cpy == 0;
        } else {
            lambda = Math.sqrt(1 / lambda - 1);
            if (fA === fS) {
                lambda = -lambda;
            }
            cpx =  lambda * rx * ratY;
            cpy = -lambda * ry * ratX;
            cx += cosPhi * cpx - sinPhi * cpy;
            cy += sinPhi * cpx + cosPhi * cpy;
        }

        const theta1 = Math.atan2((yp - cpy) / ry, (xp - cpx) / rx);
        const deltaTheta = Math.atan2((-yp - cpy) / ry, (-xp - cpx) / rx) - theta1;

        // if (fS) {
        //     if (deltaTheta <= 0) {
        //         deltaTheta += Math.PI * 2;
        //     }
        // }
        // else {
        //     if (deltaTheta >= 0) {
        //         deltaTheta -= Math.PI * 2;
        //     }
        // }
        this.cubicArc(cx, cy, rx, ry, rotation, theta1, theta1 + deltaTheta, 1 - fS);
    }

    arcToAlt(rx: number, ry: number, rotation: number, fA: number, fS: number, x2: number, y2: number) {
        // Convert from endpoint to center parametrization. See:
        // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        if (!this.xy) { return; }

        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }

        const x1 = this.xy[0];
        const y1 = this.xy[1];
        const hdx = (x1 - x2) / 2;
        const hdy = (y1 - y2) / 2;
        const sinPhi = Math.sin(rotation);
        const cosPhi = Math.cos(rotation);
        const x1p =  cosPhi * hdx + sinPhi * hdy;
        const y1p = -sinPhi * hdx + cosPhi * hdy;

        const rx_y1p = rx * rx * y1p * y1p;
        const ry_x1p = ry * ry * x1p * x1p;
        const root = Math.sqrt((rx * rx * ry * ry - rx_y1p - ry_x1p) / (rx_y1p + ry_x1p));
        const rootSign = fA === fS ? 0 : 1;
        const cxp =  rootSign * root * rx * y1p / ry;
        const cyp = -rootSign * root * ry * x1p / rx;
        const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
        const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;
        const theta1 = Math.acos((x1p - cxp) / rx / ((x1p - cxp) / rx));
    }

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
    static cubicArc(commands: string[], params: number[],
                    cx: number, cy: number, rx: number, ry: number,
                    phi: number, theta1: number, theta2: number, anticlockwise: number) {
        if (anticlockwise) {
            const temp = theta1;
            theta1 = theta2;
            theta2 = temp;
        }
        const start = params.length;
        // See https://pomax.github.io/bezierinfo/#circles_cubic
        // Arc of unit circle (start angle = 0, end angle <= π/2) in cubic Bézier coordinates:
        // S = [1, 0]
        // C1 = [1, f]
        // C2 = [cos(θ) + f * sin(θ), sin(θ) - f * cos(θ)]
        // E = [cos(θ), sin(θ)]
        // f = 4/3 * tan(θ/4)
        const f90 = 0.5522847498307935; // f for θ = π/2 is 4/3 * (Math.sqrt(2) - 1)
        const sinTheta1 = Math.sin(theta1);
        const cosTheta1 = Math.cos(theta1);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const rightAngle = Math.PI / 2;
        // Since we know how to draw an arc of a unit circle with a cubic Bézier,
        // to draw an elliptical arc with arbitrary rotation and radii we:
        // 1) rotate the Bézier coordinates that represent a circular arc by θ
        // 2) scale the circular arc separately along the x/y axes, making it elliptical
        // 3) rotate elliptical arc by φ
        // |cos(φ) -sin(φ)| |sx  0| |cos(θ) -sin(θ)| -> |xx xy|
        // |sin(φ)  cos(φ)| | 0 sy| |sin(θ)  cos(θ)| -> |yx yy|
        let xx =  cosPhi * cosTheta1 * rx - sinPhi * sinTheta1 * ry;
        let yx =  sinPhi * cosTheta1 * rx + cosPhi * sinTheta1 * ry;
        let xy = -cosPhi * sinTheta1 * rx - sinPhi * cosTheta1 * ry;
        let yy = -sinPhi * sinTheta1 * rx + cosPhi * cosTheta1 * ry;

        // TODO: what if delta between θ1 and θ2 is greater than 2π?
        // Always draw clockwise from θ1 to θ2.
        theta2 -= theta1;
        if (theta2 < 0) {
            theta2 += Math.PI * 2;
        }

        // Multiplying each point [x, y] by:
        // |xx xy cx| |x|
        // |yx yy cy| |y|
        // | 0  0  1| |1|

        // TODO: This move command may be redundant, if we are already at this point.
        // The coordinates of the point calculated here may differ ever so slightly
        // because of precision error.
        commands.push('M');
        params.push(xx + cx, yx + cy);
        while (theta2 >= rightAngle) {
            theta2 -= rightAngle;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const lastX = xy + cx;
            params.push(
                xx + xy * f90 + cx, yx + yy * f90 + cy,
                xx * f90 + xy + cx, yx * f90 + yy + cy,
                Math.abs(lastX) < 1e-8 ? 0 : lastX, yy + cy
            );
            // Prepend π/2 rotation matrix.
            // |xx xy| | 0 1| -> | xy -xx|
            // |yx yy| |-1 0| -> | yy -yx|
            // [xx, yx, xy, yy] = [xy, yy, -xx, -yx];
            // Compared to swapping with a temp variable, destructuring is:
            // - 10% faster in Chrome 70
            // - 99% slower in Firefox 63
            // Temp variable solution is 45% faster in FF than Chrome.
            // https://jsperf.com/multi-swap
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1165569
            let temp = xx;
            xx = xy;
            xy = -temp;

            temp = yx;
            yx = yy;
            yy = -temp;
        }
        if (theta2) {
            const f = 4 / 3 * Math.tan(theta2 / 4);
            const sinPhi2 = Math.sin(theta2);
            const cosPhi2 = Math.cos(theta2);
            const C2x = cosPhi2 + f * sinPhi2;
            const C2y = sinPhi2 - f * cosPhi2;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const lastX = xx * cosPhi2 + xy * sinPhi2 + cx;
            params.push(
                xx + xy * f + cx, yx + yy * f + cy,
                xx * C2x + xy * C2y + cx, yx * C2x + yy * C2y + cy,
                Math.abs(lastX) < 1e-8 ? 0 : lastX, yx * cosPhi2 + yy * sinPhi2 + cy
            );
        }
        if (anticlockwise) {
            for (let i = start, j = params.length - 2; i < j; i += 2, j -= 2) {
                let temp = params[i];
                params[i] = params[j];
                params[j] = temp;
                temp = params[i + 1];
                params[i + 1] = params[j + 1];
                params[j + 1] = temp;
            }
        }
    }

    cubicArc(cx: number, cy: number, rx: number, ry: number,
             phi: number, theta1: number, theta2: number, anticlockwise: number) {
        const commands = this.commands;
        const params = this.params;
        const start = commands.length;

        Path2D.cubicArc(commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise);

        const x = params[params.length - 2];
        const y = params[params.length - 1];
        if (this.xy) {
            commands[start] = 'L';
            this.xy[0] = x;
            this.xy[1] = y;
        } else {
            this.xy = [x, y];
        }
    }

    /**
     * Returns the `[x, y]` coordinates of the curve at `t`.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param t
     */
    deCasteljau(points: number[], t: number): [number, number] {
        const n = points.length;

        if (n < 2 || n % 2 === 1) {
            throw new Error('Fewer than two points or not an even count.');
        } else if (n === 2 || t === 0) {
            return points.slice(0, 2) as [number, number];
        } else if (t === 1) {
            return points.slice(-2) as [number, number];
        } else {
            const newPoints = [];
            const last = n - 2;

            for (let i = 0; i < last; i += 2) {
                newPoints.push(
                    (1 - t) * points[i    ] + t * points[i + 2], // x
                    (1 - t) * points[i + 1] + t * points[i + 3]  // y
                );
            }
            return this.deCasteljau(newPoints, t);
        }
    }

    /**
     * Approximates the given curve using `n` line segments.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param n
     */
    approximateCurve(points: number[], n: number) {
        const xy = this.deCasteljau(points, 0);
        this.moveTo(xy[0], xy[1]);
        const step = 1 / n;
        for (let t = step; t <= 1; t += step) {
            const xy = this.deCasteljau(points, t);
            this.lineTo(xy[0], xy[1]);
        }
    }

    /**
     * Adds a quadratic curve segment to the path definition.
     * Note: the given quadratic segment is converted and stored as a cubic one.
     * @param cx x-component of the curve's control point
     * @param cy y-component of the curve's control point
     * @param x x-component of the end point
     * @param y y-component of the end point
     */
    quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
        if (!this.xy) {
            this.moveTo(cx, cy);
        }
        // See https://pomax.github.io/bezierinfo/#reordering
        this.cubicCurveTo(
            (this.xy![0] + 2 * cx) / 3, (this.xy![1] + 2 * cy) / 3, // 1/3 start + 2/3 control
            (2 * cx + x) / 3, (2 * cy + y) / 3,                     // 2/3 control + 1/3 end
            x, y
        );
    }

    cubicCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push('C');
        this.params.push(cx1, cy1, cx2, cy2, x, y);
        this.xy![0] = x;
        this.xy![1] = y;
    }

    private _closedPath: boolean = false;
    get closedPath(): boolean {
        return this._closedPath;
    }

    closePath() {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    }

    clear() {
        this.commands.length = 0;
        this.params.length = 0;
        this.xy = undefined;
        this._closedPath = false;
    }

    isPointInPath(x: number, y: number): boolean {
        const commands = this.commands;
        const params = this.params;
        const cn = commands.length;
        // Hit testing using ray casting method, where the ray's origin is some point
        // outside the path. In this case, an offscreen point that is remote enough, so that
        // even if the path itself is large and is partially offscreen, the ray's origin
        // will likely be outside the path anyway. To test if the given point is inside the
        // path or not, we cast a ray from the origin to the given point and check the number
        // of intersections of this segment with the path. If the number of intersections is
        // even, then the ray both entered and exited the path an equal number of times,
        // therefore the point is outside the path, and inside the path, if the number of
        // intersections is odd. Since the path is compound, we check if the ray segment
        // intersects with each of the path's segments, which can be either a line segment
        // (one or no intersection points) or a Bézier curve segment (up to 3 intersection
        // points).
        const ox = -10000;
        const oy = -10000;
        // the starting point of the  current path
        let sx: number = NaN;
        let sy: number = NaN;
        // the previous point of the current path
        let px = 0;
        let py = 0;
        let intersectionCount = 0;

        for (let ci = 0, pi = 0; ci < cn; ci++) {
            switch (commands[ci]) {
                case 'M':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    sx = px = params[pi++];
                    sy = py = params[pi++];
                    break;
                case 'L':
                    if (segmentIntersection(px, py, px = params[pi++], py = params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    break;
                case 'C':
                    intersectionCount += cubicSegmentIntersections(
                        px, py,
                        params[pi++], params[pi++],
                        params[pi++], params[pi++],
                        px = params[pi++], py = params[pi++],
                        ox, oy, x, y
                    ).length;
                    break;
                case 'Z':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    break;
            }
        }

        return intersectionCount % 2 === 1;
    }

    static fromString(value: string): Path2D {
        const path = new Path2D();
        path.setFromString(value);
        return path;
    }

    /**
     * Split the SVG path at command letters,
     * then extract the command letter and parameters from each substring.
     * @param value
     */
    static parseSvgPath(value: string): {command: string, params: number[]}[] {
        return value.trim().split(Path2D.splitCommandsRe).map(part => {
            const strParams = part.match(Path2D.matchParamsRe);
            return {
                command: part.substr(0, 1),
                params: strParams ? strParams.map(parseFloat) : []
            };
        });
    }

    static prettifySvgPath(value: string): string {
        return Path2D.parseSvgPath(value).map(d => d.command + d.params.join(',')).join('\n');
    }

    /**
     * See https://www.w3.org/TR/SVG11/paths.html
     * @param value
     */
    setFromString(value: string) {
        this.clear();

        const parts = Path2D.parseSvgPath(value);

        // Current point.
        let x: number;
        let y: number;
        // Last control point. Used to calculate the reflection point
        // for `S`, `s`, `T`, `t` commands.
        let cpx: number;
        let cpy: number;

        let lastCommand: string;

        function checkQuadraticCP() {
            if (!lastCommand.match(Path2D.quadraticCommandRe)) {
                cpx = x;
                cpy = y;
            }
        }

        function checkCubicCP() {
            if (!lastCommand.match(Path2D.cubicCommandRe)) {
                cpx = x;
                cpy = y;
            }
        }

        // But that will make compiler complain about x/y, cpx/cpy
        // being used without being set first.
        parts.forEach(part => {
            const p = part.params;
            const n = p.length;
            let i = 0;

            switch (part.command) {
                case 'M':
                    this.moveTo(x = p[i++], y = p[i++]);
                    while (i < n) {
                        this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'm':
                    this.moveTo(x += p[i++], y += p[i++]);
                    while (i < n) {
                        this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'L':
                    while (i < n) {
                        this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'l':
                    while (i < n) {
                        this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'C':
                    while (i < n) {
                        this.cubicCurveTo(
                            p[i++], p[i++],
                            cpx = p[i++], cpy = p[i++],
                            x = p[i++], y = p[i++]
                        );
                    }
                    break;
                case 'c':
                    while (i < n) {
                        this.cubicCurveTo(
                            x + p[i++], y + p[i++],
                            cpx = x + p[i++], cpy = y + p[i++],
                            x += p[i++], y += p[i++]
                        );
                    }
                    break;
                case 'S':
                    checkCubicCP();
                    while (i < n) {
                        this.cubicCurveTo(
                            x + x - cpx, y + y - cpy,
                            cpx = p[i++], cpy = p[i++],
                            x = p[i++], y = p[i++]
                        );
                    }
                    break;
                case 's':
                    checkCubicCP();
                    while (i < n) {
                        this.cubicCurveTo(
                            x + x - cpx, y + y - cpy,
                            cpx = x + p[i++], cpy = y + p[i++],
                            x += p[i++], y += p[i++]
                        );
                    }
                    break;
                case 'Q':
                    while (i < n) {
                        this.quadraticCurveTo(
                            cpx = p[i++], cpy = p[i++],
                            x = p[i++], y = p[i++]
                        );
                    }
                    break;
                case 'q':
                    while (i < n) {
                        this.quadraticCurveTo(
                            cpx = x + p[i++], cpy = y + p[i++],
                            x += p[i++], y += p[i++]
                        );
                    }
                    break;
                case 'T':
                    checkQuadraticCP();
                    while (i < n) {
                        this.quadraticCurveTo(
                            cpx = x + x - cpx, cpy = y + y - cpy,
                            x = p[i++], y = p[i++]
                        );
                    }
                    break;
                case 't':
                    checkQuadraticCP();
                    while (i < n) {
                        this.quadraticCurveTo(
                            cpx = x + x - cpx, cpy = y + y - cpy,
                            x += p[i++], y += p[i++]
                        );
                    }
                    break;
                case 'A':
                    while (i < n) {
                        this.arcTo(
                            p[i++], p[i++],
                            p[i++] * Math.PI / 180,
                            p[i++], p[i++],
                            x = p[i++], y = p[i++]
                        );
                    }
                    break;
                case 'a':
                    while (i < n) {
                        this.arcTo(
                            p[i++], p[i++],
                            p[i++] * Math.PI / 180,
                            p[i++], p[i++],
                            x += p[i++], y += p[i++]
                        );
                    }
                    break;
                case 'Z':
                case 'z':
                    this.closePath();
                    break;
                case 'H':
                    while (i < n) {
                        this.lineTo(x = p[i++], y);
                    }
                    break;
                case 'h':
                    while (i < n) {
                        this.lineTo(x += p[i++], y);
                    }
                    break;
                case 'V':
                    while (i < n) {
                        this.lineTo(x, y = p[i++]);
                    }
                    break;
                case 'v':
                    while (i < n) {
                        this.lineTo(x, y += p[i++]);
                    }
                    break;
            }

            lastCommand = part.command;
        });
    }

    toString(): string {
        const c = this.commands;
        const p = this.params;
        const cn = c.length;
        const out: string[] = [];

        for (let ci = 0, pi = 0; ci < cn; ci++) {
            switch (c[ci]) {
                case 'M':
                    out.push('M' + p[pi++] + ',' + p[pi++]);
                    break;
                case 'L':
                    out.push('L' + p[pi++] + ',' + p[pi++]);
                    break;
                case 'C':
                    out.push('C' + p[pi++] + ',' + p[pi++] + ' ' +
                        p[pi++] + ',' + p[pi++] + ' ' +
                        p[pi++] + ',' + p[pi++]);
                    break;
                case 'Z':
                    out.push('Z');
                    break;
            }
        }
        return out.join('');
    }

    toPrettyString(): string {
        return Path2D.prettifySvgPath(this.toString());
    }

    toSvg(): string {
        return `${Path2D.xmlDeclaration}
<svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="${Path2D.xmlns}">
    <path d="${this.toString()}" style="fill:none;stroke:#000;stroke-width:0.5;"/>
</svg>`;
    }

    toDebugSvg(): string {
        const d = Path2D.prettifySvgPath(this.toString());
        return `${Path2D.xmlDeclaration}
<svg width="100%" height="100%" viewBox="0 0 100 100" version="1.1" xmlns="${Path2D.xmlns}">
    <path d="${d}" style="fill:none;stroke:#000;stroke-width:0.5;"/>
</svg>`;
    }

    /**
     * Returns an array of sub-paths of this Path,
     * where each sub-path is represented exclusively by cubic segments.
     */
    toCubicPaths(): number[][] {
        // Each sub-path is an array of `(n * 3 + 1) * 2` numbers,
        // where `n` is the number of segments.
        const paths: number[][] = [];
        const params = this.params;

        // current path
        let path: number[];
        // the starting point of the  current path
        let sx: number;
        let sy: number;
        // the previous point of the current path
        let px: number;
        let py: number;
        let i = 0; // current parameter

        this.commands.forEach(command => {
            switch (command) {
                case 'M':
                    path = [
                        sx = px = params[i++],
                        sy = py = params[i++]
                    ];
                    paths.push(path);
                    break;
                case 'L':
                    const x = params[i++];
                    const y = params[i++];
                    // Place control points along the line `a + (b - a) * t`
                    // at t = 1/3 and 2/3:
                    path.push(
                        (px + px + x) / 3, (py + py + y) / 3,
                        (px + x + x) / 3, (py + y + y) / 3,
                        px = x, py = y
                    );
                    break;
                case 'C':
                    path.push(
                        params[i++], params[i++],
                        params[i++], params[i++],
                        px = params[i++], py = params[i++]
                    );
                    break;
                case 'Z':
                    path.push(
                        (px + px + sx) / 3, (py + py + sy) / 3,
                        (px + sx + sx) / 3, (py + sy + sy) / 3,
                        px = sx, py = sy
                    );
                    break;
            }
        });

        return paths;
    }

    static cubicPathToString(path: number[]): string {
        const n = path.length;
        if (!(n % 2 === 0 && (n / 2 - 1) / 2 >= 1)) {
            throw new Error('Invalid path.');
        }
        return 'M' + path.slice(0, 2).join(',') + 'C' + path.slice(2).join(',');
    }
}
