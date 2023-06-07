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
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Triangle.prototype.updatePath = function () {
        var s = this.size * 1.1;
        _super.prototype.applyPath.call(this, s, Triangle.moves);
    };
    Triangle.className = 'Triangle';
    Triangle.moves = [
        { x: 0, y: -0.48, t: 'move' },
        { x: 0.5, y: 0.87 },
        { x: -1, y: 0 },
    ];
    return Triangle;
}(Marker));
export { Triangle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpYW5nbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvbWFya2VyL3RyaWFuZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQWtCLE1BQU0sVUFBVSxDQUFDO0FBRWxEO0lBQThCLDRCQUFNO0lBQXBDOztJQWNBLENBQUM7SUFMRyw2QkFBVSxHQUFWO1FBQ0ksSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFFMUIsaUJBQU0sU0FBUyxZQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQVpNLGtCQUFTLEdBQUcsVUFBVSxDQUFDO0lBRXZCLGNBQUssR0FBcUI7UUFDN0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFO1FBQzdCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFO1FBQ25CLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDbEIsQ0FBQztJQU9OLGVBQUM7Q0FBQSxBQWRELENBQThCLE1BQU0sR0FjbkM7U0FkWSxRQUFRIn0=