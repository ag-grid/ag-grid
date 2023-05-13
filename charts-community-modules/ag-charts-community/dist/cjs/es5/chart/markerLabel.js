"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkerLabel = void 0;
var group_1 = require("../scene/group");
var text_1 = require("../scene/shape/text");
var square_1 = require("./marker/square");
var hdpiCanvas_1 = require("../canvas/hdpiCanvas");
var proxy_1 = require("../util/proxy");
var MarkerLabel = /** @class */ (function (_super) {
    __extends(MarkerLabel, _super);
    function MarkerLabel() {
        var _this = _super.call(this, { name: 'markerLabelGroup' }) || this;
        _this.label = new text_1.Text();
        _this._marker = new square_1.Square();
        _this._markerSize = 15;
        _this._spacing = 8;
        var label = _this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        // For better looking vertical alignment of labels to markers.
        label.y = hdpiCanvas_1.HdpiCanvas.has.textMetrics ? 1 : 0;
        _this.append([_this.marker, label]);
        _this.update();
        return _this;
    }
    Object.defineProperty(MarkerLabel.prototype, "marker", {
        get: function () {
            return this._marker;
        },
        set: function (value) {
            if (this._marker !== value) {
                this.removeChild(this._marker);
                this._marker = value;
                this.appendChild(value);
                this.update();
            }
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MarkerLabel.prototype, "spacing", {
        get: function () {
            return this._spacing;
        },
        set: function (value) {
            if (this._spacing !== value) {
                this._spacing = value;
                this.update();
            }
        },
        enumerable: false,
        configurable: true
    });
    MarkerLabel.prototype.update = function () {
        var marker = this.marker;
        var markerSize = this.markerSize;
        marker.size = markerSize;
        this.label.x = markerSize / 2 + this.spacing;
    };
    MarkerLabel.prototype.render = function (renderCtx) {
        // Cannot override field Group.opacity with get/set pair, so
        // propagate opacity changes here.
        this.marker.opacity = this.opacity;
        this.label.opacity = this.opacity;
        _super.prototype.render.call(this, renderCtx);
    };
    MarkerLabel.className = 'MarkerLabel';
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label')
    ], MarkerLabel.prototype, "text", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label')
    ], MarkerLabel.prototype, "fontStyle", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label')
    ], MarkerLabel.prototype, "fontWeight", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label')
    ], MarkerLabel.prototype, "fontSize", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label')
    ], MarkerLabel.prototype, "fontFamily", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('label', 'fill')
    ], MarkerLabel.prototype, "color", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('marker', 'fill')
    ], MarkerLabel.prototype, "markerFill", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('marker', 'stroke')
    ], MarkerLabel.prototype, "markerStroke", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('marker', 'strokeWidth')
    ], MarkerLabel.prototype, "markerStrokeWidth", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('marker', 'fillOpacity')
    ], MarkerLabel.prototype, "markerFillOpacity", void 0);
    __decorate([
        proxy_1.ProxyPropertyOnWrite('marker', 'strokeOpacity')
    ], MarkerLabel.prototype, "markerStrokeOpacity", void 0);
    return MarkerLabel;
}(group_1.Group));
exports.MarkerLabel = MarkerLabel;
