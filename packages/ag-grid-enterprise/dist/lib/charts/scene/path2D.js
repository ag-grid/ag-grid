// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intersection_1 = require("./intersection");
var Path2D = /** @class */ (function () {
    function Path2D() {
        // The methods of this class will likely be called many times per animation frame,
        // and any allocation can trigger a GC cycle during animation, so we attempt
        // to minimize the number of allocations.
        this.commands = [];
        this.params = [];
        this._closedPath = false;
    }
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
    Path2D.prototype.arcTo = function (rx, ry, rotation, fA, fS, x2, y2) {
        // Convert from endpoint to center parametrization:
        // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        var xy = this.xy;
        if (!xy) {
            return;
        }
        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }
        var x1 = xy[0];
        var y1 = xy[1];
        var hdx = (x1 - x2) / 2;
        var hdy = (y1 - y2) / 2;
        var sinPhi = Math.sin(rotation);
        var cosPhi = Math.cos(rotation);
        var xp = cosPhi * hdx + sinPhi * hdy;
        var yp = -sinPhi * hdx + cosPhi * hdy;
        var ratX = xp / rx;
        var ratY = yp / ry;
        var lambda = ratX * ratX + ratY * ratY;
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var cpx = 0;
        var cpy = 0;
        if (lambda >= 1) {
            lambda = Math.sqrt(lambda);
            rx *= lambda;
            ry *= lambda;
            // me gives lambda == cpx == cpy == 0;
        }
        else {
            lambda = Math.sqrt(1 / lambda - 1);
            if (fA === fS) {
                lambda = -lambda;
            }
            cpx = lambda * rx * ratY;
            cpy = -lambda * ry * ratX;
            cx += cosPhi * cpx - sinPhi * cpy;
            cy += sinPhi * cpx + cosPhi * cpy;
        }
        var theta1 = Math.atan2((yp - cpy) / ry, (xp - cpx) / rx);
        var deltaTheta = Math.atan2((-yp - cpy) / ry, (-xp - cpx) / rx) - theta1;
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
    };
    Path2D.prototype.arcToAlt = function (rx, ry, rotation, fA, fS, x2, y2) {
        // Convert from endpoint to center parametrization. See:
        // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        if (!this.xy) {
            return;
        }
        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }
        var x1 = this.xy[0];
        var y1 = this.xy[1];
        var hdx = (x1 - x2) / 2;
        var hdy = (y1 - y2) / 2;
        var sinPhi = Math.sin(rotation);
        var cosPhi = Math.cos(rotation);
        var x1p = cosPhi * hdx + sinPhi * hdy;
        var y1p = -sinPhi * hdx + cosPhi * hdy;
        var rx_y1p = rx * rx * y1p * y1p;
        var ry_x1p = ry * ry * x1p * x1p;
        var root = Math.sqrt((rx * rx * ry * ry - rx_y1p - ry_x1p) / (rx_y1p + ry_x1p));
        var rootSign = fA === fS ? 0 : 1;
        var cxp = rootSign * root * rx * y1p / ry;
        var cyp = -rootSign * root * ry * x1p / rx;
        var cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
        var cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;
        var theta1 = Math.acos((x1p - cxp) / rx / ((x1p - cxp) / rx));
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
            var f = 4 / 3 * Math.tan(theta2 / 4);
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
    /**
     * Returns the `[x, y]` coordinates of the curve at `t`.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param t
     */
    Path2D.prototype.deCasteljau = function (points, t) {
        var n = points.length;
        if (n < 2 || n % 2 === 1) {
            throw new Error('Fewer than two points or not an even count.');
        }
        else if (n === 2 || t === 0) {
            return points.slice(0, 2);
        }
        else if (t === 1) {
            return points.slice(-2);
        }
        else {
            var newPoints = [];
            var last = n - 2;
            for (var i = 0; i < last; i += 2) {
                newPoints.push((1 - t) * points[i] + t * points[i + 2], // x
                (1 - t) * points[i + 1] + t * points[i + 3] // y
                );
            }
            return this.deCasteljau(newPoints, t);
        }
    };
    /**
     * Approximates the given curve using `n` line segments.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param n
     */
    Path2D.prototype.approximateCurve = function (points, n) {
        var xy = this.deCasteljau(points, 0);
        this.moveTo(xy[0], xy[1]);
        var step = 1 / n;
        for (var t = step; t <= 1; t += step) {
            var xy_1 = this.deCasteljau(points, t);
            this.lineTo(xy_1[0], xy_1[1]);
        }
    };
    /**
     * Adds a quadratic curve segment to the path definition.
     * Note: the given quadratic segment is converted and stored as a cubic one.
     * @param cx x-component of the curve's control point
     * @param cy y-component of the curve's control point
     * @param x x-component of the end point
     * @param y y-component of the end point
     */
    Path2D.prototype.quadraticCurveTo = function (cx, cy, x, y) {
        if (!this.xy) {
            this.moveTo(cx, cy);
        }
        // See https://pomax.github.io/bezierinfo/#reordering
        this.cubicCurveTo((this.xy[0] + 2 * cx) / 3, (this.xy[1] + 2 * cy) / 3, // 1/3 start + 2/3 control
        (2 * cx + x) / 3, (2 * cy + y) / 3, // 2/3 control + 1/3 end
        x, y);
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
        enumerable: true,
        configurable: true
    });
    Path2D.prototype.closePath = function () {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    };
    Path2D.prototype.clear = function () {
        this.commands.length = 0;
        this.params.length = 0;
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
                    sx = px = params[pi++];
                    sy = py = params[pi++];
                    break;
                case 'L':
                    if (intersection_1.segmentIntersection(px, py, px = params[pi++], py = params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    break;
                case 'C':
                    intersectionCount += intersection_1.cubicSegmentIntersections(px, py, params[pi++], params[pi++], params[pi++], params[pi++], px = params[pi++], py = params[pi++], ox, oy, x, y).length;
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
    Path2D.fromString = function (value) {
        var path = new Path2D();
        path.setFromString(value);
        return path;
    };
    /**
     * Split the SVG path at command letters,
     * then extract the command letter and parameters from each substring.
     * @param value
     */
    Path2D.parseSvgPath = function (value) {
        return value.trim().split(Path2D.splitCommandsRe).map(function (part) {
            var strParams = part.match(Path2D.matchParamsRe);
            return {
                command: part.substr(0, 1),
                params: strParams ? strParams.map(parseFloat) : []
            };
        });
    };
    Path2D.prettifySvgPath = function (value) {
        return Path2D.parseSvgPath(value).map(function (d) { return d.command + d.params.join(','); }).join('\n');
    };
    /**
     * See https://www.w3.org/TR/SVG11/paths.html
     * @param value
     */
    Path2D.prototype.setFromString = function (value) {
        var _this = this;
        this.clear();
        var parts = Path2D.parseSvgPath(value);
        // Current point.
        var x;
        var y;
        // Last control point. Used to calculate the reflection point
        // for `S`, `s`, `T`, `t` commands.
        var cpx;
        var cpy;
        var lastCommand;
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
        parts.forEach(function (part) {
            var p = part.params;
            var n = p.length;
            var i = 0;
            switch (part.command) {
                case 'M':
                    _this.moveTo(x = p[i++], y = p[i++]);
                    while (i < n) {
                        _this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'm':
                    _this.moveTo(x += p[i++], y += p[i++]);
                    while (i < n) {
                        _this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'L':
                    while (i < n) {
                        _this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'l':
                    while (i < n) {
                        _this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'C':
                    while (i < n) {
                        _this.cubicCurveTo(p[i++], p[i++], cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'c':
                    while (i < n) {
                        _this.cubicCurveTo(x + p[i++], y + p[i++], cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'S':
                    checkCubicCP();
                    while (i < n) {
                        _this.cubicCurveTo(x + x - cpx, y + y - cpy, cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 's':
                    checkCubicCP();
                    while (i < n) {
                        _this.cubicCurveTo(x + x - cpx, y + y - cpy, cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'Q':
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'q':
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'T':
                    checkQuadraticCP();
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + x - cpx, cpy = y + y - cpy, x = p[i++], y = p[i++]);
                    }
                    break;
                case 't':
                    checkQuadraticCP();
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + x - cpx, cpy = y + y - cpy, x += p[i++], y += p[i++]);
                    }
                    break;
                case 'A':
                    while (i < n) {
                        _this.arcTo(p[i++], p[i++], p[i++] * Math.PI / 180, p[i++], p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'a':
                    while (i < n) {
                        _this.arcTo(p[i++], p[i++], p[i++] * Math.PI / 180, p[i++], p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'Z':
                case 'z':
                    _this.closePath();
                    break;
                case 'H':
                    while (i < n) {
                        _this.lineTo(x = p[i++], y);
                    }
                    break;
                case 'h':
                    while (i < n) {
                        _this.lineTo(x += p[i++], y);
                    }
                    break;
                case 'V':
                    while (i < n) {
                        _this.lineTo(x, y = p[i++]);
                    }
                    break;
                case 'v':
                    while (i < n) {
                        _this.lineTo(x, y += p[i++]);
                    }
                    break;
            }
            lastCommand = part.command;
        });
    };
    Path2D.prototype.toString = function () {
        var c = this.commands;
        var p = this.params;
        var cn = c.length;
        var out = [];
        for (var ci = 0, pi = 0; ci < cn; ci++) {
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
    };
    Path2D.prototype.toPrettyString = function () {
        return Path2D.prettifySvgPath(this.toString());
    };
    Path2D.prototype.toSvg = function () {
        return Path2D.xmlDeclaration + "\n<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 50 50\" version=\"1.1\" xmlns=\"" + Path2D.xmlns + "\">\n    <path d=\"" + this.toString() + "\" style=\"fill:none;stroke:#000;stroke-width:0.5;\"/>\n</svg>";
    };
    Path2D.prototype.toDebugSvg = function () {
        var d = Path2D.prettifySvgPath(this.toString());
        return Path2D.xmlDeclaration + "\n<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 100 100\" version=\"1.1\" xmlns=\"" + Path2D.xmlns + "\">\n    <path d=\"" + d + "\" style=\"fill:none;stroke:#000;stroke-width:0.5;\"/>\n</svg>";
    };
    /**
     * Returns an array of sub-paths of this Path,
     * where each sub-path is represented exclusively by cubic segments.
     */
    Path2D.prototype.toCubicPaths = function () {
        // Each sub-path is an array of `(n * 3 + 1) * 2` numbers,
        // where `n` is the number of segments.
        var paths = [];
        var params = this.params;
        // current path
        var path;
        // the starting point of the  current path
        var sx;
        var sy;
        // the previous point of the current path
        var px;
        var py;
        var i = 0; // current parameter
        this.commands.forEach(function (command) {
            switch (command) {
                case 'M':
                    path = [
                        sx = px = params[i++],
                        sy = py = params[i++]
                    ];
                    paths.push(path);
                    break;
                case 'L':
                    var x = params[i++];
                    var y = params[i++];
                    // Place control points along the line `a + (b - a) * t`
                    // at t = 1/3 and 2/3:
                    path.push((px + px + x) / 3, (py + py + y) / 3, (px + x + x) / 3, (py + y + y) / 3, px = x, py = y);
                    break;
                case 'C':
                    path.push(params[i++], params[i++], params[i++], params[i++], px = params[i++], py = params[i++]);
                    break;
                case 'Z':
                    path.push((px + px + sx) / 3, (py + py + sy) / 3, (px + sx + sx) / 3, (py + sy + sy) / 3, px = sx, py = sy);
                    break;
            }
        });
        return paths;
    };
    Path2D.cubicPathToString = function (path) {
        var n = path.length;
        if (!(n % 2 === 0 && (n / 2 - 1) / 2 >= 1)) {
            throw new Error('Invalid path.');
        }
        return 'M' + path.slice(0, 2).join(',') + 'C' + path.slice(2).join(',');
    };
    Path2D.splitCommandsRe = /(?=[AaCcHhLlMmQqSsTtVvZz])/g;
    Path2D.matchParamsRe = /-?[0-9]*\.?\d+/g;
    Path2D.quadraticCommandRe = /[QqTt]/;
    Path2D.cubicCommandRe = /[CcSs]/;
    Path2D.xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    Path2D.xmlns = 'http://www.w3.org/2000/svg';
    return Path2D;
}());
exports.Path2D = Path2D;
