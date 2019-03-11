import {Chart} from "./chart";
import {Axis} from "../axis";

export class CartesianChart<D, X, Y> extends Chart<D, X, Y> {

    constructor(xAxis: Axis<X>, yAxis: Axis<Y>) {
        super();
        this.xAxis = xAxis;
        this.yAxis = yAxis;
    }

    xAxis: Axis<X>;
    yAxis: Axis<Y>;

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

        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        // xAxis.scale.
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = shrinkRect.x;
        xAxis.translationY = shrinkRect.y + shrinkRect.height;
        xAxis.isParallelLabels = true;

        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = shrinkRect.x;
        yAxis.translationY = shrinkRect.y;

        this._series.forEach(series => {
            series.group.translationX = shrinkRect.x;
            series.group.translationY = shrinkRect.y;
            series.processData();
            series.update();
        });

        if (this._series.length) {
            const series = this.series[0];
            xAxis.scale.domain = series.getDomainX();
            yAxis.scale.domain = series.getDomainY();
        }

        xAxis.update();
        yAxis.update();
    }
}
