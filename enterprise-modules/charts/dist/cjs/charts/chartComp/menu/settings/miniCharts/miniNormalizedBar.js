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
var miniStackedBar_1 = require("./miniStackedBar");
var MiniNormalizedBar = /** @class */ (function (_super) {
    __extends(MiniNormalizedBar, _super);
    function MiniNormalizedBar(container, fills, strokes) {
        return _super.call(this, container, fills, strokes, MiniNormalizedBar.data, [0, 10], "normalizedBarTooltip") || this;
    }
    MiniNormalizedBar.chartType = core_1.ChartType.NormalizedBar;
    MiniNormalizedBar.data = [
        [10, 10, 10],
        [6, 7, 8],
        [2, 4, 6]
    ];
    return MiniNormalizedBar;
}(miniStackedBar_1.MiniStackedBar));
exports.MiniNormalizedBar = MiniNormalizedBar;
//# sourceMappingURL=miniNormalizedBar.js.map