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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = void 0;
var rect_1 = require("../../scene/shape/rect");
var group_1 = require("../../scene/group");
var module_1 = require("../../util/module");
var proxy_1 = require("../../util/proxy");
var validation_1 = require("../../util/validation");
var layers_1 = require("../layers");
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
        _this.node = new group_1.Group({ name: 'background' });
        _this.node.zIndex = layers_1.Layers.SERIES_BACKGROUND_ZINDEX;
        _this.rectNode = new rect_1.Rect();
        _this.node.appendChild(_this.rectNode);
        _this.fill = 'white';
        _this.visible = true;
        (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(_this.node);
        _this.destroyFns.push(function () { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(_this.node); });
        var layoutHandle = ctx.layoutService.addListener('layout-complete', _this.onLayoutComplete);
        _this.destroyFns.push(function () { return ctx.layoutService.removeListener(layoutHandle); });
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN),
        proxy_1.ProxyPropertyOnWrite('node', 'visible')
    ], Background.prototype, "visible", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING),
        proxy_1.ProxyPropertyOnWrite('rectNode', 'fill')
    ], Background.prototype, "fill", void 0);
    return Background;
}(module_1.BaseModuleInstance));
exports.Background = Background;
//# sourceMappingURL=background.js.map