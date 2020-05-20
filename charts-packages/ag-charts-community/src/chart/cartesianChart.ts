import { Chart } from "./chart";
import { numericExtent } from "../util/array";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxisPosition, ChartAxisDirection, ChartAxis } from "./chartAxis";
import { Series } from "./series/series";
import { BBox } from "../scene/bbox";
import { ClipRect } from "../scene/clipRect";
import { RangeSelector } from "./shapes/rangeSelector";

export class Navigator {
    private readonly rs = new RangeSelector();
    private chart: CartesianChart;

    private minHandleDragging = false;
    private maxHandleDragging = false;
    private panHandleOffset = NaN;

    set enabled(value: boolean) {
        this.rs.visible = value;
        this.chart.layoutPending = true;
    }
    get enabled(): boolean {
        return this.rs.visible;
    }

    set x(value: number) {
        this.rs.x = value;
    }
    get x(): number {
        return this.rs.x;
    }

    set y(value: number) {
        this.rs.y = value;
    }
    get y(): number {
        return this.rs.y;
    }

    set width(value: number) {
        this.rs.width = value;
    }
    get width(): number {
        return this.rs.width;
    }

    set height(value: number) {
        this.rs.height = value;
        this.chart.layoutPending = true;
    }
    get height(): number {
        return this.rs.height;
    }

    private _margin = 10;
    set margin(value: number) {
        this._margin = value;
        this.chart.layoutPending = true;
    }
    get margin(): number {
        return this._margin;
    }

    set min(value: number) {
        this.rs.min = value;
    }
    get min(): number {
        return this.rs.min;
    }

    set max(value: number) {
        this.rs.max = value;
    }
    get max(): number {
        return this.rs.max;
    }

    constructor(chart: CartesianChart) {
        this.chart = chart;

        chart.scene.root.append(this.rs);
        this.rs.onRangeChange = (min, max) => this.updateAxes(min, max);
    }

    updateAxes(min: number, max: number) {
        this.chart.axes.forEach(axis => {
            if (axis.direction === ChartAxisDirection.X) {
                axis.visibleRange = [min, max];
                axis.update();
            }
        });
        this.chart.series.forEach(series => series.update());
    }

    onMouseDown(event: MouseEvent) {
        const { offsetX, offsetY } = event;
        const { rs } = this;
        const { minHandle, maxHandle, x, width, min } = rs;
        const visibleRange = rs.computeVisibleRangeBBox();

        if (!(this.minHandleDragging || this.maxHandleDragging)) {
            if (minHandle.containsPoint(offsetX, offsetY)) {
                this.minHandleDragging = true;
            } else if (maxHandle.containsPoint(offsetX, offsetY)) {
                this.maxHandleDragging = true;
            } else if (visibleRange.containsPoint(offsetX, offsetY)) {
                this.panHandleOffset = (offsetX - x) / width - min;
            }
        }
    }

    onMouseMove(event: MouseEvent) {
        const { rs, panHandleOffset } = this;
        const { x, y, width, height, minHandle, maxHandle } = rs;
        const { style } = this.chart.element;
        const { offsetX, offsetY } = event;
        const minX = x + width * rs.min;
        const maxX = x + width * rs.max;
        const visibleRange = new BBox(minX, y, maxX - minX, height);

        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }

        if (minHandle.containsPoint(offsetX, offsetY)) {
            style.cursor = 'ew-resize';
        } else if (maxHandle.containsPoint(offsetX, offsetY)) {
            style.cursor = 'ew-resize';
        } else if (visibleRange.containsPoint(offsetX, offsetY)) {
            style.cursor = 'grab';
        } else {
            style.cursor = 'default';
        }

