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
class Caption {
    constructor() {
        this.node = new text_1.Text();
        this.enabled = false;
        this._text = '';
        this._fontSize = 10;
        this._fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    set text(value) {
        this._text = value;
        this.node.text = this._text;
    }
    get text() {
        return this._text;
    }
    set fontStyle(value) {
        this._fontStyle = value;
        this.node.fontStyle = this._fontStyle;
    }
    get fontStyle() {
        return this._fontStyle;
    }
    set fontWeight(value) {
        this._fontWeight = value;
        this.node.fontWeight = this._fontWeight;
    }
    get fontWeight() {
        return this._fontWeight;
    }
    set fontSize(value) {
        this._fontSize = value;
        this.node.fontSize = this._fontSize;
    }
    get fontSize() {
        return this._fontSize;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        this.node.fontFamily = this._fontFamily;
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set color(value) {
        this._color = value;
        this.node.fill = this._color;
    }
    get color() {
        return this._color;
    }
}
Caption.PADDING = 10;
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Caption.prototype, "enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], Caption.prototype, "_text", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FONT_STYLE)
], Caption.prototype, "_fontStyle", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
], Caption.prototype, "_fontWeight", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Caption.prototype, "_fontSize", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], Caption.prototype, "_fontFamily", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], Caption.prototype, "_color", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], Caption.prototype, "spacing", void 0);
exports.Caption = Caption;
