var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_NUMBER, STRING, Validate, } from './util/validation';
import { ProxyPropertyOnWrite } from './util/proxy';
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new Text();
        this.enabled = false;
        this.text = '';
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        this._lineHeight = undefined;
        var node = this.node;
        node.textAlign = 'center';
        node.pointerEvents = PointerEvents.None;
    }
    Object.defineProperty(Caption.prototype, "lineHeight", {
        get: function () {
            return this._lineHeight;
        },
        set: function (value) {
            this._lineHeight = value;
            this.node.lineHeight = value;
        },
        enumerable: false,
        configurable: true
    });
    Caption.PADDING = 10;
    __decorate([
        Validate(BOOLEAN)
    ], Caption.prototype, "enabled", void 0);
    __decorate([
        Validate(STRING),
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
    ], Caption.prototype, "_lineHeight", void 0);
    return Caption;
}());
export { Caption };
