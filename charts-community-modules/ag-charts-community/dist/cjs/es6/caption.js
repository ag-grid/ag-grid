"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caption = void 0;
const text_1 = require("./scene/shape/text");
const node_1 = require("./scene/node");
const validation_1 = require("./util/validation");
const proxy_1 = require("./util/proxy");
class Caption {
    constructor() {
        this.node = new text_1.Text();
        this.enabled = false;
        this.text = '';
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        this._lineHeight = undefined;
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    get lineHeight() {
        return this._lineHeight;
    }
    set lineHeight(value) {
        this._lineHeight = value;
        this.node.lineHeight = value;
    }
}
Caption.PADDING = 10;
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Caption.prototype, "enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING),
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
], Caption.prototype, "_lineHeight", void 0);
exports.Caption = Caption;
