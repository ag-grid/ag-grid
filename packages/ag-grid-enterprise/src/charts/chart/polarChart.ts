import { Chart, ChartOptions } from "./chart";
import { PolarSeries } from "./series/polarSeries";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Axis } from "../axis";

export interface PolarChartOptions extends ChartOptions {
}

export class PolarChart extends Chart {
    private centerX: number = 0;
    private centerY: number = 0;

    private radius: number = 0;

    protected _padding = new Padding(50);

    constructor(options?: PolarChartOptions) {
        super(options);

        this.scene.root!.append(this.legend.group);
    }

    get seriesRoot(): Node {
        return this.scene.root!;
    }

    protected _series: PolarSeries[] = [];
    set series(values: PolarSeries[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series, null);
        });
    }
    get series(): PolarSeries[] {
        return this._series;
    }

    performLayout(): void {
        const shrinkRect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };

        const legendAutoPadding = this.legendAutoPadding;
        if (this.legend.data.length) {
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
        }

        const padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;

        const centerX = this.centerX = shrinkRect.x + shrinkRect.width / 2;
        const centerY = this.centerY = shrinkRect.y + shrinkRect.height / 2;
        const radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;

        this.series.forEach(series => {
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.update();
        });

        this.positionLegend();
    }
}
