import { Chart, ChartOptions } from "./chart";
import { Axis, ILinearAxis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { numericExtent } from "../util/array";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";

/** Defines the orientation used when rendering data series */
export enum CartesianChartLayout {
    Vertical,
    Horizontal
}

export interface CartesianChartOptions<TX extends ILinearAxis = Axis<Scale<any, number>>, TY extends ILinearAxis = Axis<Scale<any, number>>> extends ChartOptions {
    xAxis: TX;
    yAxis: TY;
}

export class CartesianChart<TX extends ILinearAxis = Axis<Scale<any, number>>, TY extends ILinearAxis = Axis<Scale<any, number>>> extends Chart {
    protected axisAutoPadding = new Padding();

    constructor(options: CartesianChartOptions<TX, TY>) {
        super(options);

        const { xAxis, yAxis } = options;

        this._xAxis = xAxis;
        this._yAxis = yAxis;

        this.scene.root!.append([xAxis.group, yAxis.group, this._seriesRoot]);
        this.scene.root!.append(this.legend.group);
    }

    private _seriesRoot = new Group();
    get seriesRoot(): Group {
        return this._seriesRoot;
    }

    private readonly _xAxis: TX;
    get xAxis(): TX {
        return this._xAxis;
    }

    private readonly _yAxis: TY;
    get yAxis(): TY {
        return this._yAxis;
    }

    set series(values: Series<CartesianChart<TX, TY>>[]) {
        this.removeAllSeries();
        values.forEach(series => this.addSeries(series));
    }
    get series(): Series<CartesianChart<TX, TY>>[] {
        return this._series as Series<CartesianChart<TX, TY>>[];
    }

    performLayout(): void {
        if (this.dataPending || !(this.xAxis && this.yAxis)) {
            return;
        }

        const { width, height, legend } = this;

        const shrinkRect = {
            x: 0,
            y: 0,
            width,
            height
        };

        if (legend.enabled && legend.data.length) {
            const { legendAutoPadding } = this;
            const legendPadding = this.legend.padding;

            shrinkRect.x += legendAutoPadding.left;
            shrinkRect.y += legendAutoPadding.top;
            shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
            shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;

            switch (this.legend.position) {
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

        const { captionAutoPadding, padding, axisAutoPadding, xAxis, yAxis } = this;

        shrinkRect.x += padding.left + axisAutoPadding.left;
        shrinkRect.y += padding.top + axisAutoPadding.top + captionAutoPadding;
        shrinkRect.width -= padding.left + padding.right + axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= padding.top + padding.bottom + axisAutoPadding.top + axisAutoPadding.bottom + captionAutoPadding;

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
            series.update(); // this has to happen after the `updateAxes` call
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

        this.series.filter(s => s.visible).forEach(series => {
            xDomains.push(series.getDomainX());
            yDomains.push(series.getDomainY());
        });

        const xDomain = new Array<any>().concat(...xDomains);
        const yDomain = new Array<any>().concat(...yDomains);

        xAxis.domain = numericExtent(xDomain) || xDomain;
        yAxis.domain = numericExtent(yDomain) || yDomain;

        xAxis.update();
        yAxis.update();

        // The `xAxis` and `yAxis` have `.this` prefix on purpose here,
        // because the local `xAxis` and `yAxis` variables may be swapped.
        const xAxisBBox = this.xAxis.getBBox();
        const yAxisBBox = this.yAxis.getBBox();

        {
            const axisThickness = Math.floor(xAxisBBox.width);
            if (this.axisAutoPadding.bottom !== axisThickness) {
                this.axisAutoPadding.bottom = axisThickness;
                this.layoutPending = true;
            }
        }
        {
            const axisThickness = Math.floor(yAxisBBox.width);

            if (this.axisAutoPadding.left !== axisThickness) {
                this.axisAutoPadding.left = axisThickness;
                this.layoutPending = true;
            }
        }
    }
}
