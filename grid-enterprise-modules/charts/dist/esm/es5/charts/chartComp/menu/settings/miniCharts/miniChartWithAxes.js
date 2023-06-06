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
import { PostConstruct } from "@ag-grid-community/core";
import { MiniChart } from "./miniChart";
import { _Scene } from "ag-charts-community";
var MiniChartWithAxes = /** @class */ (function (_super) {
    __extends(MiniChartWithAxes, _super);
    function MiniChartWithAxes(container, tooltipName) {
        var _this = _super.call(this, container, tooltipName) || this;
        _this.stroke = 'gray';
        _this.axisOvershoot = 3;
        return _this;
    }
    MiniChartWithAxes.prototype.addAxes = function () {
        var size = this.size;
        var padding = this.padding;
        var leftAxis = new _Scene.Line();
        leftAxis.x1 = padding;
        leftAxis.y1 = padding;
        leftAxis.x2 = padding;
        leftAxis.y2 = size - padding + this.axisOvershoot;
        leftAxis.stroke = this.stroke;
        var bottomAxis = new _Scene.Line();
        bottomAxis.x1 = padding - this.axisOvershoot + 1;
        bottomAxis.y1 = size - padding;
        bottomAxis.x2 = size - padding + 1;
        bottomAxis.y2 = size - padding;
        bottomAxis.stroke = this.stroke;
        var root = this.root;
        root.append(leftAxis);
        root.append(bottomAxis);
    };
    __decorate([
        PostConstruct
    ], MiniChartWithAxes.prototype, "addAxes", null);
    return MiniChartWithAxes;
}(MiniChart));
export { MiniChartWithAxes };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNoYXJ0V2l0aEF4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvbWluaUNoYXJ0V2l0aEF4ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTdDO0lBQWdELHFDQUFTO0lBS3JELDJCQUFZLFNBQXNCLEVBQUUsV0FBbUI7UUFBdkQsWUFDSSxrQkFBTSxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQ2hDO1FBTGdCLFlBQU0sR0FBRyxNQUFNLENBQUM7UUFDaEIsbUJBQWEsR0FBRyxDQUFDLENBQUM7O0lBSW5DLENBQUM7SUFHTyxtQ0FBTyxHQUFmO1FBQ0ksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRTdCLElBQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ2xELFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUU5QixJQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQyxVQUFVLENBQUMsRUFBRSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUNqRCxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7UUFDL0IsVUFBVSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNuQyxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7UUFDL0IsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRWhDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUF0QkQ7UUFEQyxhQUFhO29EQXVCYjtJQUNMLHdCQUFDO0NBQUEsQUFqQ0QsQ0FBZ0QsU0FBUyxHQWlDeEQ7U0FqQ3FCLGlCQUFpQiJ9