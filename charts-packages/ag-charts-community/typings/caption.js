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
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new text_1.Text();
        this.enabled = false;
        this._text = '';
        this._fontSize = 10;
        this._fontFamily = 'sans-serif';
        this.spacing = Caption.PADDING;
        var node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    Object.defineProperty(Caption.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            this._text = value;
            this.node.text = this._text;
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
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
    return Caption;
}());
exports.Caption = Caption;
//# sourceMappingURL=caption.js.map