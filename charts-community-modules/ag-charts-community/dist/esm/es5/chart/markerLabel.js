var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Group } from '../scene/group';
import { Text } from '../scene/shape/text';
import { Square } from './marker/square';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { ProxyPropertyOnWrite } from '../util/proxy';
var MarkerLabel = /** @class */ (function (_super) {
    __extends(MarkerLabel, _super);
    function MarkerLabel() {
        var _this = _super.call(this, { name: 'markerLabelGroup' }) || this;
        _this.label = new Text();
        _this._marker = new Square();
        _this._markerSize = 15;
        _this._spacing = 8;
        var label = _this.label;
        label.textBaseline = 'middle';
        label.fontSize = 12;
        label.fontFamily = 'Verdana, sans-serif';
        label.fill = 'black';
        // For better looking vertical alignment of labels to markers.
        label.y = HdpiCanvas.has.textMetrics ? 1 : 0;
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
    return MarkerLabel;
}(Group));
export { MarkerLabel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyTGFiZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvbWFya2VyTGFiZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR2xELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRDtJQUFpQywrQkFBSztJQUtsQztRQUFBLFlBQ0ksa0JBQU0sRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxTQVl0QztRQWZPLFdBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBa0RuQixhQUFPLEdBQVcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQWEvQixpQkFBVyxHQUFXLEVBQUUsQ0FBQztRQVd6QixjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBckV6QixJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLEtBQUssQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUM7UUFDekMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDckIsOERBQThEO1FBQzlELEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdDLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFJLENB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