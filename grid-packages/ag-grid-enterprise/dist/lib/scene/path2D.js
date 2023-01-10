"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path2D = void 0;
var intersection_1 = require("./intersection");
var Path2D = /** @class */ (function () {
    function Path2D() {
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
    Path2D.prototype.isDirty = function () {
        if (this._closedPath !== this.previousClosedPath) {
            return true;
        }
        if (this.previousCommands.length !== this.commands.length) {
            return true;
        }
        if (this.previousParams.length !== this.params.length) {
            return true;
        }
        for (var i = 0; i < this.commands.length; i++) {
            if (this.commands[i] !== this.previousCommands[i]) {
                return true;
            }
        }
        for (var i = 0; i < this.params.length; i++) {
            if (this.params[i] !== this.previousParams[i]) {
                return true;
            }
        }
        return false;
    };
    Path2D.prototype.draw = function (ctx) {
        var e_1, _a;
        var commands = this.commands;
        var params = this.params;
        var j = 0;
        ctx.beginPath();
        try {
            for (var commands_1 = __values(commands), commands_1_1 = commands_1.next(); !commands_1_1.done; commands_1_1 = commands_1.next()) {
                var command = commands_1_1.value;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (commands_1_1 && !commands_1_1.done && (_a = commands_1.return)) _a.call(commands_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (commands.length === 0) {
            ctx.closePath();
        }
    };
    Path2D.prototype.moveTo = function (x, y) {
        if (this.xy) {
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.xy = [x, y];
        }
        this.commands.push('M');
        this.params.push(x, y);
    };
    Path2D.prototype.lineTo = function (x, y) {
        if (this.xy) {
            this.commands.push('L');
            this.params.push(x, y);
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.moveTo(x, y);
        }
    };
    Path2D.prototype.rect = function (x, y, width, height) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
    };
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
    Path2D.cubicArc = function (commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
        if (anticlockwise) {
            var temp = theta1;
            theta1 = theta2;
            theta2 = temp;
        }
        var start = params.length;
        // See https://pomax.github.io/bezierinfo/#circles_cubic
        // Arc of unit circle (start angle = 0, end angle <= π/2) in cubic Bézier coordinates:
        // S = [1, 0]
        // C1 = [1, f]
        // C2 = [cos(θ) + f * sin(θ), sin(θ) - f * cos(θ)]
        // E = [cos(θ), sin(θ)]
        // f = 4/3 * tan(θ/4)
        var f90 = 0.5522847498307935; // f for θ = π/2 is 4/3 * (Math.sqrt(2) - 1)
        var sinTheta1 = Math.sin(theta1);
        var cosTheta1 = Math.cos(theta1);
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var rightAngle = Math.PI / 2;
        // Since we know how to draw an arc of a unit circle with a cubic Bézier,
        // to draw an elliptical arc with arbitrary rotation and radii we:
        // 1) rotate the Bézier coordinates that represent a circular arc by θ
        // 2) scale the circular arc separately along the x/y axes, making it elliptical
        // 3) rotate elliptical arc by φ
        // |cos(φ) -sin(φ)| |sx  0| |cos(θ) -sin(θ)| -> |xx xy|
        // |sin(φ)  cos(φ)| | 0 sy| |sin(θ)  cos(θ)| -> |yx yy|
        var xx = cosPhi * cosTheta1 * rx - sinPhi * sinTheta1 * ry;
        var yx = sinPhi * cosTheta1 * rx + cosPhi * sinTheta1 * ry;
        var xy = -cosPhi * sinTheta1 * rx - sinPhi * cosTheta1 * ry;
        var yy = -sinPhi * sinTheta1 * rx + cosPhi * cosTheta1 * ry;
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
            var lastX = xy + cx;
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
            var temp = xx;
            xx = xy;
            xy = -temp;
            temp = yx;
            yx = yy;
            yy = -temp;
        }
        if (theta2) {
            var f = (4 / 3) * Math.tan(theta2 / 4);
            var sinPhi2 = Math.sin(theta2);
            var cosPhi2 = Math.cos(theta2);
            var C2x = cosPhi2 + f * sinPhi2;
            var C2y = sinPhi2 - f * cosPhi2;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            var lastX = xx * cosPhi2 + xy * sinPhi2 + cx;
            params.push(xx + xy * f + cx, yx + yy * f + cy, xx * C2x + xy * C2y + cx, yx * C2x + yy * C2y + cy, Math.abs(lastX) < 1e-8 ? 0 : lastX, yx * cosPhi2 + yy * sinPhi2 + cy);
        }
        if (anticlockwise) {
            for (var i = start, j = params.length - 2; i < j; i += 2, j -= 2) {
                var temp = params[i];
                params[i] = params[j];
                params[j] = temp;
                temp = params[i + 1];
                params[i + 1] = params[j + 1];
                params[j + 1] = temp;
            }
        }
    };
    Path2D.prototype.cubicArc = function (cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
        var commands = this.commands;
        var params = this.params;
        var start = commands.length;
        Path2D.cubicArc(commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise);
        var x = params[params.length - 2];
        var y = params[params.length - 1];
        if (this.xy) {
            commands[start] = 'L';
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.xy = [x, y];
        }
    };
    Path2D.prototype.cubicCurveTo = function (cx1, cy1, cx2, cy2, x, y) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push('C');
        this.params.push(cx1, cy1, cx2, cy2, x, y);
        this.xy[0] = x;
        this.xy[1] = y;
    };
    Object.defineProperty(Path2D.prototype, "closedPath", {
        get: function () {
            return this._closedPath;
        },
        enumerable: false,
        configurable: true
    });
    Path2D.prototype.closePath = function () {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    };
    Path2D.prototype.clear = function (_a) {
        var trackChanges = (_a === void 0 ? { trackChanges: false } : _a).trackChanges;
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
    };
    Path2D.prototype.isPointInPath = function (x, y) {
        var commands = this.commands;
        var params = this.params;
        var cn = commands.length;
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
        var ox = -10000;
        var oy = -10000;
        // the starting point of the  current path
        var sx = NaN;
        var sy = NaN;
        // the previous point of the current path
        var px = 0;
        var py = 0;
        var intersectionCount = 0;
        for (var ci = 0, pi = 0; ci < cn; ci++) {
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
    };
    return Path2D;
}());
exports.Path2D = Path2D;
//# sourceMappingURL=path2D.js.map