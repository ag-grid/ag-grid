import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createColumnRects, createLinePaths } from "../miniChartHelpers";
export class MiniColumnLineCombo extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "columnLineComboTooltip");
        this.columnData = [3, 4];
        this.lineData = [
            [5, 4, 6, 5, 4]
        ];
        const { root, columnData, lineData, size, padding } = this;
        this.columns = createColumnRects({
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
        this.lines = createLinePaths(root, lineData, size, padding);
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
MiniColumnLineCombo.chartType = 'columnLineCombo';
