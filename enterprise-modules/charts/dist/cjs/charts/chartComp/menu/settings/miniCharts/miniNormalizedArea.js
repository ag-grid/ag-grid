"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var miniStackedArea_1 = require("./miniStackedArea");
var MiniNormalizedArea = /** @class */ (function (_super) {
    __extends(MiniNormalizedArea, _super);
    function MiniNormalizedArea(container, fills, strokes, data) {
        if (data === void 0) { data = MiniNormalizedArea.data; }
        return _super.call(this, container, fills, strokes, data, "normalizedAreaTooltip") || this;
    }
    MiniNormalizedArea.chartType = core_1.ChartType.NormalizedArea;
    MiniNormalizedArea.data = miniStackedArea_1.MiniStackedArea.data.map(function (stack) {
        var sum = stack.reduce(function (p, c) { return p + c; }, 0);
        return stack.map(function (v) { return v / sum * 16; });
    });
    return MiniNormalizedArea;
}(miniStackedArea_1.MiniStackedArea));
exports.MiniNormalizedArea = MiniNormalizedArea;
//# sourceMappingURL=miniNormalizedArea.js.map