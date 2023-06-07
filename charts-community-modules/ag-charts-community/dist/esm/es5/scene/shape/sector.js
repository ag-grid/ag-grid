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
import { Path, ScenePathChangeDetection } from './path';
import { normalizeAngle360 } from '../../util/angle';
import { isEqual } from '../../util/number';
import { isPointInSector } from '../../util/sector';
import { BBox } from '../bbox';
var Sector = /** @class */ (function (_super) {
    __extends(Sector, _super);
    function Sector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.innerRadius = 10;
        _this.outerRadius = 20;
        _this.startAngle = 0;
        _this.endAngle = Math.PI * 2;
        _this.angleOffset = 0;
        return _this;
    }
    Sector.prototype.computeBBox = function () {
        var radius = this.outerRadius;
        return new BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    };
    Sector.prototype.updatePath = function () {
        var path = this.path;
        var angleOffset = this.angleOffset;
        var startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        var endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        var innerRadius = Math.min(this.innerRadius, this.outerRadius);
        var outerRadius = Math.max(this.innerRadius, this.outerRadius);
        var fullPie = isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
        var centerX = this.centerX;
        var centerY = this.centerY;
        path.clear();
        if (fullPie) {
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
        }
        else {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
            else {
                path.lineTo(centerX, centerY);
            }
        }
        path.closePath();
        this.dirtyPath = false;
    };
    Sector.prototype.isPointInPath = function (x, y) {
        var angleOffset = this.angleOffset;
        var startAngle = this.startAngle + angleOffset;
        var endAngle = this.endAngle + angleOffset;
        var innerRadius = Math.min(this.innerRadius, this.outerRadius);
        var outerRadius = Math.max(this.innerRadius, this.outerRadius);
        var point = this.transformPoint(x, y);
        return isPointInSector(point.x, point.y, { startAngle: startAngle, endAngle: endAngle, innerRadius: innerRadius, outerRadius: outerRadius });
    };
    Sector.className = 'Sector';
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "centerX", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "centerY", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "innerRadius", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "outerRadius", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "startAngle", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "endAngle", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Sector.prototype, "angleOffset", void 0);
    return Sector;
}(Path));
export { Sector };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NoYXBlL3NlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUUvQjtJQUE0QiwwQkFBSTtJQUFoQztRQUFBLHFFQTRFQztRQXhFRyxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBR3BCLGFBQU8sR0FBVyxDQUFDLENBQUM7UUFHcEIsaUJBQVcsR0FBVyxFQUFFLENBQUM7UUFHekIsaUJBQVcsR0FBVyxFQUFFLENBQUM7UUFHekIsZ0JBQVUsR0FBVyxDQUFDLENBQUM7UUFHdkIsY0FBUSxHQUFXLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRy9CLGlCQUFXLEdBQVcsQ0FBQyxDQUFDOztJQXNENUIsQ0FBQztJQXBERyw0QkFBVyxHQUFYO1FBQ0ksSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNoQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRCwyQkFBVSxHQUFWO1FBQ0ksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV2QixJQUFNLFdBQVcsR0FB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