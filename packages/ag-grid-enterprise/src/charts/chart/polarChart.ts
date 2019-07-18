import { Chart } from "./chart";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Series } from "./series/series";

export class PolarChart extends Chart {
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number = 0;
    centerY: number = 0;

    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number = 0;

    protected _padding = new Padding(50);

    constructor() {
        super();

        this.scene.root!.append(this.legend.group);
    }

    get seriesRoot(): Node {
        return this.scene.root!;
    }

    protected _series: Series<PolarChart>[] = [];
    set series(values: Series<PolarChart>[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series, null);
        });
    }
    get series(): Series<PolarChart>[] {
        return this._series as Series<PolarChart>[];
    }

    performLayout(): void {
        const shrinkRect = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };

        const captionAutoPadding = this.captionAutoPadding;
        shrinkRect.y += captionAutoPadding;
        shrinkRect.height -= captionAutoPadding;

        if (this.legend.enabled && this.legend.data.length) {
            const legendAutoPadding = this.legendAutoPadding;
            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;

            const legendPadding = this.legendPadding;
            switch (this.legendPosition) {
                case 'right':
                    shrinkRect.width -= legendPadding;
                    break;
                case 'bottom':
                    shrinkRect.height -= legendPadding;
                    break;
                case 'left':
                    shrinkRect.x += legendPadding;
                    shrinkRect.width -= legendPadding;
                    break;
                case 'top':
                    shrinkRect.y += legendPadding;
                    shrinkRect.height -= legendPadding;
                    break;
            }
        }

        const padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.y += padding.top;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.height -= padding.top + padding.bottom;

        this.centerX = shrinkRect.x + shrinkRect.width / 2;
        this.centerY = shrinkRect.y + shrinkRect.height / 2;
        this.radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;

        this.series.forEach(series => {
            series.update();
        });

        this.positionCaptions();
        this.positionLegend();
    }
}
