import { Chart } from "./chart";
import { Axis } from "../axis";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { extent, checkExtent } from "../util/array";
import { Padding } from "../util/padding";

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
        this.series.push(series);
        series.chart = this;
        this.layoutPending = true;
    }

    removeAllSeries(): void {
        this.series.forEach(series => {
            series.chart = null;
            this.seriesClipRect.removeChild(series.group);
        });
        this.series = [];
        this.layoutPending = true;
    }

    private autoPadding: Padding = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

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

        const autoPadding = this.autoPadding;
        shrinkRect.x += autoPadding.left;
        shrinkRect.y += autoPadding.top;
        shrinkRect.width -= autoPadding.left + autoPadding.right;
        shrinkRect.height -= autoPadding.top + autoPadding.bottom;

        const seriesClipRect = this.seriesClipRect;
        seriesClipRect.x = shrinkRect.x;
        seriesClipRect.y = shrinkRect.y - padding.top;
        seriesClipRect.width = shrinkRect.width;
        seriesClipRect.height = shrinkRect.height + padding.top;

        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

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

        this.series.forEach(series => {
            series.group.translationX = shrinkRect.x;
            series.group.translationY = shrinkRect.y;
            series.processData();
        });

        this.updateAxes();

        this.series.forEach(series => {
            series.update();
        });
    }

    updateAxes() {
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        if (!(xAxis && yAxis)) {
            return;
        }

        const xDomains: X[][] = [];
        const yDomains: Y[][] = [];

        this.series.forEach(series => {
            const xDomain = series.getDomainX();
            const yDomain = series.getDomainY();

            xDomains.push(xDomain);
            yDomains.push(yDomain);
        });

        const xDomain: X[] = new Array<X>().concat(...xDomains);
        const yDomain: Y[] = new Array<Y>().concat(...yDomains);

        if (typeof xDomain[0] === 'number') {
            xAxis.domain = checkExtent(extent(xDomain));
        } else {
            if (!xDomain.length) {
                return;
            }
            xAxis.domain = xDomain; // categories (strings), duplicates will be removed by the axis' scale
        }

        if (typeof yDomain[0] === 'number') {
            yAxis.domain = checkExtent(extent(yDomain));
        } else {
            if (!yDomain.length) {
                return;
            }
            yAxis.domain = yDomain;
        }

        xAxis.update();
        yAxis.update();

        const xAxisBBox = xAxis.getBBox();
        const yAxisBBox = yAxis.getBBox();

        if (this.autoPadding.left !== yAxisBBox.width) {
            this.autoPadding.left = yAxisBBox.width;
            this.layoutPending = true;
        }
        if (this.autoPadding.bottom !== xAxisBBox.width) {
            this.autoPadding.bottom = xAxisBBox.width;
            this.layoutPending = true;
        }
    }
}
