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
var group_1 = require("../scene/group");
var proxy_1 = require("../util/proxy");
var validation_1 = require("../util/validation");
var Background = /** @class */ (function () {
    function Background(imageLoadCallback) {
        this.image = undefined;
        this.node = new group_1.Group();
        this.rectNode = new rect_1.Rect();
        this.node.appendChild(this.rectNode);
        this.visible = true;
        this.imageLoadCallback = imageLoadCallback;
    }
    Background.prototype.performLayout = function (width, height) {
        this.rectNode.width = width;
        this.rectNode.height = height;
        if (this.image) {
            this.image.performLayout(width, height);
        }
    };
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN),
        proxy_1.ProxyPropertyOnWrite('node', 'visible')
    ], Background.prototype, "visible", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING),
        proxy_1.ProxyPropertyOnWrite('rectNode', 'fill')
    ], Background.prototype, "fill", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            newValue: function (image) {
                this.node.appendChild(image.node);
                image.onload = this.imageLoadCallback;
            },
            oldValue: function (image) {
                this.node.removeChild(image.node);
                image.onload = undefined;
            },
        })
    ], Background.prototype, "image", void 0);
    return Background;
}());
exports.Background = Background;
//# sourceMappingURL=background.js.map