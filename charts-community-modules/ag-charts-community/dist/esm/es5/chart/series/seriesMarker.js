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
import { Marker } from '../marker/marker';
import { Circle } from '../marker/circle';
import { ChangeDetectable, RedrawType, SceneChangeDetection } from '../../scene/changeDetectable';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_NUMBER, OPT_NUMBER_ARRAY, predicateWithMessage, Validate, } from '../../util/validation';
var MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
var MARKER_SHAPE = predicateWithMessage(function (v) { return MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === Marker; }, "expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class");
var SeriesMarker = /** @class */ (function (_super) {
    __extends(SeriesMarker, _super);
    function SeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        /**
         * One of the predefined marker names, or a marker constructor function (for user-defined markers).
         * A series will create one marker instance per data point.
         */
        _this.shape = Circle;
        _this.size = 6;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
         * and the lowest to the `size`.
         */
        _this.maxSize = 30;
        _this.domain = undefined;
        _this.fill = undefined;
        _this.stroke = undefined;
        _this.strokeWidth = 1;
        _this.fillOpacity = undefined;
        _this.strokeOpacity = undefined;
        return _this;
    }
    __decorate([
        Validate(BOOLEAN),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "enabled", void 0);
    __decorate([
        Validate(MARKER_SHAPE),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "shape", void 0);
    __decorate([
        Validate(NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "size", void 0);
    __decorate([
        Validate(NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "maxSize", void 0);
    __decorate([
        Validate(OPT_NUMBER_ARRAY),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "domain", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "stroke", void 0);
    __decorate([
        Validate(OPT_NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "strokeWidth", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "strokeOpacity", void 0);
    return SeriesMarker;
}(ChangeDetectable));
export { SeriesMarker };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzTWFya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9zZXJpZXNNYXJrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDbEcsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLFFBQVEsR0FDWCxNQUFNLHVCQUF1QixDQUFDO0FBRS9CLElBQU0sYUFBYSxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUYsSUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQ3JDLFVBQUMsQ0FBTSxJQUFLLE9BQUEsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sRUFBaEUsQ0FBZ0UsRUFDNUUsa0hBQWtILENBQ3JILENBQUM7QUFFRjtJQUFrQyxnQ0FBZ0I7SUFBbEQ7UUFBQSxxRUFrREM7UUEvQ0csYUFBTyxHQUFHLElBQUksQ0FBQztRQUVmOzs7V0FHRztRQUdILFdBQUssR0FBZ0MsTUFBTSxDQUFDO1FBSTVDLFVBQUksR0FBRyxDQUFDLENBQUM7UUFFVDs7Ozs7V0FLRztRQUdILGFBQU8sR0FBRyxFQUFFLENBQUM7UUFJYixZQUFNLEdBQXNCLFNBQVMsQ0FBQztRQUl0QyxVQUFJLEdBQVksU0FBUyxDQUFDO1FBSTFCLFlBQU0sR0FBWSxTQUFTLENBQUM7UUFJNUIsaUJBQVcsR0FBWSxDQUFDLENBQUM7UUFJekIsaUJBQVcsR0FBWSxTQUFTLENBQUM7UUFJakMsbUJBQWEsR0FBWSxTQUFTLENBQUM7O0lBQ3ZDLENBQUM7SUEvQ0c7UUFGQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ2pCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpREFDcEM7SUFRZjtRQUZDLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDdEIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOytDQUNQO0lBSTVDO1FBRkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7OENBQzFDO0lBVVQ7UUFGQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpREFDdEM7SUFJYjtRQUZDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUMxQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0RBQ2I7SUFJdEM7UUFGQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7UUFDMUIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOzhDQUN6QjtJQUkxQjtRQUZDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUMxQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0RBQ3ZCO0lBSTVCO1FBRkMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7cURBQzFCO0lBSXpCO1FBRkMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO3FEQUNsQjtJQUlqQztRQUZDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzt1REFDaEI7SUFDdkMsbUJBQUM7Q0FBQSxBQWxERCxDQUFrQyxnQkFBZ0IsR0FrRGpEO1NBbERZLFlBQVkifQ==