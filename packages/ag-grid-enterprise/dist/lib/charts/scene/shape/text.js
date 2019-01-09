// ag-grid-enterprise v20.0.0
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
var shape_1 = require("./shape");
var object_1 = require("../../util/object");
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Text.prototype.isPointInPath = function (ctx, x, y) {
        return false;
    };
    Text.prototype.isPointInStroke = function (ctx, x, y) {
        return false;
    };
    Text.prototype.render = function (ctx) {
        if (this.scene) {
            this.applyContextAttributes(ctx);
            // this.scene.appendPath(this.path);
            ctx.fill();
            ctx.stroke();
        }
        this.dirty = false;
    };
    Text.defaults = object_1.chainObjects(shape_1.Shape.defaults, {
        fillStyle: 'black',
        x: 0,
        y: 0
    });
    return Text;
}(shape_1.Shape));
exports.Text = Text;
