"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = void 0;
const rect_1 = require("../../scene/shape/rect");
const group_1 = require("../../scene/group");
const module_1 = require("../../util/module");
const proxy_1 = require("../../util/proxy");
const validation_1 = require("../../util/validation");
const layers_1 = require("../layers");
class Background extends module_1.BaseModuleInstance {
    constructor(ctx) {
        var _a;
        super();
        this.onLayoutComplete = (e) => {
            const { width, height } = e.chart;
            this.rectNode.width = width;
            this.rectNode.height = height;
        };
        this.node = new group_1.Group({ name: 'background' });
        this.node.zIndex = layers_1.Layers.SERIES_BACKGROUND_ZINDEX;
        this.rectNode = new rect_1.Rect();
        this.node.appendChild(this.rectNode);
        this.fill = 'white';
        this.visible = true;
        (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(this.node);
        this.destroyFns.push(() => { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(this.node); });
        const layoutHandle = ctx.layoutService.addListener('layout-complete', this.onLayoutComplete);
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));
    }
    update() { }
}
__decorate([
    validation_1.Validate(validation_1.BOOLEAN),
    proxy_1.ProxyPropertyOnWrite('node', 'visible')
], Background.prototype, "visible", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING),
    proxy_1.ProxyPropertyOnWrite('rectNode', 'fill')
], Background.prototype, "fill", void 0);
exports.Background = Background;
