import { Chart } from "./chart";
import { Axis } from "../axis";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { extent, checkExtent } from "../util/array";
import { Padding } from "../util/padding";
import { LegendDatum } from "./legend";

export class CartesianChart<D, X, Y> extends Chart<D, X, Y> {

    private axisAutoPadding = new Padding();
    private legendAutoPadding = new Padding();

    constructor(xAxis: Axis<X>, yAxis: Axis<Y>, parent: HTMLElement = document.body) {
        super(parent);

        this.scene.root!.append([xAxis.group, yAxis.group, this.seriesClipRect]);
        this.scene.root!.append(this.legend.group);
        this._xAxis = xAxis;
        this._yAxis = yAxis;
    }

    private seriesClipRect = new ClipRect();

    get seriesRoot(): ClipRect {
        return this.seriesClipRect;
    }

    private readonly _xAxis: Axis<X>;
    get xAxis(): Axis<X> {
        return this._xAxis;
    }

    private readonly _yAxis: Axis<Y>;
    get yAxis(): Axis<Y> {
        return this._yAxis;
    }

    set series(values: Series<D, X, Y>[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series);
        });
    }
    get series(): Series<D, X, Y>[] {
        return this._series;
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

        const axisAutoPadding = this.axisAutoPadding;
        shrinkRect.x += axisAutoPadding.left;
        shrinkRect.y += axisAutoPadding.top;
        shrinkRect.width -= axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= axisAutoPadding.top + axisAutoPadding.bottom;

        const legendAutoPadding = this.legendAutoPadding;
        shrinkRect.x += legendAutoPadding.left;
        shrinkRect.y += legendAutoPadding.top;
        shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
        shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;

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

        const legendData: LegendDatum[] = [];
        this.series.forEach(series => {
            series.update(); // this has to happen after the `updateAxis` call
            series.provideLegendData(legendData);
        });

        const legend = this.legend;
        legend.data = legendData;
        // We reset the `translationX` intentionally here to get `legendBBox.x`
        // which is the offset we need to apply to align the left edge of legend
        // with the right edge of the `seriesClipRect`.
        legend.group.translationX = 0;
        legend.group.translationY = 0;
        const legendBBox = legend.group.getBBox();
        legendBBox.dilate(20);
        legend.group.translationX = seriesClipRect.x + seriesClipRect.width - legendBBox.x;
        legend.group.translationY = (this.height - legendBBox.height) / 2 - legendBBox.y;

        if (this.legendAutoPadding.right !== legendBBox.width) {
            this.legendAutoPadding.right = legendBBox.width;
            this.layoutPending = true;
        }
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

        if (this.axisAutoPadding.left !== yAxisBBox.width) {
            this.axisAutoPadding.left = yAxisBBox.width;
            this.layoutPending = true;
        }
        if (this.axisAutoPadding.bottom !== xAxisBBox.width) {
            this.axisAutoPadding.bottom = xAxisBBox.width;
            this.layoutPending = true;
        }
    }
}
