"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BBox = void 0;
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
exports.BBox = BBox;
