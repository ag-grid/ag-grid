"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caption = void 0;
var text_1 = require("./scene/shape/text");
var node_1 = require("./scene/node");
var validation_1 = require("./util/validation");
var proxy_1 = require("./util/proxy");
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new text_1.Text();
        this.enabled = false;
        this.text = undefined;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        this.lineHeight = undefined;
        this.maxWidth = undefined;
        this.maxHeight = undefined;
        this.wrapping = 'always';
        var node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    Caption.prototype.computeTextWrap = function (containerWidth, containerHeight) {
        var _a, _b;
        var _c = this, text = _c.text, wrapping = _c.wrapping;
        var maxWidth = Math.min((_a = this.maxWidth) !== null && _a !== void 0 ? _a : Infinity, containerWidth);
        var maxHeight = (_b = this.maxHeight) !== null && _b !== void 0 ? _b : containerHeight;
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        var wrapped = text_1.Text.wrap(text !== null && text !== void 0 ? text : '', maxWidth, maxHeight, this, wrapping);
        this.node.text = wrapped;
    };
    Caption.PADDING = 10;
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Caption.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING),
        proxy_1.ProxyPropertyOnWrite('node')
    ], Caption.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE),
        proxy_1.ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT),
        proxy_1.ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0)),
        proxy_1.ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING),
        proxy_1.ProxyPropertyOnWrite('node')
    ], Caption.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING),
        proxy_1.ProxyPropertyOnWrite('node', 'fill')
    ], Caption.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], Caption.prototype, "spacing", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], Caption.prototype, "lineHeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], Caption.prototype, "maxWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], Caption.prototype, "maxHeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.TEXT_WRAP)
    ], Caption.prototype, "wrapping", void 0);
    return Caption;
}());
exports.Caption = Caption;
//# sourceMappingURL=caption.js.map