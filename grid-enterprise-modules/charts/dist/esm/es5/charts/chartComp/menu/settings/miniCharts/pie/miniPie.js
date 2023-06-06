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
import { MiniDoughnut } from "./miniDoughnut";
var MiniPie = /** @class */ (function (_super) {
    __extends(MiniPie, _super);
    function MiniPie(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, 0, "pieTooltip") || this;
    }
    MiniPie.chartType = 'pie';
    return MiniPie;
}(MiniDoughnut));
export { MiniPie };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaVBpZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9waWUvbWluaVBpZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHOUM7SUFBNkIsMkJBQVk7SUFJckMsaUJBQVksU0FBc0IsRUFBRSxLQUFlLEVBQUUsT0FBaUI7ZUFDbEUsa0JBQU0sU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQztJQUNyRCxDQUFDO0lBSk0saUJBQVMsR0FBYyxLQUFLLENBQUM7SUFLeEMsY0FBQztDQUFBLEFBUEQsQ0FBNkIsWUFBWSxHQU94QztTQVBZLE9BQU8ifQ==