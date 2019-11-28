import { Chart } from "./chart";
import { numericExtent } from "../util/array";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { reactive } from "../util/observable";
import { ChartAxis, ChartAxisPosition } from "./chartAxis";
import { Series } from "./series/series";

/** Defines the orientation used when rendering data series */
export enum CartesianChartLayout {
    Vertical,
    Horizontal
}

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    protected axisAutoPadding = new Padding();

    @reactive(['layoutChange']) flipXY = false;

    constructor(document = window.document) {
        super(document);

        const root = this.scene.root!;
        root.append(this._seriesRoot);
        root.append(this.legend.group);
    }

    private _seriesRoot = new Group();
    get seriesRoot(): Group {
        return this._seriesRoot;
    }

    performLayout(): void {
        if (this.dataPending) {
            return;
        }

        const { width, height, axes, legend } = this;

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

        const { captionAutoPadding, padding, axisAutoPadding } = this;

        shrinkRect.x += padding.left + axisAutoPadding.left;
        shrinkRect.y += padding.top + axisAutoPadding.top + captionAutoPadding;
        shrinkRect.width -= padding.left + padding.right + axisAutoPadding.left + axisAutoPadding.right;
        shrinkRect.height -= padding.top + padding.bottom + axisAutoPadding.top + axisAutoPadding.bottom + captionAutoPadding;

        axes.forEach(axis => {
            switch (axis.position) {
                case ChartAxisPosition.Top:
                    axis.scale.range = [0, shrinkRect.width];
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y + 1);
                    axis.label.mirrored = true;
                    axis.gridLength = shrinkRect.height;
                    break;
                case ChartAxisPosition.Right:
                    if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                        axis.scale.range = [0, shrinkRect.height];
                    } else {
                        axis.scale.range = [shrinkRect.height, 0];
                    }
                    axis.translation.x = Math.floor(shrinkRect.x + shrinkRect.width + 1);
                    axis.translation.y = Math.floor(shrinkRect.y);
                    axis.label.mirrored = true;
                    axis.gridLength = shrinkRect.width;
                    break;
                case ChartAxisPosition.Bottom:
                    axis.scale.range = [0, shrinkRect.width];
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
                    axis.gridLength = shrinkRect.height;
                    break;
                case ChartAxisPosition.Left:
                    if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                        axis.scale.range = [0, shrinkRect.height];
                    } else {
                        axis.scale.range = [shrinkRect.height, 0];
                    }
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.translation.y = Math.floor(shrinkRect.y);
                    axis.gridLength = shrinkRect.width;
                    break;
            }
        });

        this.updateAxes();

        // The calls above may schedule another layout, if the chart doesn't have enough padding
        // to render axis labels, chart captions or the legend.
        // In this case, we can skip updating the series on this layout run,
        // since they will be updated later anyway.
        if (this.layoutPending) {
            this.scene.computeTransform();
            return;
        }

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

    private _updateAxes = this.updateAxes.bind(this);

    protected initSeries(series: Series) {
        super.initSeries(series);
        series.addEventListener('dataProcessed', this._updateAxes);
    }

    protected freeSeries(series: Series) {
        super.freeSeries(series);
        series.removeEventListener('dataProcessed', this._updateAxes);
    }

    updateAxes() {
        const axes = this.axes.filter(a => !a.linkedTo);
        const linkedAxes = this.axes.filter(a => a.linkedTo);

        axes.concat(linkedAxes).forEach(axis => {
            const { direction, position, boundSeries } = axis;

            const domains: any[][] = [];
            boundSeries.filter(s => s.visible).forEach(series => {
                domains.push(series.getDomain(direction));
            });

            const domain = new Array<any>().concat(...domains);
            axis.domain = numericExtent(domain) || domain; // if extent can't be found, it's categories

            const axisThickness = Math.floor(axis.computeBBox().width);

            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            }

            switch (position) {
                case ChartAxisPosition.Left:
                    if (this.axisAutoPadding.left !== axisThickness) {
                        this.axisAutoPadding.left = axisThickness;
                        this.layoutPending = true;
                    }
                    break;
                case ChartAxisPosition.Right:
                    if (this.axisAutoPadding.right !== axisThickness) {
                        this.axisAutoPadding.right = axisThickness;
                        this.layoutPending = true;
                    }
                    break;
                case ChartAxisPosition.Bottom:
                    if (this.axisAutoPadding.bottom !== axisThickness) {
                        this.axisAutoPadding.bottom = axisThickness;
                        this.layoutPending = true;
                    }
                    break;
                case ChartAxisPosition.Top:
                    if (this.axisAutoPadding.top !== axisThickness) {
                        this.axisAutoPadding.top = axisThickness;
                        this.layoutPending = true;
                    }
                    break;
            }

            axis.update();
        });

        this.axes.forEach(axis => {
            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            }
        });
    }
}
