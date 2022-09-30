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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Rect } from '../scene/shape/rect';
import { Observable } from '../util/observable';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';
var Background = /** @class */ (function (_super) {
    __extends(Background, _super);
    function Background() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.node = new Rect();
        _this._visible = true;
        return _this;
    }
    Object.defineProperty(Background.prototype, "width", {
        get: function () {
            return this.node.width;
        },
        set: function (value) {
            this.node.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Background.prototype, "height", {
        get: function () {
            return this.node.height;
        },
        set: function (value) {
            this.node.height = value;
        },
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
        configurable: true
    });
    __decorate([
        Validate(BOOLEAN)
    ], Background.prototype, "_visible", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], Background.prototype, "_fill", void 0);
    return Background;
}(Observable));
export { Background };
