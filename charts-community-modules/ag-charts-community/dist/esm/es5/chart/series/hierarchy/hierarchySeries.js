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
import { Series, SeriesNodePickMode } from '../series';
var HierarchySeries = /** @class */ (function (_super) {
    __extends(HierarchySeries, _super);
    function HierarchySeries(moduleCtx) {
        return _super.call(this, { moduleCtx: moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
    }
    HierarchySeries.prototype.getLabelData = function () {
        return [];
    };
    return HierarchySeries;
}(Series));
export { HierarchySeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2h5U2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9oaWVyYXJjaHkvaGllcmFyY2h5U2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUdBLE9BQU8sRUFBRSxNQUFNLEVBQTBDLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9GO0lBQXlFLG1DQUFnQztJQUdyRyx5QkFBWSxTQUF3QjtlQUNoQyxrQkFBTSxFQUFFLFNBQVMsV0FBQSxFQUFFLFNBQVMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztJQUMzRSxDQUFDO0lBRUQsc0NBQVksR0FBWjtRQUNJLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUNMLHNCQUFDO0FBQUQsQ0FBQyxBQVZELENBQXlFLE1BQU0sR0FVOUUifQ==