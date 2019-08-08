import { Chart } from "./chart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
import { extent } from "../util/array";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";

export type CartesianChartLayout = 'vertical' | 'horizontal';
type GroupedCategoryChartAxis = GroupedCategoryAxis | Axis<Scale<any, number>>;

export class GroupedCategoryChart extends Chart {

    private axisAutoPadding = new Padding();

    constructor(xAxis: GroupedCategoryChartAxis, yAxis: GroupedCategoryChartAxis) {
        super();

        this._xAxis = xAxis;
        this._yAxis = yAxis;

        this.scene.root!.append([xAxis.group, yAxis.group, this.seriesClipRect]);
        this.scene.root!.append(this.legend.group);
    }

    private seriesClipRect = new Group();

    get seriesRoot(): Group {
        return this.seriesClipRect;
    }

    private readonly _xAxis: GroupedCategoryChartAxis;
    get xAxis(): GroupedCategoryChartAxis {
        return this._xAxis;
    }

    private readonly _yAxis: GroupedCategoryChartAxis;
    get yAxis(): GroupedCategoryChartAxis {
        return this._yAxis;
    }

    set series(values: Series<GroupedCategoryChart>[]) {
        this.removeAllSeries();
        values.forEach(series => {
            this.addSeries(series);
        });
    }
    get series(): Series<GroupedCategoryChart>[] {
        return this._series as Series<GroupedCategoryChart>[];
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

        xAxis.range = [0, shrinkRect.width];
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

    private _layout: CartesianChartLayout = 'vertical';
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
        const isHorizontal = this.layout === 'horizontal';
        const xAxis = isHorizontal ? this.yAxis : this.xAxis;
        const yAxis = isHorizontal ? this.xAxis : this.yAxis;

        if (!(xAxis && yAxis)) {
            return;
        }

        const xDomains: any[][] = [];
        const yDomains: any[][] = [];

        let isNumericX: boolean | undefined = undefined;
        this.series.forEach((series, index) => {
            if (series.visible) {
                const xDomain = series.getDomainX();
                const yDomain = series.getDomainY();

                const isFirstVisibleSeries = isNumericX === undefined;
                if (isFirstVisibleSeries) {
                    isNumericX = typeof xDomain[0] === 'number';
                }
                if (isNumericX || isFirstVisibleSeries) {
                    xDomains.push(xDomain);
                }
                yDomains.push(yDomain);
            }
        });

        const xDomain = new Array<any>().concat(...xDomains);
        const yDomain = new Array<any>().concat(...yDomains);

        xAxis.domain = extent(xDomain) || xDomain;
        yAxis.domain = extent(yDomain) || yDomain;

        xAxis.update();
        yAxis.update();

        // The `xAxis` and `yAxis` have `.this` prefix on purpose here.
        const xAxisBBox = this.xAxis.getBBox();
        const yAxisBBox = this.yAxis.getBBox();

        // if (this.axisAutoPadding.left !== yAxisBBox.width) {
        //     this.axisAutoPadding.left = yAxisBBox.width;
        //     this.layoutPending = true;
        // }
        // if (this.axisAutoPadding.bottom !== xAxisBBox.height) {
        //     this.axisAutoPadding.bottom = xAxisBBox.height;
        //     this.layoutPending = true;
        // }

        if (this.axisAutoPadding.left !== yAxisBBox.width) {
            this.axisAutoPadding.left = yAxisBBox.width;
            this.layoutPending = true;
        }
        if (isHorizontal) {
            if (this.axisAutoPadding.bottom !== xAxisBBox.width) {
                this.axisAutoPadding.bottom = xAxisBBox.width;
                this.layoutPending = true;
            }
        } else {
            if (this.axisAutoPadding.bottom !== xAxisBBox.height) {
                this.axisAutoPadding.bottom = xAxisBBox.height;
                this.layoutPending = true;
            }
        }
    }
}
