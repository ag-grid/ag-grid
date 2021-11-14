var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ChartType } from "@ag-grid-community/core";
import { MiniStackedArea } from "./miniStackedArea";
var MiniNormalizedArea = /** @class */ (function (_super) {
    __extends(MiniNormalizedArea, _super);
    function MiniNormalizedArea(container, fills, strokes, data) {
        if (data === void 0) { data = MiniNormalizedArea.data; }
        return _super.call(this, container, fills, strokes, data, "normalizedAreaTooltip") || this;
    }
    MiniNormalizedArea.chartType = ChartType.NormalizedArea;
    MiniNormalizedArea.data = MiniStackedArea.data.map(function (stack) {
        var sum = stack.reduce(function (p, c) { return p + c; }, 0);
        return stack.map(function (v) { return v / sum * 16; });
    });
    return MiniNormalizedArea;
}(MiniStackedArea));
export { MiniNormalizedArea };
