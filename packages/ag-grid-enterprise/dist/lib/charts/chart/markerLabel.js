// ag-grid-enterprise v21.0.1
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
var group_1 = require("../scene/group");
var rect_1 = require("../scene/shape/rect");
var text_1 = require("../scene/shape/text");
var MarkerLabel = /** @class */ (function (_super) {
    __extends(MarkerLabel, _super);
    function MarkerLabel() {
        var _this = _super.call(this) || this;
        _this.marker = new rect_1.Rect();
        _this.label = new text_1.Text();
        _this._markerSize = MarkerLabel.defaults.markerSize;
        _this._padding = MarkerLabel.defaults.padding;
        _this.marker.crisp = true;
        var label = _this.label;
        label.textBaseline = 'middle';
        label.font = MarkerLabel.defaults.labelFont;
        label.fill = MarkerLabel.defaults.labelColor;
        label.y = 2; // for better looking vertical alignment of labels to markers
        _this.append([_this.marker, label]);
        _this.update();
        return _this;
    }
    Object.defineProperty(MarkerLabel.prototype, "labelText", {
        get: function () {
            return this.label.text;
        },
        set: function (value) {
            this.label.text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "labelFont", {
        get: function () {
            return this.label.font;
        },
        set: function (value) {
            this.label.font = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "labelColor", {
        get: function () {
            return this.label.fill;
        },
        set: function (value) {
            this.label.fill = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "markerSize", {
        get: function () {
            return this._markerSize;
        },
        set: function (value) {
            if (this._markerSize !== value) {
                this._markerSize = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "markerFill", {
        get: function () {
            return this.marker.fill;
        },
        set: function (value) {
            this.marker.fill = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "markerStroke", {
        get: function () {
            return this.marker.stroke;
        },
        set: function (value) {
            this.marker.stroke = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "markerStrokeWidth", {
        get: function () {
            return this.marker.strokeWidth;
        },
        set: function (value) {
            this.marker.strokeWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "opacity", {
        get: function () {
            return this.marker.opacity;
        },
        set: function (value) {
            this.marker.opacity = value;
            this.label.opacity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "padding", {
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
    MarkerLabel.prototype.update = function () {
        var marker = this.marker;
        var markerSize = this.markerSize;
        marker.x = -markerSize / 2;
        marker.y = -markerSize / 2;
        marker.width = markerSize;
        marker.height = markerSize;
        this.label.x = markerSize / 2 + this.padding;
    };
    MarkerLabel.className = 'MarkerLabel';
    MarkerLabel.defaults = Object.freeze({
        padding: 4,
        markerSize: 14,
        labelFont: '12px Verdana, sans-serif',
        labelColor: 'black'
    });
    return MarkerLabel;
}(group_1.Group));
exports.MarkerLabel = MarkerLabel;
