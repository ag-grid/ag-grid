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
import { Observable } from './observable';
import { NUMBER, Validate } from './validation';
var Padding = /** @class */ (function (_super) {
    __extends(Padding, _super);
    function Padding(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = top; }
        if (bottom === void 0) { bottom = top; }
        if (left === void 0) { left = right; }
        var _this = _super.call(this) || this;
        _this.top = top;
        _this.right = right;
        _this.bottom = bottom;
        _this.left = left;
        return _this;
    }
    Padding.prototype.clear = function () {
        this.top = this.right = this.bottom = this.left = 0;
    };
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "top", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "right", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "bottom", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "left", void 0);
    return Padding;
}(Observable));
export { Padding };
