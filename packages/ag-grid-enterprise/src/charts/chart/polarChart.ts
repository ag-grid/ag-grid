import { Chart } from "./chart";
import { PolarSeries } from "./series/polarSeries";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";

export class PolarChart<D, X, Y> extends Chart<D, X, Y> {
    centerX: number = 0;
    centerY: number = 0;

    radius: number = 0;

    protected _padding: Padding = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

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

        const centerX = this.centerX = shrinkRect.x + shrinkRect.width / 2;
        const centerY = this.centerY = shrinkRect.y + shrinkRect.height / 2;
        const radius = Math.min(shrinkRect.width, shrinkRect.height) / 2;

        this._series.forEach(series => {
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            if (series.processData()) {
                series.update();
            }
        });
    }
}
