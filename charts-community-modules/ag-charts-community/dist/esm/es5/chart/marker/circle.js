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
import { Marker } from './marker';
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Circle.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y, path = _a.path, size = _a.size;
        var r = size / 2;
        path.clear();
        path.arc(x, y, r, 0, Math.PI * 2);
        path.closePath();
    };
    Circle.className = 'Circle';
    return Circle;
}(Marker));
export { Circle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2lyY2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L21hcmtlci9jaXJjbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQztJQUE0QiwwQkFBTTtJQUFsQzs7SUFXQSxDQUFDO0lBUkcsMkJBQVUsR0FBVjtRQUNVLElBQUEsS0FBdUIsSUFBSSxFQUF6QixDQUFDLE9BQUEsRUFBRSxDQUFDLE9BQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxJQUFJLFVBQVMsQ0FBQztRQUNsQyxJQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFUTSxnQkFBUyxHQUFHLFFBQVEsQ0FBQztJQVVoQyxhQUFDO0NBQUEsQUFYRCxDQUE0QixNQUFNLEdBV2pDO1NBWFksTUFBTSJ9