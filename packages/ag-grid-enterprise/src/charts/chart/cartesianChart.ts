import {Chart} from "./chart";
import {Axis} from "../axis";
import {Series} from "./series/series";
import {ClipRect} from "../scene/clipRect";

export class CartesianChart<D, X, Y> extends Chart<D, X, Y> {

    constructor(xAxis: Axis<X>, yAxis: Axis<Y>, parent: HTMLElement = document.body) {
        super(parent);

        this.scene.root!.append([xAxis.group, yAxis.group, this.seriesClipRect]);
        this._xAxis = xAxis;
        this._yAxis = yAxis;
    }

    private seriesClipRect = new ClipRect();

    private readonly _xAxis: Axis<X>;
    get xAxis(): Axis<X> {
        return this._xAxis;
    }

    private readonly _yAxis: Axis<Y>;
    get yAxis(): Axis<Y> {
        return this._yAxis;
    }

    addSeries(series: Series<D, X, Y>): void {
        this.seriesClipRect.append(series.group);
        this._series.push(series);
        series.chart = this;
        this.layoutPending = true;
    }

    performLayout(): void {
        if (!(this.xAxis && this.yAxis)) {
            return;
        }

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

        const seriesClipRect = this.seriesClipRect;
        seriesClipRect.x = shrinkRect.x;
        seriesClipRect.y = shrinkRect.y - padding.top;
        seriesClipRect.width = shrinkRect.width;
        seriesClipRect.height = shrinkRect.height + padding.top;

        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        // xAxis.scale.
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = shrinkRect.x;
        xAxis.translationY = shrinkRect.y + shrinkRect.height + 1;
        xAxis.parallelLabels = true;
        xAxis.gridLength = shrinkRect.height;

        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = shrinkRect.x;
        yAxis.translationY = shrinkRect.y;
        yAxis.gridLength = shrinkRect.width;

        this._series.forEach(series => {
            series.group.translationX = shrinkRect.x;
            series.group.translationY = shrinkRect.y;
            series.processData();
        });

        // this.updateAxes();

        this._series.forEach(series => {
            series.update();
        });
    }

    updateAxes() {
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        if (!(xAxis && yAxis)) {
            return;
        }

        if (this._series.length) {
            const series = this.series[0];
            xAxis.scale.domain = series.getDomainX();
            yAxis.scale.domain = series.getDomainY();
        }

        xAxis.update();
        yAxis.update();
    }
}
