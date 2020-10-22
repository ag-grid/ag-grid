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
import { Observable, reactive } from "../util/observable";
var DropShadow = /** @class */ (function (_super) {
    __extends(DropShadow, _super);
    function DropShadow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        _this.color = 'rgba(0, 0, 0, 0.5)';
        _this.xOffset = 0;
        _this.yOffset = 0;
        _this.blur = 5;
        return _this;
    }
    __decorate([
        reactive('change')
    ], DropShadow.prototype, "enabled", void 0);
    __decorate([
        reactive('change')
    ], DropShadow.prototype, "color", void 0);
    __decorate([
        reactive('change')
    ], DropShadow.prototype, "xOffset", void 0);
    __decorate([
        reactive('change')
    ], DropShadow.prototype, "yOffset", void 0);
    __decorate([
        reactive('change')
    ], DropShadow.prototype, "blur", void 0);
    return DropShadow;
}(Observable));
export { DropShadow };
