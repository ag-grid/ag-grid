// ag-grid-enterprise v21.2.2
"use strict";
// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
Object.defineProperty(exports, "__esModule", { value: true });
var BBox = /** @class */ (function () {
    function BBox(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    BBox.prototype.dilate = function (value) {
        this.x -= value;
        this.y -= value;
        this.width += value * 2;
        this.height += value * 2;
    };
    BBox.prototype.containsPoint = function (x, y) {
        return x >= this.x && x <= (this.x + this.width)
            && y >= this.y && y <= (this.y + this.height);
    };
    BBox.prototype.render = function (ctx, params) {
        if (params === void 0) { params = BBox.noParams; }
        ctx.save();
        if (params.resetTransform) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.strokeStyle = params.strokeStyle || 'cyan';
        ctx.lineWidth = params.lineWidth || 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (params.label) {
            ctx.fillStyle = params.fillStyle || 'black';
            ctx.textBaseline = 'bottom';
            ctx.fillText(params.label, this.x, this.y);
        }
        ctx.restore();
    };
    BBox.noParams = {};
    return BBox;
}());
exports.BBox = BBox;
