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
import { Padding } from "./util/padding";
import { Text } from "./scene/shape/text";
import { PointerEvents } from "./scene/node";
import { Observable, reactive } from "./util/observable";
var Caption = /** @class */ (function (_super) {
    __extends(Caption, _super);
    function Caption() {
        var _this = _super.call(this) || this;
        _this.node = new Text();
        _this.enabled = true;
        _this.padding = new Padding(10);
        var node = _this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
        return _this;
    }
    __decorate([
        reactive(['change'])
    ], Caption.prototype, "enabled", void 0);
    __decorate([
        reactive(['change'])
    ], Caption.prototype, "padding", void 0);
    __decorate([
        reactive(['change'], 'node.text')
    ], Caption.prototype, "text", void 0);
    __decorate([
        reactive(['change'], 'node.fontStyle')
    ], Caption.prototype, "fontStyle", void 0);
    __decorate([
        reactive(['change'], 'node.fontWeight')
    ], Caption.prototype, "fontWeight", void 0);
    __decorate([
        reactive(['change'], 'node.fontSize')
    ], Caption.prototype, "fontSize", void 0);
    __decorate([
        reactive(['change'], 'node.fontFamily')
    ], Caption.prototype, "fontFamily", void 0);
    __decorate([
        reactive(['change'], 'node.fill')
    ], Caption.prototype, "color", void 0);
    return Caption;
}(Observable));
export { Caption };