        if (this.minHandleDragging) {
            rs.min = getRatio();
        } else if (this.maxHandleDragging) {
            rs.max = getRatio();
        } else if (!isNaN(panHandleOffset)) {
            const span = rs.max - rs.min;
            const min = Math.min(getRatio() - panHandleOffset, 1 - span);
            if (min <= rs.min) { // pan left
                rs.min = min;
                rs.max = rs.min + span;
            } else { // pan right
                rs.max = min + span;
                rs.min = rs.max - span;
            }
        }
    }

    onMouseOut(event: MouseEvent) {
        this.stopHandleDragging();
    }

    onMouseUp(event: MouseEvent) {
        this.stopHandleDragging();
    }

    stopHandleDragging() {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    }
}

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type = 'cartesian';

    constructor(document = window.document) {
        super(document);

        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root.visible = false;

        const root = this.scene.root!;
        root.append(this.xAxesClip);
        root.append(this.seriesRoot);
        root.append(this.legend.group);
    }

    private _seriesRoot = new ClipRect();
    get seriesRoot(): ClipRect {
        return this._seriesRoot;
    }

    private xAxesClip = new ClipRect();

    readonly navigator = new Navigator(this);

    performLayout(): void {
        if (this.dataPending) {
            return;
        }

        this.scene.root.visible = true;

        const { width, height, axes, legend, navigator } = this;

        const shrinkRect = new BBox(0, 0, width, height);

        this.positionCaptions();
        this.positionLegend();

        if (legend.enabled && legend.data.length) {
            const { legendAutoPadding } = this;
            const legendPadding = this.legend.spacing;

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

        const { captionAutoPadding, padding } = this;

        this.updateAxes();

        shrinkRect.x += padding.left;
        shrinkRect.width -= padding.left + padding.right;

        shrinkRect.y += padding.top + captionAutoPadding;
        shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;

        if (navigator.enabled) {
            shrinkRect.height -= navigator.height + navigator.margin;
        }

        let bottomAxesHeight = 0;

        axes.forEach(axis => {
            axis.group.visible = true;
            const axisThickness = Math.floor(axis.computeBBox().width);
            switch (axis.position) {
                case ChartAxisPosition.Top:
                    shrinkRect.y += axisThickness;
                    shrinkRect.height -= axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + 1);
                    axis.label.mirrored = true;
                    break;
                case ChartAxisPosition.Right:
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x + shrinkRect.width);
                    axis.label.mirrored = true;
                    break;
                case ChartAxisPosition.Bottom:
                    shrinkRect.height -= axisThickness;
                    bottomAxesHeight += axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
                    break;
                case ChartAxisPosition.Left:
                    shrinkRect.x += axisThickness;
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x);
                    break;
            }
        });

        axes.forEach(axis => {
            switch (axis.position) {
                case ChartAxisPosition.Top:
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.range = [0, shrinkRect.width];
                    axis.gridLength = shrinkRect.height;
                    break;
                case ChartAxisPosition.Right:
                    axis.translation.y = Math.floor(shrinkRect.y);
                    if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    } else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.gridLength = shrinkRect.width;
                    break;
                case ChartAxisPosition.Bottom:
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.range = [0, shrinkRect.width];
                    axis.gridLength = shrinkRect.height;
                    break;
                case ChartAxisPosition.Left:
                    axis.translation.y = Math.floor(shrinkRect.y);
                    if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    } else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.gridLength = shrinkRect.width;
                    break;
            }
        });

        this.seriesRect = shrinkRect;
        this.series.forEach(series => {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxes` call
        });

        const { seriesRoot } = this;
        seriesRoot.x = shrinkRect.x;
        seriesRoot.y = shrinkRect.y;
        seriesRoot.width = shrinkRect.width;
        seriesRoot.height = shrinkRect.height;

        const { xAxesClip } = this;
        xAxesClip.x = shrinkRect.x;
        xAxesClip.y = 0;
        xAxesClip.width = shrinkRect.width;
        xAxesClip.height = height;

        if (navigator.enabled) {
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + bottomAxesHeight + navigator.margin;
            navigator.width = shrinkRect.width;
        }

        this.axes.forEach(axis => axis.update());
    }

    protected attachAxis(axis: ChartAxis) {
        if (axis.direction === ChartAxisDirection.X) {
            this.xAxesClip.appendChild(axis.group);
        } else {
            super.attachAxis(axis);
        }
    }

    protected detachAxis(axis: ChartAxis) {
        if (axis.direction === ChartAxisDirection.X) {
            this.xAxesClip.removeChild(axis.group);
        } else {
            super.detachAxis(axis);
        }
    }

    protected initSeries(series: Series) {
        super.initSeries(series);
        series.addEventListener('dataProcessed', this.updateAxes, this);
    }

    protected freeSeries(series: Series) {
        super.freeSeries(series);
        series.removeEventListener('dataProcessed', this.updateAxes, this);
    }

    protected onMouseDown(event: MouseEvent) {
        super.onMouseDown(event);
        this.navigator.onMouseDown(event);
    }

    protected onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        this.navigator.onMouseMove(event);
    }

    protected onMouseUp(event: MouseEvent) {
        super.onMouseUp(event);
        this.navigator.onMouseUp(event);
    }

    protected onMouseOut(event: MouseEvent) {
        super.onMouseOut(event);
        this.navigator.onMouseUp(event);
    }

    updateAxes() {
        this.axes.forEach(axis => {
            const { direction, boundSeries } = axis;

            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            } else {
                const domains: any[][] = [];
                boundSeries.filter(s => s.visible).forEach(series => {
                    domains.push(series.getDomain(direction));
                });

                const domain = new Array<any>().concat(...domains);
                axis.domain = numericExtent(domain) || domain; // if numeric extent can't be found, it's categories
            }

            axis.update();
        });
    }
}
