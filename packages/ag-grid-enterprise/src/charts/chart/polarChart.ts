import {Chart} from "./chart";
import {PolarSeries} from "./series/polarSeries";

export class PolarChart<D> extends Chart<D> {
    centerX: number = 0;
    centerY: number = 0;

    radius: number = 0;

    protected _series: PolarSeries<D>[] = [];

    addSeries(series: PolarSeries<D>): void {
        if (this.scene.root) {
            this.scene.root.append(series.group);
        }
        this._series.push(series);
        series.chart = this as PolarChart<D>;
        this.isLayoutPending = true;
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
            series.processData();
            series.update();
        });
    }
}
