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
import { Gradient } from './gradient';
import { toRadians, normalizeAngle360 } from '../../util/angle';
var LinearGradient = /** @class */ (function (_super) {
    __extends(LinearGradient, _super);
    function LinearGradient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.angle = 0;
        return _this;
    }
    LinearGradient.prototype.createGradient = function (ctx, bbox) {
        // Gradient 0° angle starts at top according to CSS spec
        var angleOffset = 90;
        var _a = this, stops = _a.stops, angle = _a.angle;
        var radians = normalizeAngle360(toRadians(angle + angleOffset));
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var w = bbox.width;
        var h = bbox.height;
        var cx = bbox.x + w * 0.5;
        var cy = bbox.y + h * 0.5;
        if (w > 0 && h > 0) {
            var diagonal = Math.sqrt(h * h + w * w) / 2;
            var diagonalAngle = Math.atan2(h, w);
            var quarteredAngle = void 0;
            if (radians < Math.PI / 2) {
                quarteredAngle = radians;
            }
            else if (radians < Math.PI) {
                quarteredAngle = Math.PI - radians;
            }
            else if (radians < (3 * Math.PI) / 2) {
                quarteredAngle = radians - Math.PI;
            }
            else {
                quarteredAngle = 2 * Math.PI - radians;
            }
            var l = diagonal * Math.abs(Math.cos(quarteredAngle - diagonalAngle));
            var gradient_1 = ctx.createLinearGradient(cx + cos * l, cy + sin * l, cx - cos * l, cy - sin * l);
            stops.forEach(function (stop) {
                gradient_1.addColorStop(stop.offset, stop.color);
            });
            return gradient_1;
        }
        return 'black';
    };
    return LinearGradient;
}(Gradient));
export { LinearGradient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZWFyR3JhZGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvZ3JhZGllbnQvbGluZWFyR3JhZGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUV0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFaEU7SUFBb0Msa0NBQVE7SUFBNUM7UUFBQSxxRUEyQ0M7UUExQ0csV0FBSyxHQUFHLENBQUMsQ0FBQzs7SUEwQ2QsQ0FBQztJQXhDRyx1Q0FBYyxHQUFkLFVBQWUsR0FBNkIsRUFBRSxJQUFVO1FBQ3BELHdEQUF3RDtRQUN4RCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBQSxLQUFtQixJQUFJLEVBQXJCLEtBQUssV0FBQSxFQUFFLEtBQUssV0FBUyxDQUFDO1FBQzlCLElBQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUIsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNyQixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3RCLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM1QixJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDaEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkMsSUFBSSxjQUFjLFNBQVEsQ0FBQztZQUMzQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsY0FBYyxHQUFHLE9BQU8sQ0FBQzthQUM1QjtpQkFBTSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUMxQixjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDcEMsY0FBYyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNILGNBQWMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7YUFDMUM7WUFFRCxJQUFNLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQU0sVUFBUSxHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO2dCQUNmLFVBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLFVBQVEsQ0FBQztTQUNuQjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUEzQ0QsQ0FBb0MsUUFBUSxHQTJDM0MifQ==