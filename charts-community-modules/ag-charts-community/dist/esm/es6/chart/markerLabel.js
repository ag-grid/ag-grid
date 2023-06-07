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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyTGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvbWFya2VyTGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR2xELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRCxNQUFNLE9BQU8sV0FBWSxTQUFRLEtBQUs7SUFLbEM7UUFDSSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBSGhDLFVBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBa0RuQixZQUFPLEdBQVcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQWEvQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQVd6QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBckV6QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLEtBQUssQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUM7UUFDekMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDckIsOERBQThEO1FBQzlELEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMs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