"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniColumnLineCombo = void 0;
var miniChartWithAxes_1 = require("../miniChartWithAxes");
var miniChartHelpers_1 = require("../miniChartHelpers");
var MiniColumnLineCombo = /** @class */ (function (_super) {
    __extends(MiniColumnLineCombo, _super);
    function MiniColumnLineCombo(container, fills, strokes) {
        var _this = _super.call(this, container, "columnLineComboTooltip") || this;
        _this.columnData = [3, 4];
        _this.lineData = [
            [5, 4, 6, 5, 4]
        ];
        var _a = _this, root = _a.root, columnData = _a.columnData, lineData = _a.lineData, size = _a.size, padding = _a.padding;
        _this.columns = miniChartHelpers_1.createColumnRects({
            stacked: false,
            root: root,
            data: columnData,
            size: size,
            padding: padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5
        });
        root.append(_this.columns);
        _this.lines = miniChartHelpers_1.createLinePaths(root, lineData, size, padding);
        _this.updateColors(fills, strokes);
        return _this;
    }
    MiniColumnLineCombo.prototype.updateColors = function (fills, strokes) {
        this.columns.forEach(function (bar, i) {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
        this.lines.forEach(function (line, i) {
            line.stroke = fills[i + 2];
        });
    };
    MiniColumnLineCombo.chartType = 'columnLineCombo';
    return MiniColumnLineCombo;
}(miniChartWithAxes_1.MiniChartWithAxes));
exports.MiniColumnLineCombo = MiniColumnLineCombo;
