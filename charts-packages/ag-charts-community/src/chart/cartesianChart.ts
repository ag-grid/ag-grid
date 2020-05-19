import { Chart } from "./chart";
import { numericExtent } from "../util/array";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxisPosition, ChartAxisDirection, ChartAxis } from "./chartAxis";
import { Series } from "./series/series";
import { BBox } from "../scene/bbox";
import { ClipRect } from "../scene/clipRect";
import { RangeSelector } from "./shapes/rangeSelector";

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
        root.append(this.rangeSelector);

        this.rangeSelector.height = 30;
        this.rangeSelector.onRangeChange = (min, max) => {
            this.axes.forEach(axis => {
                if (axis.direction === ChartAxisDirection.X) {
                    axis.visibleRange = [min, max];
                    axis.update();
                }
            });
            this.series.forEach(series => series.update());
        };
    }

    private _seriesRoot = new ClipRect();
    get seriesRoot(): ClipRect {
        return this._seriesRoot;
    }

    readonly rangeSelector = new RangeSelector();
    private rangeSelectorMargin = 10;
    private xAxesClip = new ClipRect();

    performLayout(): void {
        if (this.dataPending) {
            return;
        }

        this.scene.root.visible = true;

        const { width, height, axes, legend, rangeSelector } = this;

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

        if (rangeSelector.visible) {
            shrinkRect.height -= rangeSelector.height + this.rangeSelectorMargin;
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

        if (rangeSelector.visible) {
            rangeSelector.x = shrinkRect.x;
            rangeSelector.y = shrinkRect.y + shrinkRect.height + bottomAxesHeight + this.rangeSelectorMargin;
            rangeSelector.width = shrinkRect.width;
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

    protected onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        this.onRangeSelectorMouseMove(event);
    }

    protected onRangeSelectorMouseMove(event: MouseEvent) {
        const { rangeSelector, panHandleOffset } = this;
        const { minHandle, maxHandle } = rangeSelector;
        const { style } = this.element;
        const { offsetX, offsetY } = event;
        const { x, y, width, height } = rangeSelector;
        const minX = x + width * rangeSelector.min;
        const maxX = x + width * rangeSelector.max;
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
            rangeSelector.min = getRatio();
        } else if (this.maxHandleDragging) {
            rangeSelector.max = getRatio();
        } else if (!isNaN(panHandleOffset)) {
            const span = rangeSelector.max - rangeSelector.min;
            const min = Math.min(getRatio() - panHandleOffset, 1 - span);
            if (min <= rangeSelector.min) { // pan left
                rangeSelector.min = min;
                rangeSelector.max = rangeSelector.min + span;
            } else { // pan right
                rangeSelector.max = min + span;
                rangeSelector.min = rangeSelector.max - span;
            }
        }
    }

    private _onMouseDown: any;
    private _onMouseUp: any;

    private minHandleDragging = false;
    private maxHandleDragging = false;
    private panHandleOffset = NaN;

    protected onMouseDown(event: MouseEvent) {
        const { offsetX, offsetY } = event;
        const { rangeSelector } = this;
        const { minHandle, maxHandle, x, width, min } = rangeSelector;
        const visibleRange = rangeSelector.computeVisibleRangeBBox();

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

    protected onMouseOut(event: MouseEvent) {
        super.onMouseOut(event);
        this.stopHandleDragging();
    }

    protected onMouseUp(event: MouseEvent) {
        this.stopHandleDragging();
    }

    protected stopHandleDragging() {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    }

    protected setupDomListeners(chartElement: HTMLCanvasElement) {
        super.setupDomListeners(chartElement);

        this._onMouseDown = this.onMouseDown.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mouseup', this._onMouseUp);
    }

    protected cleanupDomListeners(chartElement: HTMLCanvasElement) {
        super.cleanupDomListeners(chartElement);

        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
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
