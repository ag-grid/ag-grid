import { Chart } from './chart';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxis, ChartAxisPosition, ChartAxisDirection } from './chartAxis';
import { BBox } from '../scene/bbox';
import { ClipRect } from '../scene/clipRect';
import { Navigator } from './navigator/navigator';

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type: 'cartesian' | 'groupedCategory' = 'cartesian';

    constructor(document = window.document, overrideDevicePixelRatio?: number) {
        super(document, overrideDevicePixelRatio);

        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root!!.visible = false;

        const root = this.scene.root!;
        root.append(this.seriesRoot);
        root.append(this.legend.group);

        this.navigator.enabled = false;
    }

    readonly seriesRoot = new ClipRect();
    readonly navigator = new Navigator(this);

    async performLayout() {
        this.scene.root!.visible = true;

        const { width, height, legend, navigator } = this;

        let shrinkRect = new BBox(0, 0, width, height);

        const { captionAutoPadding = 0 } = this.positionCaptions();
        this.positionLegend(captionAutoPadding);

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

        const { padding } = this;
        shrinkRect.x += padding.left;
        shrinkRect.width -= padding.left + padding.right;

        shrinkRect.y += padding.top + captionAutoPadding;
        shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;

        if (navigator.enabled) {
            const navigatorTotalHeight = navigator.height + navigator.margin;
            shrinkRect.height -= navigatorTotalHeight;
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + navigator.margin;
            navigator.width = shrinkRect.width;
        }

        const { seriesRect } = this.updateAxes(shrinkRect);

        this.seriesRect = seriesRect;
        this.series.forEach((series) => {
            series.group.translationX = Math.floor(seriesRect.x);
            series.group.translationY = Math.floor(seriesRect.y);
        });

        const { seriesRoot } = this;
        seriesRoot.x = seriesRect.x;
        seriesRoot.y = seriesRect.y;
        seriesRoot.width = seriesRect.width;
        seriesRoot.height = seriesRect.height;
    }

    private _onTouchStart: any;
    private _onTouchMove: any;
    private _onTouchEnd: any;
    private _onTouchCancel: any;

    protected setupDomListeners(chartElement: HTMLCanvasElement) {
        super.setupDomListeners(chartElement);

        this._onTouchStart = this.onTouchStart.bind(this);
        this._onTouchMove = this.onTouchMove.bind(this);
        this._onTouchEnd = this.onTouchEnd.bind(this);
        this._onTouchCancel = this.onTouchCancel.bind(this);

        chartElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
        chartElement.addEventListener('touchmove', this._onTouchMove, { passive: true });
        chartElement.addEventListener('touchend', this._onTouchEnd, { passive: true });
        chartElement.addEventListener('touchcancel', this._onTouchCancel, { passive: true });
    }

    protected cleanupDomListeners(chartElement: HTMLCanvasElement) {
        super.cleanupDomListeners(chartElement);

        chartElement.removeEventListener('touchstart', this._onTouchStart);
        chartElement.removeEventListener('touchmove', this._onTouchMove);
        chartElement.removeEventListener('touchend', this._onTouchEnd);
        chartElement.removeEventListener('touchcancel', this._onTouchCancel);
    }

    private getTouchOffset(event: TouchEvent): { offsetX: number; offsetY: number } | undefined {
        const rect = this.scene.canvas.element.getBoundingClientRect();
        const touch = event.touches[0];
        return touch
            ? {
                  offsetX: touch.clientX - rect.left,
                  offsetY: touch.clientY - rect.top,
              }
            : undefined;
    }

    protected onTouchStart(event: TouchEvent) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDragStart(offset);
        }
    }

    protected onTouchMove(event: TouchEvent) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDrag(offset);
        }
    }

    protected onTouchEnd(_event: TouchEvent) {
        this.navigator.onDragStop();
    }

    protected onTouchCancel(_event: TouchEvent) {
        this.navigator.onDragStop();
    }

    protected onMouseDown(event: MouseEvent) {
        super.onMouseDown(event);
        this.navigator.onDragStart(event);
    }

    protected onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        this.navigator.onDrag(event);
    }

    protected onMouseUp(event: MouseEvent) {
        super.onMouseUp(event);
        this.navigator.onDragStop();
    }

    protected onMouseOut(event: MouseEvent) {
        super.onMouseOut(event);
        this.navigator.onDragStop();
    }

    private _lastAxisWidths: Partial<Record<ChartAxisPosition, number>> = {
        [ChartAxisPosition.Top]: 0,
        [ChartAxisPosition.Bottom]: 0,
        [ChartAxisPosition.Left]: 0,
        [ChartAxisPosition.Right]: 0,
    };
    updateAxes(inputShrinkRect: BBox) {
        // Start with a good approximation from the last update - this should mean that in many resize
        // cases that only a single pass is needed \o/.
        const axisWidths = { ...this._lastAxisWidths };

        // Clean any positions which aren't valid with the current axis status (otherwise we end up
        // never being able to find a stable result).
        const liveAxisWidths = new Set(this._axes.map((a) => a.position));
        for (const position of Object.keys(axisWidths) as ChartAxisPosition[]) {
            if (!liveAxisWidths.has(position)) {
                delete axisWidths[position];
            }
        }

        const stableWidths = <T extends typeof axisWidths>(other: T) => {
            return Object.entries(axisWidths).every(([p, w]) => {
                const otherW = (other as any)[p];
                if (w != null || otherW != null) {
                    return w === otherW;
                }
                return true;
            });
        };
        const ceilValues = <T extends Record<string, number | undefined>>(records: T) => {
            return Object.entries(records).reduce((out, [key, value]) => {
                if (value && Math.abs(value) === Infinity) {
                    value = 0;
                }
                out[key] = value != null ? Math.ceil(value) : value;
                return out;
            }, {} as any);
        };

        // Iteratively try to resolve axis widths - since X axis width affects Y axis range,
        // and vice-versa, we need to iteratively try and find a fit for the axes and their
        // ticks/labels.
        let lastPass: typeof axisWidths = {};
        let clipSeries = false;
        let seriesRect = this.seriesRect?.clone();
        let count = 0;
        do {
            Object.assign(axisWidths, lastPass);

            const result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPass = ceilValues(result.axisWidths);
            clipSeries = result.clipSeries;
            seriesRect = result.seriesRect;

            if (count++ > 10) {
                console.warn('AG Charts - unable to find stable axis layout.');
                break;
            }
        } while (!stableWidths(lastPass));

        this.seriesRoot.enabled = clipSeries;
        this._lastAxisWidths = axisWidths;

        return { seriesRect };
    }

    private updateAxesPass(
        axisWidths: Partial<Record<ChartAxisPosition, number>>,
        bounds: BBox,
        lastPassSeriesRect?: BBox
    ) {
        const { axes } = this;
        const visited: Partial<Record<ChartAxisPosition, number>> = {};
        const newAxisWidths: Partial<Record<ChartAxisPosition, number>> = {};

        let clipSeries = false;
        let primaryTickCounts: Partial<Record<ChartAxisDirection, number>> = {};

        const crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
        const axisBound = this.buildAxisBound(bounds, crossLinePadding);
        const seriesRect = this.buildSeriesRect(axisBound, axisWidths);

        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            const { position } = axis;

            let {
                clipSeries: newClipSeries,
                axisThickness,
                axisOffset,
            } = this.calculateAxisDimensions({
                axis,
                seriesRect,
                axisWidths,
                newAxisWidths,
                primaryTickCounts,
                clipSeries,
                addInterAxisPadding: (visited[position] ?? 0) > 0,
            });

            visited[position] = (visited[position] ?? 0) + 1;
            clipSeries = clipSeries || newClipSeries;

            this.positionAxis({
                axis,
                axisBound,
                axisOffset,
                axisThickness,
                axisWidths,
                primaryTickCounts,
                seriesRect,
            });
        });

        return { clipSeries, seriesRect, axisWidths: newAxisWidths };
    }

    private buildCrossLinePadding(lastPassSeriesRect: BBox, axisWidths: Partial<Record<ChartAxisPosition, number>>) {
        const crossLinePadding: Partial<Record<ChartAxisPosition, number>> = {};

        this.axes.forEach((axis) => {
            if (axis.crossLines) {
                axis.crossLines.forEach((crossLine) => {
                    crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
                });
            }
        });
        // Reduce cross-line padding to account for overlap with axes.
        for (const [side, padding = 0] of Object.entries(crossLinePadding) as [ChartAxisPosition, number][]) {
            crossLinePadding[side] = Math.max(padding - (axisWidths[side] ?? 0), 0);
        }

        return crossLinePadding;
    }

    private buildAxisBound(bounds: BBox, crossLinePadding: Partial<Record<ChartAxisPosition, number>>) {
        const result = bounds.clone();
        const { top = 0, right = 0, bottom = 0, left = 0 } = crossLinePadding;
        result.x += left;
        result.y += top;
        result.width -= left + right;
        result.height -= top + bottom;
        return result;
    }

    private buildSeriesRect(axisBound: BBox, axisWidths: Partial<Record<ChartAxisPosition, number>>) {
        let result = axisBound.clone();
        const { top, bottom, left, right } = axisWidths;
        result.x += left ?? 0;
        result.y += top ?? 0;
        result.width -= (left ?? 0) + (right ?? 0);
        result.height -= (top ?? 0) + (bottom ?? 0);

        // Width and height should not be negative.
        result.width = Math.max(0, result.width);
        result.height = Math.max(0, result.height);

        return result;
    }

    private clampToOutsideSeriesRect(seriesRect: BBox, value: number, dimension: 'x' | 'y', direction: -1 | 1) {
        const { x, y, width, height } = seriesRect;
        const clampBounds = [x, y, x + width, y + height];
        const fn = direction === 1 ? Math.min : Math.max;
        const compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];

        return fn(value, compareTo);
    }

    private calculateAxisDimensions(opts: {
        axis: ChartAxis;
        seriesRect: BBox;
        axisWidths: Partial<Record<ChartAxisPosition, number>>;
        newAxisWidths: Partial<Record<ChartAxisPosition, number>>;
        primaryTickCounts: Partial<Record<ChartAxisDirection, number>>;
        clipSeries: boolean;
        addInterAxisPadding: boolean;
    }) {
        const { axis, seriesRect, axisWidths, newAxisWidths, primaryTickCounts, addInterAxisPadding } = opts;
        let { clipSeries } = opts;
        const { navigator } = this;
        const { position, direction } = axis;

        const axisLeftRightRange = (axis: ChartAxis<any>) => {
            if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };

        axis.label.mirrored = ['top', 'right'].includes(position);

        const axisOffset = newAxisWidths[position] ?? 0;
        switch (position) {
            case ChartAxisPosition.Top:
            case ChartAxisPosition.Bottom:
                axis.range = [0, seriesRect.width];
                axis.gridLength = seriesRect.height;
                break;
            case ChartAxisPosition.Right:
            case ChartAxisPosition.Left:
                axis.range = axisLeftRightRange(axis);
                axis.gridLength = seriesRect.width;
                break;
        }

        if (axis.direction === ChartAxisDirection.X) {
            let { min, max, enabled } = navigator;
            if (enabled) {
                axis.visibleRange = [min, max];
            } else {
                axis.visibleRange = [0, 1];
            }
        }
        if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
            clipSeries = true;
        }

        let primaryTickCount = axis.nice ? primaryTickCounts[direction] : undefined;
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = primaryTickCounts[direction] ?? primaryTickCount;

        let axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        } else {
            const bbox = axis.computeBBox();
            axisThickness = direction === ChartAxisDirection.X ? bbox.height : bbox.width;
        }

        // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
        const axisPadding = 15;
        if (addInterAxisPadding) {
            axisThickness += axisPadding;
        }
        axisThickness = Math.ceil(axisThickness);
        newAxisWidths[position] = (newAxisWidths[position] ?? 0) + axisThickness;

        axis.gridPadding = (axisWidths[position] ?? 0) - (newAxisWidths[position] ?? 0);

        return { clipSeries, axisThickness, axisOffset };
    }

    private positionAxis(opts: {
        axis: ChartAxis;
        axisBound: BBox;
        axisWidths: Partial<Record<ChartAxisPosition, number>>;
        primaryTickCounts: Partial<Record<ChartAxisDirection, number>>;
        seriesRect: BBox;
        axisOffset: number;
        axisThickness: number;
    }) {
        const { axis, axisBound, axisWidths, seriesRect, axisOffset, axisThickness } = opts;
        const { position } = axis;

        switch (position) {
            case ChartAxisPosition.Top:
                axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                axis.translation.y = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.y + 1 + axisOffset + axisThickness,
                    'y',
                    1
                );
                break;
            case ChartAxisPosition.Bottom:
                axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                axis.translation.y = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.y + axisBound.height + 1 - axisThickness - axisOffset,
                    'y',
                    -1
                );
                break;
            case ChartAxisPosition.Left:
                axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                axis.translation.x = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.x + axisOffset + axisThickness,
                    'x',
                    1
                );
                break;
            case ChartAxisPosition.Right:
                axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                axis.translation.x = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.x + axisBound.width - axisThickness - axisOffset,
                    'x',
                    -1
                );
                break;
        }

        axis.updatePosition();
    }
}
