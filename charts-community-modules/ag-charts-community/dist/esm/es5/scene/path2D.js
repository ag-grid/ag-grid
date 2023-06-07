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
import { cubicSegmentIntersections, segmentIntersection, arcIntersections } from './intersection';
var Command;
(function (Command) {
    Command[Command["Move"] = 0] = "Move";
    Command[Command["Line"] = 1] = "Line";
    Command[Command["Arc"] = 2] = "Arc";
    Command[Command["Curve"] = 3] = "Curve";
    Command[Command["ClosePath"] = 4] = "ClosePath";
})(Command || (Command = {}));
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
                    case Command.Move:
                        ctx.moveTo(params[j++], params[j++]);
                        break;
                    case Command.Line:
                        ctx.lineTo(params[j++], params[j++]);
                        break;
                    case Command.Curve:
                        ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                        break;
                    case Command.Arc:
                        ctx.arc(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++] === 1);
                        break;
                    case Command.ClosePath:
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
        this.commands.push(Command.Move);
        this.params.push(x, y);
    };
    Path2D.prototype.lineTo = function (x, y) {
        if (this.xy) {
            this.commands.push(Command.Line);
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
    Path2D.prototype.arc = function (x, y, r, sAngle, eAngle, antiClockwise) {
        if (antiClockwise === void 0) { antiClockwise = false; }
        var endX = x + r * Math.cos(eAngle);
        var endY = y + r * Math.sin(eAngle);
        if (this.xy) {
            this.xy[0] = endX;
            this.xy[1] = endY;
        }
        else {
            this.xy = [endX, endY];
        }
        this.commands.push(Command.Arc);
        this.params.push(x, y, r, sAngle, eAngle, antiClockwise ? 1 : 0);
    };
    Path2D.prototype.cubicCurveTo = function (cx1, cy1, cx2, cy2, x, y) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push(Command.Curve);
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
            this.commands.push(Command.ClosePath);
            this._closedPath = true;
        }
    };
    Path2D.prototype.clear = function (_a) {
        var _b = _a === void 0 ? { trackChanges: false } : _a, trackChanges = _b.trackChanges;
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
                case Command.Move:
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    px = params[pi++];
                    sx = px;
                    py = params[pi++];
                    sy = py;
                    break;
                case Command.Line:
                    if (segmentIntersection(px, py, params[pi++], params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case Command.Curve:
                    intersectionCount += cubicSegmentIntersections(px, py, params[pi++], params[pi++], params[pi++], params[pi++], params[pi++], params[pi++], ox, oy, x, y).length;
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case Command.Arc:
                    intersectionCount += arcIntersections(params[pi++], params[pi++], params[pi++], params[pi++], params[pi++], Boolean(params[pi++]), ox, oy, x, y).length;
                    px = params[pi - 2];
                    py = params[pi - 1];
                    break;
                case Command.ClosePath:
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
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
export { Path2D };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aDJELmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3BhdGgyRC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxHLElBQUssT0FNSjtBQU5ELFdBQUssT0FBTztJQUNSLHFDQUFJLENBQUE7SUFDSixxQ0FBSSxDQUFBO0lBQ0osbUNBQUcsQ0FBQTtJQUNILHVDQUFLLENBQUE7SUFDTCwrQ0FBUyxDQUFBO0FBQ2IsQ0FBQyxFQU5JLE9BQU8sS0FBUCxPQUFPLFFBTVg7QUFFRDtJQUFBO1FBQ0ksa0ZBQWtGO1FBQ2xGLDRFQUE0RTtRQUM1RSx5Q0FBeUM7UUFHakMscUJBQWdCLEdBQWMsRUFBRSxDQUFDO1FBQ2pDLG1CQUFjLEdBQWEsRUFBRSxDQUFDO1FBQzlCLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUM1QyxhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFtSGQsZ0JBQVcsR0FBWSxLQUFLLENBQUM7SUF3SHpDLENBQUM7SUF6T0csd0JBQU8sR0FBUDtRQUNJLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDOUMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUN2RCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElB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