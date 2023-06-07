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
import { MiniStackedColumn } from "./miniStackedColumn";
var MiniNormalizedColumn = /** @class */ (function (_super) {
    __extends(MiniNormalizedColumn, _super);
    function MiniNormalizedColumn(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip") || this;
    }
    MiniNormalizedColumn.chartType = 'normalizedColumn';
    MiniNormalizedColumn.data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];
    return MiniNormalizedColumn;
}(MiniStackedColumn));
export { MiniNormalizedColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaU5vcm1hbGl6ZWRDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvY29sdW1uL21pbmlOb3JtYWxpemVkQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBR3hEO0lBQTBDLHdDQUFpQjtJQVN2RCw4QkFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQjtlQUNsRSxrQkFBTSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUseUJBQXlCLENBQUM7SUFDbkcsQ0FBQztJQVRNLDhCQUFTLEdBQWMsa0JBQWtCLENBQUM7SUFDMUMseUJBQUksR0FBRztRQUNWLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNaLENBQUM7SUFLTiwyQkFBQztDQUFBLEFBWkQsQ0FBMEMsaUJBQWlCLEdBWTFEO1NBWlksb0JBQW9CIn0=