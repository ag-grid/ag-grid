"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var text_1 = require("./scene/shape/text");
var node_1 = require("./scene/node");
var observable_1 = require("./util/observable");
var Caption = /** @class */ (function (_super) {
    __extends(Caption, _super);
    function Caption() {
        var _this = _super.call(this) || this;
        _this.node = new text_1.Text();
        _this.enabled = false;
        var node = _this.node;
        node.textAlign = 'center';
        node.textBaseline = 'top';
        node.pointerEvents = node_1.PointerEvents.None;
        return _this;
    }
    Object.defineProperty(Caption.prototype, "text", {
        get: function () {
            return this.node.text;
        },
        set: function (value) {
            this.node.text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontStyle", {
        get: function () {
            return this.node.fontStyle;
        },
        set: function (value) {
            this.node.fontStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontWeight", {
        get: function () {
            return this.node.fontWeight;
        },
        set: function (value) {
            this.node.fontWeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontSize", {
        get: function () {
            return this.node.fontSize;
        },
        set: function (value) {
            this.node.fontSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "fontFamily", {
        get: function () {
            return this.node.fontFamily;
        },
        set: function (value) {
            this.node.fontFamily = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Caption.prototype, "color", {
        get: function () {
            return this.node.fill;
        },
        set: function (value) {
            this.node.fill = value;
        },
        enumerable: true,
        configurable: true
    });
    Caption.PADDING = 10;
    return Caption;
}(observable_1.Observable));
exports.Caption = Caption;
