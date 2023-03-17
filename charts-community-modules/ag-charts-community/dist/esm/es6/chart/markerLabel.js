var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from '../scene/group';
import { Text } from '../scene/shape/text';
import { Square } from './marker/square';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { ProxyPropertyOnWrite } from '../util/proxy';
export class MarkerLabel extends Group {
    constructor() {
        super({ name: 'markerLabelGroup' });
        this.label = new Text();
        this._marker = new Square();
        this._markerSize = 15;
        this._spacing = 8;
        const label = this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        // For better looking vertical alignment of labels to markers.
        label.y = HdpiCanvas.has.textMetrics ? 1 : 0;
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
    ProxyPropertyOnWrite('label')
], MarkerLabel.prototype, "text", void 0);
__decorate([
    ProxyPropertyOnWrite('label')
], MarkerLabel.prototype, "fontStyle", void 0);
__decorate([
    ProxyPropertyOnWrite('label')
], MarkerLabel.prototype, "fontWeight", void 0);
__decorate([
    ProxyPropertyOnWrite('label')
], MarkerLabel.prototype, "fontSize", void 0);
__decorate([
    ProxyPropertyOnWrite('label')
], MarkerLabel.prototype, "fontFamily", void 0);
__decorate([
    ProxyPropertyOnWrite('label', 'fill')
], MarkerLabel.prototype, "color", void 0);
__decorate([
    ProxyPropertyOnWrite('marker', 'fill')
], MarkerLabel.prototype, "markerFill", void 0);
__decorate([
    ProxyPropertyOnWrite('marker', 'stroke')
], MarkerLabel.prototype, "markerStroke", void 0);
__decorate([
    ProxyPropertyOnWrite('marker', 'strokeWidth')
], MarkerLabel.prototype, "markerStrokeWidth", void 0);
__decorate([
    ProxyPropertyOnWrite('marker', 'fillOpacity')
], MarkerLabel.prototype, "markerFillOpacity", void 0);
__decorate([
    ProxyPropertyOnWrite('marker', 'strokeOpacity')
], MarkerLabel.prototype, "markerStrokeOpacity", void 0);
