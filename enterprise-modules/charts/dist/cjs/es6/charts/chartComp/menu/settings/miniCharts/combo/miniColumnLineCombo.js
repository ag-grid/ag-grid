"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniColumnLineCombo = void 0;
const miniChartWithAxes_1 = require("../miniChartWithAxes");
const miniChartHelpers_1 = require("../miniChartHelpers");
class MiniColumnLineCombo extends miniChartWithAxes_1.MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "columnLineComboTooltip");
        this.columnData = [3, 4];
        this.lineData = [
            [5, 4, 6, 5, 4]
        ];
        const { root, columnData, lineData, size, padding } = this;
        this.columns = miniChartHelpers_1.createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1],
            yScaleDomain: [0, 4],
            xScalePadding: 0.5
        });
        root.append(this.columns);
        this.lines = miniChartHelpers_1.createLinePaths(root, lineData, size, padding);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.columns.forEach((bar, i) => {
            bar.fill = fills[i];
            bar.stroke = strokes[i];
        });
        this.lines.forEach((line, i) => {
            line.stroke = fills[i + 2];
        });
    }
}
exports.MiniColumnLineCombo = MiniColumnLineCombo;
MiniColumnLineCombo.chartType = 'columnLineCombo';
