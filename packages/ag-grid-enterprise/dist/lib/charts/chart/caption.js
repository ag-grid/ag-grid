// ag-grid-enterprise v21.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var padding_1 = require("../util/padding");
var text_1 = require("../scene/shape/text");
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new text_1.Text();
        this._enabled = true;
        this._padding = new padding_1.Padding(10);
        this.node.textAlign = 'center';
        this.node.textBaseline = 'top';
    }
    Caption.create = function (text, font) {
        if (font === void 0) { font = 'bold 14px Verdana, sans-serif'; }
        var caption = new Caption();
        caption.text = text;
        caption.font = font;
        caption.requestLayout();
        return caption;
    };
    Object.defineProperty(Caption.prototype, "text", {
        get: function () {
            return this.node.text;
        },
        set: function (value) {
            if (this.node.text !== value) {
                this.node.text = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "font", {
        get: function () {
            return this.node.font;
        },
        set: function (value) {
            if (this.node.font !== value) {
                this.node.font = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "color", {
        get: function () {
            return this.node.fill || '';
        },
        set: function (value) {
            if (this.node.fill !== value) {
                this.node.fill = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "padding", {
        get: function () {
            return this._padding;
        },
        set: function (value) {
            if (this._padding !== value) {
                this._padding = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Caption.prototype.requestLayout = function () {
        if (this.onLayoutChange) {
            this.onLayoutChange();
        }
    };
    return Caption;
}());
exports.Caption = Caption;
