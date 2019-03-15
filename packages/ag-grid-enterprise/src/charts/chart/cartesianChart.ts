import {Chart} from "./chart";
import {Axis} from "../axis";
import {Series} from "./series/series";
import {ClipRect} from "../scene/clipRect";

export class CartesianChart<D, X, Y> extends Chart<D, X, Y> {

    constructor(xAxis: Axis<X>, yAxis: Axis<Y>, parent: HTMLElement = document.body) {
        super(parent);
        if (this.scene.root) {
            this.scene.root.append(this.seriesRect);
        }
        this.xAxis = xAxis;
        this.yAxis = yAxis;
    }

    private seriesRect = new ClipRect();

    private _xAxis: Axis<X> | null = null;
    set xAxis(value: Axis<X> | null) {
        if (this._xAxis !== value) {
            const root = this.scene.root;
            if (root) {
                if (value) {
                    root.append(value.group);
                } else if (this._xAxis) {
                    root.removeChild(this._xAxis.group);
                }
            }
            this._xAxis = value;
        }
    }
    get xAxis(): Axis<X> | null {
        return this._xAxis;
    }

    private _yAxis: Axis<Y> | null = null;
    set yAxis(value: Axis<Y> | null) {
        if (this._yAxis !== value) {
            const root = this.scene.root;
            if (root) {
                if (value) {
                    root.append(value.group);
                } else if (this._yAxis) {
                    root.removeChild(this._yAxis.group);
                }
            }
            this._yAxis = value;
        }
    }
    get yAxis(): Axis<Y> | null {
        return this._yAxis;
    }

    addSeries(series: Series<D, X, Y>): void {
        this.seriesRect.append(series.group);
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

        const seriesRect = this.seriesRect;
        seriesRect.x = shrinkRect.x;
        seriesRect.y = shrinkRect.y;
        seriesRect.width = shrinkRect.width;
        seriesRect.height = shrinkRect.height;

        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        // xAxis.scale.
        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = shrinkRect.x;
        xAxis.translationY = shrinkRect.y + shrinkRect.height + 1;
        xAxis.parallelLabels = true;

        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = shrinkRect.x;
        yAxis.translationY = shrinkRect.y;

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
