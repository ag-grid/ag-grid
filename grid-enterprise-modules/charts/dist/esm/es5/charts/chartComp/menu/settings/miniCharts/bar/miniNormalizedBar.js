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
import { MiniStackedBar } from "./miniStackedBar";
var MiniNormalizedBar = /** @class */ (function (_super) {
    __extends(MiniNormalizedBar, _super);
    function MiniNormalizedBar(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, MiniNormalizedBar.data, [0, 10], "normalizedBarTooltip") || this;
    }
    MiniNormalizedBar.chartType = 'normalizedBar';
    MiniNormalizedBar.data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];
    return MiniNormalizedBar;
}(MiniStackedBar));
export { MiniNormalizedBar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaU5vcm1hbGl6ZWRCYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvYmFyL21pbmlOb3JtYWxpemVkQmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdsRDtJQUF1QyxxQ0FBYztJQVNqRCwyQkFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQjtlQUNsRSxrQkFBTSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsc0JBQXNCLENBQUM7SUFDN0YsQ0FBQztJQVRNLDJCQUFTLEdBQWMsZUFBZSxDQUFDO0lBQ3ZDLHNCQUFJLEdBQUc7UUFDVixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDWixDQUFDO0lBS04sd0JBQUM7Q0FBQSxBQVpELENBQXVDLGNBQWMsR0FZcEQ7U0FaWSxpQkFBaUIifQ==