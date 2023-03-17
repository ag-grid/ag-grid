"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkerLabel = void 0;
const group_1 = require("../scene/group");
const text_1 = require("../scene/shape/text");
const square_1 = require("./marker/square");
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const proxy_1 = require("../util/proxy");
class MarkerLabel extends group_1.Group {
    constructor() {
        super({ name: 'markerLabelGroup' });
        this.label = new text_1.Text();
        this._marker = new square_1.Square();
        this._markerSize = 15;
        this._spacing = 8;
        const label = this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        // For better looking vertical alignment of labels to markers.
        label.y = hdpiCanvas_1.HdpiCanvas.has.textMetrics ? 1 : 0;
        this.append([this.marker, label]);
        this.update();
    }
    set marker(value) {
        if (this._marker !== value) {
            this.removeChild(this._marker);
            this._marker = value;
            this.appendChild(value);
            this.update();
        }
    }
    get marker() {
        return this._marker;
    }
    set markerSize(value) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.update();
        }
    }
    get markerSize() {
        return this._markerSize;
    }
    set spacing(value) {
        if (this._spacing !== value) {
            this._spacing = value;
            this.update();
        }
    }
    get spacing() {
        return this._spacing;
    }
    update() {
        const marker = this.marker;
        const markerSize = this.markerSize;
        marker.size = markerSize;
        this.label.x = markerSize / 2 + this.spacing;
    }
    render(renderCtx) {
        // Cannot override field Group.opacity with get/set pair, so
        // propagate opacity changes here.
        this.marker.opacity = this.opacity;
        this.label.opacity = this.opacity;
        super.render(renderCtx);
    }
}
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
exports.MarkerLabel = MarkerLabel;
