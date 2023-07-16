"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianAxis = void 0;
var axis_1 = require("../../axis");
var validation_1 = require("../../util/validation");
var chartAxisDirection_1 = require("../chartAxisDirection");
var chartOptions_1 = require("../chartOptions");
var cartesianCrossLine_1 = require("../crossline/cartesianCrossLine");
var CartesianAxis = /** @class */ (function (_super) {
    __extends(CartesianAxis, _super);
    function CartesianAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.thickness = 0;
        _this.position = 'left';
        return _this;
    }
    Object.defineProperty(CartesianAxis.prototype, "direction", {
        get: function () {
            return ['top', 'bottom'].includes(this.position) ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
        },
        enumerable: false,
        configurable: true
    });
    CartesianAxis.prototype.updateDirection = function () {
        switch (this.position) {
            case 'top':
                this.rotation = -90;
                this.label.mirrored = true;
                this.label.parallel = true;
                break;
            case 'right':
                this.rotation = 0;
                this.label.mirrored = true;
                this.label.parallel = false;
                break;
            case 'bottom':
                this.rotation = -90;
                this.label.mirrored = false;
                this.label.parallel = true;
                break;
            case 'left':
                this.rotation = 0;
                this.label.mirrored = false;
                this.label.parallel = false;
                break;
        }
        if (this.axisContext) {
            this.axisContext.position = this.position;
            this.axisContext.direction = this.direction;
        }
    };
    CartesianAxis.prototype.update = function (primaryTickCount) {
        this.updateDirection();
        return _super.prototype.update.call(this, primaryTickCount);
    };
    CartesianAxis.prototype.createAxisContext = function () {
        return __assign(__assign({}, _super.prototype.createAxisContext.call(this)), { position: this.position });
    };
    CartesianAxis.prototype.assignCrossLineArrayConstructor = function (crossLines) {
        chartOptions_1.assignJsonApplyConstructedArray(crossLines, cartesianCrossLine_1.CartesianCrossLine);
    };
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], CartesianAxis.prototype, "thickness", void 0);
    __decorate([
        validation_1.Validate(validation_1.POSITION)
    ], CartesianAxis.prototype, "position", void 0);
    return CartesianAxis;
}(axis_1.Axis));
exports.CartesianAxis = CartesianAxis;
//# sourceMappingURL=cartesianAxis.js.map