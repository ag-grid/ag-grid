// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var BBox = /** @class */ (function () {
    function BBox(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    BBox.prototype.clone = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return new BBox(x, y, width, height);
    };
    BBox.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
    };
    BBox.prototype.containsPoint = function (x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    };
    BBox.prototype.collidesBBox = function (other) {
        return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y);
    };
    BBox.prototype.isInfinite = function () {
        return (Math.abs(this.x) === Infinity ||
            Math.abs(this.y) === Infinity ||
            Math.abs(this.width) === Infinity ||
            Math.abs(this.height) === Infinity);
    };
    BBox.prototype.shrink = function (amount, position) {
        var _this = this;
        var apply = function (pos, amt) {
            switch (pos) {
                case 'top':
                    _this.y += amt;
                // eslint-disable-next-line no-fallthrough
                case 'bottom':
                    _this.height -= amt;
                    break;
                case 'left':
                    _this.x += amt;
                // eslint-disable-next-line no-fallthrough
                case 'right':
                    _this.width -= amt;
                    break;
                case 'vertical':
                    _this.y += amt;
                    _this.height -= amt * 2;
                    break;
                case 'horizontal':
                    _this.x += amt;
                    _this.width -= amt * 2;
                    break;
                default:
                    _this.x += amt;
                    _this.width -= amt * 2;
                    _this.y += amt;
                    _this.height -= amt * 2;
            }
        };
        if (typeof amount === 'number') {
            apply(position, amount);
        }
        else {
            Object.entries(amount).forEach(function (_a) {
                var _b = __read(_a, 2), pos = _b[0], amt = _b[1];
                return apply(pos, amt);
            });
        }
        return this;
    };
    BBox.prototype.grow = function (amount, position) {
        if (typeof amount === 'number') {
            this.shrink(-amount, position);
        }
        else {
            var paddingCopy = __assign({}, amount);
            for (var key in paddingCopy) {
                paddingCopy[key] *= -1;
            }
            this.shrink(paddingCopy);
        }
        return this;
    };
    BBox.merge = function (boxes) {
        var left = Infinity;
        var top = Infinity;
        var right = -Infinity;
        var bottom = -Infinity;
        boxes.forEach(function (box) {
            if (box.x < left) {
                left = box.x;
            }
            if (box.y < top) {
                top = box.y;
            }
            if (box.x + box.width > right) {
                right = box.x + box.width;
            }
            if (box.y + box.height > bottom) {
                bottom = box.y + box.height;
            }
        });
        return new BBox(left, top, right - left, bottom - top);
    };
    return BBox;
}());
export { BBox };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9iYm94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDZFQUE2RTtBQUM3RSxzRkFBc0Y7QUFDdEYsc0RBQXNEO0FBQ3RELDhCQUE4QjtBQUM5Qiw2REFBNkQ7QUFDN0QsaURBQWlEO0FBQ2pELDZCQUE2QjtBQUM3QixtREFBbUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXbkQ7SUFNSSxjQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFDM0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxvQkFBSyxHQUFMO1FBQ1UsSUFBQSxLQUEwQixJQUFJLEVBQTVCLENBQUMsT0FBQSxFQUFFLENBQUMsT0FBQSxFQUFFLEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBUyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELHFCQUFNLEdBQU4sVUFBTyxLQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDbEgsQ0FBQztJQUVELDRCQUFhLEdBQWIsVUFBYyxDQUFTLEVBQUUsQ0FBUztRQUM5QixPQUFPLENBQUMsSUFBSSxJQUFJ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