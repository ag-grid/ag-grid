import { Chart, ChartOptions, LegendPosition } from "./chart";
import { Axis } from "../axis";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { extent, checkExtent } from "../util/array";
import { Padding } from "../util/padding";

export interface CartesianChartOptions extends ChartOptions {
    xAxis: Axis,
    yAxis: Axis
}

export class CartesianChart extends Chart {

    private axisAutoPadding = new Padding();

    constructor(options: CartesianChartOptions) {
        super(options);

        const {xAxis, yAxis} = options;

        this.scene.root!.append([xAxis.group, yAxis.group, this.seriesClipRect]);
        this.scene.root!.append(this.legend.group);
        this._xAxis = xAxis;
        this._yAxis = yAxis;
    }

    private seriesClipRect = new ClipRect();

    get seriesRoot(): ClipRect {
        return this.seriesClipRect;
    }

    private readonly _xAxis: Axis;
    get xAxis(): Axis {
        return this._xAxis;
    }

    private readonly _yAxis: Axis;
    get yAxis(): Axis {
        return this._yAxis;
    }

    set series(values: Series[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series);
        });
    }
    get series(): Series[] {
        return this._series;
    }

    performLayout(): void {
        if (this.dataPending || !(this.xAxis && this.yAxis)) {
            return;
        }

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

            const legendPadding = this.legendPadding;
            switch (this.legendPosition) {
                case LegendPosition.Right:
                    shrinkRect.width -= legendPadding;
                    break;
                case LegendPosition.Bottom:
                    shrinkRect.height -= legendPadding;
                    break;
                case LegendPosition.Left:
                    shrinkRect.x += legendPadding;
                    shrinkRect.width -= legendPadding;
                    break;
                case LegendPosition.Top:
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

        const axisAutoPadding = this.axisAutoPadding;
        shrinkRect.x += axisAutoPadding.left;
        shrinkRect.y += axisAutoPadding.top;
        shrinkRect.width -= axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= axisAutoPadding.top + axisAutoPadding.bottom;

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

        this.updateAxes();

        this.series.forEach(series => {
            series.group.translationX = shrinkRect.x;
            series.group.translationY = shrinkRect.y;
            series.update(); // this has to happen after the `updateAxis` call
        });

        this.positionLegend();
    }

    updateAxes() {
        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        if (!(xAxis && yAxis)) {
            return;
        }

        const xDomains: any[][] = [];
        const yDomains: any[][] = [];

        this.series.forEach(series => {
            if (series.visible) {
                const xDomain = series.getDomainX();
                const yDomain = series.getDomainY();

                xDomains.push(xDomain);
                yDomains.push(yDomain);
            }
        });

        const xDomain = new Array<any>().concat(...xDomains);
        const yDomain = new Array<any>().concat(...yDomains);

        if (typeof xDomain[0] === 'number') {
            xAxis.domain = checkExtent(extent(xDomain));
        } else {
            // if (!xDomain.length) {
            //     return;
            // }
            xAxis.domain = xDomain;
        }

        if (typeof yDomain[0] === 'number') {
            yAxis.domain = checkExtent(extent(yDomain));
        } else {
            // if (!yDomain.length) {
            //     return;
            // }
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
