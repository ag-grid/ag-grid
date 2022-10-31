var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { Text } from './scene/shape/text';
import { PointerEvents } from './scene/node';
import { Observable } from './util/observable';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_FONT_STYLE, OPT_FONT_WEIGHT, STRING, Validate, } from './util/validation';
var Caption = /** @class */ (function (_super) {
    __extends(Caption, _super);
    function Caption() {
        var _this = _super.call(this) || this;
        _this.node = new Text();
        _this.enabled = false;
        _this._text = '';
        _this._fontSize = 10;
        _this._fontFamily = 'sans-serif';
        var node = _this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = PointerEvents.None;
        return _this;
    }
    Object.defineProperty(Caption.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            this._text = value;
            this.node.text = this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontStyle", {
        get: function () {
            return this._fontStyle;
        },
        set: function (value) {
            this._fontStyle = value;
            this.node.fontStyle = this._fontStyle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontWeight", {
        get: function () {
            return this._fontWeight;
        },
        set: function (value) {
            this._fontWeight = value;
            this.node.fontWeight = this._fontWeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontSize", {
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            this._fontSize = value;
            this.node.fontSize = this._fontSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontFamily", {
        get: function () {
            return this._fontFamily;
        },
        set: function (value) {
            this._fontFamily = value;
            this.node.fontFamily = this._fontFamily;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (value) {
            this._color = value;
            this.node.fill = this._color;
        },
        enumerable: true,
        configurable: true
    });
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
    return Caption;
}(Observable));
export { Caption };
