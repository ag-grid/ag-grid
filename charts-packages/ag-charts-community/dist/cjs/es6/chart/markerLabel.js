"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkerLabel = void 0;
const group_1 = require("../scene/group");
const text_1 = require("../scene/shape/text");
const square_1 = require("./marker/square");
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
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
    set text(value) {
        this.label.text = value;
    }
    get text() {
        return this.label.text;
    }
    set fontStyle(value) {
        this.label.fontStyle = value;
    }
    get fontStyle() {
        return this.label.fontStyle;
    }
    set fontWeight(value) {
        this.label.fontWeight = value;
    }
    get fontWeight() {
        return this.label.fontWeight;
    }
    set fontSize(value) {
        this.label.fontSize = value;
    }
    get fontSize() {
        return this.label.fontSize;
    }
    set fontFamily(value) {
        this.label.fontFamily = value;
    }
    get fontFamily() {
        return this.label.fontFamily;
    }
    set color(value) {
        this.label.fill = value;
    }
    get color() {
        return this.label.fill;
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
    set markerFill(value) {
        this.marker.fill = value;
    }
    get markerFill() {
        return this.marker.fill;
    }
    set markerStroke(value) {
        this.marker.stroke = value;
    }
    get markerStroke() {
        return this.marker.stroke;
    }
    set markerStrokeWidth(value) {
        this.marker.strokeWidth = value;
    }
    get markerStrokeWidth() {
        return this.marker.strokeWidth;
    }
    set markerFillOpacity(value) {
        this.marker.fillOpacity = value;
    }
    get markerFillOpacity() {
        return this.marker.fillOpacity;
    }
    set markerStrokeOpacity(value) {
        this.marker.strokeOpacity = value;
    }
    get markerStrokeOpacity() {
        return this.marker.strokeOpacity;
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
exports.MarkerLabel = MarkerLabel;
MarkerLabel.className = 'MarkerLabel';
