"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path2D = void 0;
const intersection_1 = require("./intersection");
class Path2D {
    constructor() {
        // The methods of this class will likely be called many times per animation frame,
        // and any allocation can trigger a GC cycle during animation, so we attempt
        // to minimize the number of allocations.
        this.previousCommands = [];
        this.previousParams = [];
        this.previousClosedPath = false;
        this.commands = [];
        this.params = [];
        this._closedPath = false;
    }
    isDirty() {
        if (this._closedPath !== this.previousClosedPath) {
            return true;
        }
        if (this.previousCommands.length !== this.commands.length) {
            return true;
        }
        if (this.previousParams.length !== this.params.length) {
            return true;
        }
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i] !== this.previousCommands[i]) {
                return true;
            }
        }
        for (let i = 0; i < this.params.length; i++) {
            if (this.params[i] !== this.previousParams[i]) {
                return true;
            }
        }
        return false;
    }
    draw(ctx) {
        const commands = this.commands;
        const params = this.params;
        let j = 0;
        ctx.beginPath();
        for (const command of commands) {
            switch (command) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
        if (commands.length === 0) {
            ctx.closePath();
        }
    }
    moveTo(x, y) {
        if (this.xy) {
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.xy = [x, y];
        }
        this.commands.push('M');
        this.params.push(x, y);
    }
    lineTo(x, y) {
        if (this.xy) {
            this.commands.push('L');
            this.params.push(x, y);
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.moveTo(x, y);
        }
    }
    rect(x, y, width, height) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
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
    static cubicArc(commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
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
        let xx = cosPhi * cosTheta1 * rx - sinPhi * sinTheta1 * ry;
        let yx = sinPhi * cosTheta1 * rx + cosPhi * sinTheta1 * ry;
        let xy = -cosPhi * sinTheta1 * rx - sinPhi * cosTheta1 * ry;
        let yy = -sinPhi * sinTheta1 * rx + cosPhi * cosTheta1 * ry;
        // Always draw clockwise from θ1 to θ2.
        theta2 -= theta1;
        if (theta2 < 0) {
            theta2 += Math.PI * 2;
        }
        // Multiplying each point [x, y] by:
        // |xx xy cx| |x|
        // |yx yy cy| |y|
        // | 0  0  1| |1|
        commands.push('M');
        params.push(xx + cx, yx + cy);
        while (theta2 >= rightAngle) {
            theta2 -= rightAngle;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const lastX = xy + cx;
            params.push(xx + xy * f90 + cx, yx + yy * f90 + cy, xx * f90 + xy + cx, yx * f90 + yy + cy, Math.abs(lastX) < 1e-8 ? 0 : lastX, yy + cy);
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
            const f = (4 / 3) * Math.tan(theta2 / 4);
            const sinPhi2 = Math.sin(theta2);
            const cosPhi2 = Math.cos(theta2);
            const C2x = cosPhi2 + f * sinPhi2;
            const C2y = sinPhi2 - f * cosPhi2;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const lastX = xx * cosPhi2 + xy * sinPhi2 + cx;
            params.push(xx + xy * f + cx, yx + yy * f + cy, xx * C2x + xy * C2y + cx, yx * C2x + yy * C2y + cy, Math.abs(lastX) < 1e-8 ? 0 : lastX, yx * cosPhi2 + yy * sinPhi2 + cy);
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
    cubicArc(cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
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
        }
        else {
            this.xy = [x, y];
        }
    }
    cubicCurveTo(cx1, cy1, cx2, cy2, x, y) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push('C');
        this.params.push(cx1, cy1, cx2, cy2, x, y);
        this.xy[0] = x;
        this.xy[1] = y;
    }
    get closedPath() {
        return this._closedPath;
    }
    closePath() {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    }
    clear({ trackChanges } = { trackChanges: false }) {
        if (trackChanges) {
            this.previousCommands = this.commands;
            this.previousParams = this.params;
            this.previousClosedPath = this._closedPath;
            this.commands = [];
            this.params = [];
        }
        else {
            this.commands.length = 0;
            this.params.length = 0;
        }
        this.xy = undefined;
        this._closedPath = false;
    }
    isPointInPath(x, y) {
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
        let sx = NaN;
        let sy = NaN;
        // the previous point of the current path
        let px = 0;
        let py = 0;
        let intersectionCount = 0;
        for (let ci = 0, pi = 0; ci < cn; ci++) {
            switch (commands[ci]) {
                case 'M':
                    if (!isNaN(sx)) {
                        if (intersection_1.segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    px = params[pi++];
                    sx = px;
                    py = params[pi++];
                    sy = py;
                    break;
                case 'L':
                    if (intersection_1.segmentIntersection(px, py, params[pi++], params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case 'C':
                    intersectionCount += intersection_1.cubicSegmentIntersections(px, py, params[pi++], params[pi++], params[pi++], params[pi++], params[pi++], params[pi++], ox, oy, x, y).length;
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case 'Z':
                    if (!isNaN(sx)) {
                        if (intersection_1.segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    break;
            }
        }
        return intersectionCount % 2 === 1;
    }
}
exports.Path2D = Path2D;
