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
import { MiniStackedArea } from "./miniStackedArea";
var MiniNormalizedArea = /** @class */ (function (_super) {
    __extends(MiniNormalizedArea, _super);
    function MiniNormalizedArea(container, fills, strokes, data) {
        if (data === void 0) { data = MiniNormalizedArea.data; }
        return _super.call(this, container, fills, strokes, data, "normalizedAreaTooltip") || this;
    }
    MiniNormalizedArea.chartType = 'normalizedArea';
    MiniNormalizedArea.data = MiniStackedArea.data.map(function (stack) {
        var sum = stack.reduce(function (p, c) { return p + c; }, 0);
        return stack.map(function (v) { return v / sum * 16; });
    });
    return MiniNormalizedArea;
}(MiniStackedArea));
export { MiniNormalizedArea };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaU5vcm1hbGl6ZWRBcmVhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9taW5pQ2hhcnRzL2FyZWEvbWluaU5vcm1hbGl6ZWRBcmVhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUdwRDtJQUF3QyxzQ0FBZTtJQVFuRCw0QkFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQixFQUFFLElBQTBDO1FBQTFDLHFCQUFBLEVBQUEsT0FBbUIsa0JBQWtCLENBQUMsSUFBSTtlQUM5RyxrQkFBTSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsdUJBQXVCLENBQUM7SUFDbkUsQ0FBQztJQVJNLDRCQUFTLEdBQWMsZ0JBQWdCLENBQUM7SUFDL0IsdUJBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7UUFDakQsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3QyxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztJQUtQLHlCQUFDO0NBQUEsQUFYRCxDQUF3QyxlQUFlLEdBV3REO1NBWFksa0JBQWtCIn0=