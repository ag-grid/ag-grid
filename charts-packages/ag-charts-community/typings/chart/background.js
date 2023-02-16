"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = void 0;
var rect_1 = require("../scene/shape/rect");
var validation_1 = require("../util/validation");
var Background = /** @class */ (function () {
    function Background() {
        this.node = new rect_1.Rect();
        this._visible = true;
    }
    Object.defineProperty(Background.prototype, "width", {
        get: function () {
            return this.node.width;
        },
        set: function (value) {
            this.node.width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Background.prototype, "height", {
        get: function () {
            return this.node.height;
        },
        set: function (value) {
            this.node.height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Background.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            this._visible = value;
            this.node.visible = this._visible;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Background.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            this._fill = value;
            this.node.fill = this._fill;
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Background.prototype, "_visible", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], Background.prototype, "_fill", void 0);
    return Background;
}());
exports.Background = Background;
//# sourceMappingURL=background.js.map