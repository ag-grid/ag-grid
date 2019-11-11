"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var padding_1 = require("./util/padding");
var text_1 = require("./scene/shape/text");
var node_1 = require("./scene/node");
var Caption = /** @class */ (function () {
    function Caption() {
        this.node = new text_1.Text();
        this._enabled = true;
        this._padding = new padding_1.Padding(10);
        var node = this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
    }
    Object.defineProperty(Caption.prototype, "text", {
        get: function () {
            return this.node.text;
        },
        set: function (value) {
            if (this.node.text !== value) {
                this.node.text = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontStyle", {
        get: function () {
            return this.node.fontStyle;
        },
        set: function (value) {
            if (this.node.fontStyle !== value) {
                this.node.fontStyle = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontWeight", {
        get: function () {
            return this.node.fontWeight;
        },
        set: function (value) {
            if (this.node.fontWeight !== value) {
                this.node.fontWeight = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontSize", {
        get: function () {
            return this.node.fontSize;
        },
        set: function (value) {
            if (this.node.fontSize !== value) {
                this.node.fontSize = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontFamily", {
        get: function () {
            return this.node.fontFamily;
        },
        set: function (value) {
            if (this.node.fontFamily !== value) {
                this.node.fontFamily = value;
                this.update();
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
                this.update();
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
                this.update();
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
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Caption.prototype.update = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    return Caption;
}());
exports.Caption = Caption;
