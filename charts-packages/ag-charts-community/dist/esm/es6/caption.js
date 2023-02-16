var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_NUMBER, STRING, Validate, } from './util/validation';
export class Caption {
    constructor() {
        this.node = new Text();
        this.enabled = false;
        this._text = '';
        this._fontSize = 10;
        this._fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        const node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
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
    Validate(BOOLEAN)
], Caption.prototype, "enabled", void 0);
__decorate([
    Validate(STRING)
], Caption.prototype, "_text", void 0);
__decorate([
    Validate(OPT_FONT_STYLE)
], Caption.prototype, "_fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], Caption.prototype, "_fontWeight", void 0);
__decorate([
    Validate(NUMBER(0))
], Caption.prototype, "_fontSize", void 0);
__decorate([
    Validate(STRING)
], Caption.prototype, "_fontFamily", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], Caption.prototype, "_color", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Caption.prototype, "spacing", void 0);
