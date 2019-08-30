import { Chart } from "./chart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { numericExtent } from "../util/array";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";

export enum CartesianChartLayout {
    Vertical,
    Horizontal
}

export type CartesianChartOptions = {
    xAxis: Axis<Scale<any, number>>,
    yAxis: Axis<Scale<any, number>>,
    document?: Document
};

export class CartesianChart extends Chart {

    private axisAutoPadding = new Padding();

    constructor(options: CartesianChartOptions) {
        super(options);

        const xAxis = options.xAxis;
        const yAxis = options.yAxis;

        this._xAxis = xAxis;
        this._yAxis = yAxis;

        this.scene.root!.append([xAxis.group, yAxis.group, this.seriesClipRect]);
        this.scene.root!.append(this.legend.group);
    }

    private seriesClipRect = new Group();

    get seriesRoot(): Group {
        return this.seriesClipRect;
    }

    private readonly _xAxis: Axis<Scale<any, number>>;
    get xAxis(): Axis<Scale<any, number>> {
        return this._xAxis;
    }

    private readonly _yAxis: Axis<Scale<any, number>>;
    get yAxis(): Axis<Scale<any, number>> {
        return this._yAxis;
    }

    set series(values: Series<CartesianChart>[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series);
        });
    }
    get series(): Series<CartesianChart>[] {
        return this._series as Series<CartesianChart>[];
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

        const axisAutoPadding = this.axisAutoPadding;
        shrinkRect.x += axisAutoPadding.left;
        shrinkRect.y += axisAutoPadding.top;
        shrinkRect.width -= axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= axisAutoPadding.top + axisAutoPadding.bottom;

        // const seriesClipRect = this.seriesClipRect;
        // seriesClipRect.x = shrinkRect.x;
        // seriesClipRect.y = shrinkRect.y;
        // seriesClipRect.width = shrinkRect.width;
        // seriesClipRect.height = shrinkRect.height;

        const xAxis = this.xAxis;
        const yAxis = this.yAxis;

        xAxis.scale.range = [0, shrinkRect.width];
        xAxis.rotation = -90;
        xAxis.translationX = Math.floor(shrinkRect.x);
        xAxis.translationY = Math.floor(shrinkRect.y + shrinkRect.height + 1);
        xAxis.parallelLabels = true;
        xAxis.gridLength = shrinkRect.height;

        yAxis.scale.range = [shrinkRect.height, 0];
        yAxis.translationX = Math.floor(shrinkRect.x);
        yAxis.translationY = Math.floor(shrinkRect.y);
        yAxis.gridLength = shrinkRect.width;

        this.updateAxes();

        this.series.forEach(series => {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxis` call
        });

        this.positionCaptions();
        this.positionLegend();
    }

    private _layout: CartesianChartLayout = CartesianChartLayout.Vertical;
    set layout(value: CartesianChartLayout) {
        if (this._layout !== value) {
            this._layout = value;
            this.layoutPending = true;
        }
    }
    get layout(): CartesianChartLayout {
        return this._layout;
    }

    updateAxes() {
        const isHorizontal = this.layout === CartesianChartLayout.Horizontal;
        const xAxis = isHorizontal ? this.yAxis : this.xAxis;
        const yAxis = isHorizontal ? this.xAxis : this.yAxis;

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

        xAxis.domain = numericExtent(xDomain) || xDomain;
        yAxis.domain = numericExtent(yDomain) || yDomain;

        xAxis.update();
        yAxis.update();

        // The `xAxis` and `yAxis` have `.this` prefix on purpose here.
        const xAxisBBox = this.xAxis.getBBox();
        const yAxisBBox = this.yAxis.getBBox();

        {
            const axisThickness = Math.floor(yAxisBBox.width);
            if (this.axisAutoPadding.left !== axisThickness) {
                this.axisAutoPadding.left = axisThickness;
                this.layoutPending = true;
            }
        }
        {
            const axisThickness = Math.floor(xAxisBBox.width);
            if (this.axisAutoPadding.bottom !== axisThickness) {
                this.axisAutoPadding.bottom = axisThickness;
                this.layoutPending = true;
            }
        }
    }
}
