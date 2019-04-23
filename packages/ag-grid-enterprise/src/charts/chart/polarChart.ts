import { Chart } from "./chart";
import { PolarSeries } from "./series/polarSeries";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";

export class PolarChart<D, X, Y> extends Chart<D, X, Y> {
    centerX: number = 0;
    centerY: number = 0;

    radius: number = 0;

    protected _padding = new Padding(50);

    private legendAutoPadding = new Padding();

    constructor(parent: HTMLElement = document.body) {
        super(parent);

        this.scene.root!.append(this.legend.group);
    }

    get seriesRoot(): Node {
        return this.scene.root!;
    }

    protected _series: PolarSeries<D, X, Y>[] = [];
    set series(values: PolarSeries<D, X, Y>[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series, null);
        });
    }
    get series(): PolarSeries<D, X, Y>[] {
        return this._series;
    }

    performLayout(): void {
        const shrinkRect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };

        const padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;

        const legendAutoPadding = this.legendAutoPadding;
        shrinkRect.x += legendAutoPadding.left;
        shrinkRect.y += legendAutoPadding.top;
        shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
        shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;

        const centerX = this.centerX = shrinkRect.x + shrinkRect.width / 2;
        const centerY = this.centerY = shrinkRect.y + shrinkRect.height / 2;
        const radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;

        this.series.forEach(series => {
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.update();
        });

        const legend = this.legend;
        if (!legend.data.length) {
            return; // TODO: figure out why we ever arrive here (data should be processed before layout)
        }
        legend.size = [300, shrinkRect.height];
        legend.performLayout();
        legend.group.translationX = 0;
        legend.group.translationY = 0;

        const legendBBox = legend.group.getBBox();
        // legendBBox.dilate(30);
        legendBBox.x -= 50;
        legendBBox.width += 50;

        legend.group.translationX = centerX + radius - legendBBox.x;
        legend.group.translationY = (this.height - legendBBox.height) / 2 - legendBBox.y;

        if (this.legendAutoPadding.right !== legendBBox.width) {
            this.legendAutoPadding.right = legendBBox.width;
            this.layoutPending = true;
        }
    }
}
