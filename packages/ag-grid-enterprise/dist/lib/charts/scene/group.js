// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./node");
var bbox_1 = require("./bbox");
var matrix_1 = require("./matrix");
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isContainerNode = true;
        _this.getBBox = function () {
            var left = Infinity;
            var right = -Infinity;
            var top = Infinity;
            var bottom = -Infinity;
            if (_this.dirtyTransform) {
                _this.computeTransformMatrix();
            }
            _this.children.forEach(function (child) {
                if (!child.visible) {
                    return;
                }
                var bbox = child.getBBox();
                if (!bbox) {
                    return;
                }
                if (!(child instanceof Group)) {
                    if (child.dirtyTransform) {
                        child.computeTransformMatrix();
                    }
                    var matrix = matrix_1.Matrix.flyweight(child.matrix);
                    var parent_1 = child.parent;
                    while (parent_1) {
                        matrix.preMultiplySelf(parent_1.matrix);
                        parent_1 = parent_1.parent;
                    }
                    matrix.transformBBox(bbox, 0, bbox);
                }
                var x = bbox.x;
                var y = bbox.y;
                if (x < left) {
                    left = x;
                }
                if (y < top) {
                    top = y;
                }
                if (x + bbox.width > right) {
                    right = x + bbox.width;
                }
                if (y + bbox.height > bottom) {
                    bottom = y + bbox.height;
                }
            });
            return new bbox_1.BBox(left, top, right - left, bottom - top);
        };
        return _this;
    }
    // We consider a group to be boundless, thus any point belongs to it.
    Group.prototype.isPointInNode = function (x, y) {
        return true;
    };
    Group.prototype.render = function (ctx) {
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var children = this.children;
        var n = children.length;
        for (var i = 0; i < n; i++) {
            ctx.save();
            var child = children[i];
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        }
        // debug
        // this.getBBox().render(ctx, {
        //     label: this.id,
        //     resetTransform: true,
        //     fillStyle: 'rgba(0, 0, 0, 0.5)'
        // });
    };
    Group.className = 'Group';
    return Group;
}(node_1.Node));
exports.Group = Group;
