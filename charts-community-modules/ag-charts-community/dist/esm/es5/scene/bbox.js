// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
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
        switch (position) {
            case 'top':
                this.y += amount;
            // eslint-disable-next-line no-fallthrough
            case 'bottom':
                this.height -= amount;
                break;
            case 'left':
                this.x += amount;
            // eslint-disable-next-line no-fallthrough
            case 'right':
                this.width -= amount;
                break;
            case 'vertical':
                this.y += amount;
                this.height -= amount * 2;
                break;
            case 'horizontal':
                this.x += amount;
                this.width -= amount * 2;
                break;
            default:
                this.x += amount;
                this.width -= amount * 2;
                this.y += amount;
                this.height -= amount * 2;
        }
    };
    BBox.prototype.grow = function (amount, position) {
        this.shrink(-amount, position);
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
