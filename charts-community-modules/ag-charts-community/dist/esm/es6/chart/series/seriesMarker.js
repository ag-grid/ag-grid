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
const MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
const MARKER_SHAPE = predicateWithMessage((v) => MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === Marker, `expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class`);
export class SeriesMarker extends ChangeDetectable {
    constructor() {
        super(...arguments);
        this.enabled = true;
        /**
         * One of the predefined marker names, or a marker constructor function (for user-defined markers).
         * A series will create one marker instance per data point.
         */
        this.shape = Circle;
        this.size = 6;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
         * and the lowest to the `size`.
         */
        this.maxSize = 30;
        this.domain = undefined;
        this.fill = undefined;
        this.stroke = undefined;
        this.strokeWidth = 1;
        this.fillOpacity = undefined;
        this.strokeOpacity = undefined;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzTWFya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9zZXJpZXNNYXJrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDbEcsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLFFBQVEsR0FDWCxNQUFNLHVCQUF1QixDQUFDO0FBRS9CLE1BQU0sYUFBYSxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUYsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQ3JDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUM1RSxrSEFBa0gsQ0FDckgsQ0FBQztBQUVGLE1BQU0sT0FBTyxZQUFhLFNBQVEsZ0JBQWdCO0lBQWxEOztRQUdJLFlBQU8sR0FBRyxJQUFJLENBQUM7UUFFZjs7O1dBR0c7UUFHSCxVQUFLLEdBQWdDLE1BQU0sQ0FBQztRQUk1QyxTQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRVQ7Ozs7O1dBS0c7UUFHSCxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBSWIsV0FBTSxHQUFzQixTQUFTLENBQUM7UUFJdEMsU0FBSSxHQUFZLFNBQVMsQ0FBQztRQUkxQixXQUFNLEdBQVksU0FBUyxDQUFDO1FBSTVCLGdCQUFXLEdBQVksQ0FBQyxDQUFDO1FBSXpCLGdCQUFXLEdBQVksU0FBUyxDQUFDO1FBSWpDLGtCQUFhLEdBQVksU0FBUyxDQUFDO0lBQ3ZDLENBQUM7Q0FBQTtBQS9DRztJQUZDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDakIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOzZDQUNwQztBQVFmO0lBRkMsUUFBUSxDQUFDLFlBQVksQ0FBQztJQUN0QixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7MkNBQ1A7QUFJNUM7SUFGQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzswQ0FDMUM7QUFVVDtJQUZDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOzZDQUN0QztBQUliO0lBRkMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO0lBQzFCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0Q0FDYjtBQUl0QztJQUZDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztJQUMxQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7MENBQ3pCO0FBSTFCO0lBRkMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO0lBQzFCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0Q0FDdkI7QUFJNUI7SUFGQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpREFDMUI7QUFJekI7SUFGQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQixvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7aURBQ2xCO0FBSWpDO0lBRkMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO21EQUNoQiJ9