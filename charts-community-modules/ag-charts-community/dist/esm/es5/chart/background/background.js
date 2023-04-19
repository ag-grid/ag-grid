var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { Rect } from '../../scene/shape/rect';
import { Group } from '../../scene/group';
import { BaseModuleInstance } from '../../util/module';
import { ProxyPropertyOnWrite } from '../../util/proxy';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../../util/validation';
import { Layers } from '../layers';
var Background = /** @class */ (function (_super) {
    __extends(Background, _super);
    function Background(ctx) {
        var _a;
        var _this = _super.call(this) || this;
        _this.onLayoutComplete = function (e) {
            var _a = e.chart, width = _a.width, height = _a.height;
            _this.rectNode.width = width;
            _this.rectNode.height = height;
        };
        _this.node = new Group({ name: 'background' });
        _this.node.zIndex = Layers.SERIES_BACKGROUND_ZINDEX;
        _this.rectNode = new Rect();
        _this.node.appendChild(_this.rectNode);
        _this.fill = 'white';
        _this.visible = true;
        (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(_this.node);
        _this.destroyFns.push(function () { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(_this.node); });
        var layoutHandle = ctx.layoutService.addListener('layout-complete', _this.onLayoutComplete);
        _this.destroyFns.push(function () { return ctx.layoutService.removeListener(layoutHandle); });
        return _this;
    }
    Background.prototype.update = function () { };
    __decorate([
        Validate(BOOLEAN),
        ProxyPropertyOnWrite('node', 'visible')
    ], Background.prototype, "visible", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        ProxyPropertyOnWrite('rectNode', 'fill')
    ], Background.prototype, "fill", void 0);
    return Background;
}(BaseModuleInstance));
export { Background };
