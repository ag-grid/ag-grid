var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Text } from './scene/shape/text.mjs';
import { PointerEvents } from './scene/node.mjs';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_NUMBER, OPT_STRING, STRING, TEXT_WRAP, Validate, } from './util/validation.mjs';
import { ProxyPropertyOnWrite } from './util/proxy.mjs';
export class Caption {
    constructor() {
        this.node = new Text();
        this.enabled = false;
        this.text = undefined;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        this.lineHeight = undefined;
        this.maxWidth = undefined;
        this.maxHeight = undefined;
        this.wrapping = 'always';
        const node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }
    computeTextWrap(containerWidth, containerHeight) {
        var _a, _b;
        const { text, wrapping } = this;
        const maxWidth = Math.min((_a = this.maxWidth) !== null && _a !== void 0 ? _a : Infinity, containerWidth);
        const maxHeight = (_b = this.maxHeight) !== null && _b !== void 0 ? _b : containerHeight;
        if (!isFinite(maxWidth) && !isFinite(maxHeight)) {
            this.node.text = text;
            return;
        }
        const wrapped = Text.wrap(text !== null && text !== void 0 ? text : '', maxWidth, maxHeight, this, wrapping);
        this.node.text = wrapped;
    }
}
Caption.PADDING = 10;
__decorate([
    Validate(BOOLEAN)
], Caption.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_STRING),
    ProxyPropertyOnWrite('node')
], Caption.prototype, "text", void 0);
__decorate([
    Validate(OPT_FONT_STYLE),
    ProxyPropertyOnWrite('node')
], Caption.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT),
    ProxyPropertyOnWrite('node')
], Caption.prototype, "fontWeight", void 0);
__decorate([
    Validate(NUMBER(0)),
    ProxyPropertyOnWrite('node')
], Caption.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING),
    ProxyPropertyOnWrite('node')
], Caption.prototype, "fontFamily", void 0);
__decorate([
    Validate(OPT_COLOR_STRING),
    ProxyPropertyOnWrite('node', 'fill')
], Caption.prototype, "color", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Caption.prototype, "spacing", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Caption.prototype, "lineHeight", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Caption.prototype, "maxWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Caption.prototype, "maxHeight", void 0);
__decorate([
    Validate(TEXT_WRAP)
], Caption.prototype, "wrapping", void 0);
